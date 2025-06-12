import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    },
});

export interface SearchParams {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
}

export async function searchProducts(params: SearchParams) {
    const { query = '', category = '', page = 1, limit = 12 } = params;

    try {
        const searchBody: any = {
            query: {
                bool: {
                    must: [],
                    filter: [],
                },
            },
            sort: [
                { _score: { order: 'desc' } },
                { created_at: { order: 'desc' } },
            ],
            from: (page - 1) * limit,
            size: limit,
            highlight: {
                fields: {
                    name: {},
                    description: {},
                },
            },
        };

        // Add text search
        if (query) {
            searchBody.query.bool.must.push({
                multi_match: {
                    query,
                    fields: ['name^3', 'description^2', 'category', 'tags'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                },
            });
        } else {
            searchBody.query.bool.must.push({ match_all: {} });
        }

        // Add category filter
        if (category) {
            searchBody.query.bool.filter.push({
                term: { 'category.keyword': category },
            });
        }

        // Add availability filter
        searchBody.query.bool.filter.push({
            term: { in_stock: true },
        });

        const response = await client.search({
            index: 'products',
            body: searchBody,
        });

        const products = response.hits.hits.map((hit: any) => ({
            id: hit._id,
            ...hit._source,
            score: hit._score,
            highlights: hit.highlight,
        }));

        return {
            products,
            total: response.hits.total,
            aggregations: response.aggregations,
        };
    } catch (error) {
        console.error('Elasticsearch search error:', error);
        throw new Error('Search failed');
    }
}

export async function getSuggestions(query: string) {
    try {
        const response = await client.search({
            index: 'products',
            body: {
                suggest: {
                    product_suggest: {
                        prefix: query,
                        completion: {
                            field: 'suggest',
                            size: 5,
                        },
                    },
                },
            } as {
                [key: string]: any;
            },
        });

        const suggestion = response.suggest?.product_suggest[0].options;
        return Array.isArray(suggestion)
            ? suggestion?.map((option: any) => option.text)
            : suggestion?.text;
    } catch (error) {
        console.error('Elasticsearch suggestions error:', error);
        return [];
    }
}

export async function indexProduct(product: any) {
    try {
        const response = await client.index({
            index: 'products',
            body: {
                ...product,
                created_at: new Date(),
                suggest: {
                    input: [product.name, ...(product.tags || [])],
                    weight: product.popularity || 1,
                },
            },
        });

        return { id: response._id, ...product };
    } catch (error) {
        console.error('Elasticsearch indexing error:', error);
        throw new Error('Failed to index product');
    }
}

export async function createProductIndex() {
    try {
        const indexExists = await client.indices.exists({ index: 'products' });

        if (!indexExists) {
            await client.indices.create({
                index: 'products',
                mappings: {
                    properties: {
                        name: { type: 'text', analyzer: 'standard' },
                        description: { type: 'text', analyzer: 'standard' },
                        category: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' },
                            },
                        },
                        price: { type: 'float' },
                        rating: { type: 'float' },
                        in_stock: { type: 'boolean' },
                        tags: { type: 'keyword' },
                        created_at: { type: 'date' },
                        suggest: {
                            type: 'completion',
                            analyzer: 'simple',
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50,
                        },
                    },
                },
            });
        }
    } catch (error) {
        console.error('Error creating product index:', error);
    }
}
