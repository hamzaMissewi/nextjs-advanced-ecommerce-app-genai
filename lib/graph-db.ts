import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USERNAME || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
    )
);

export async function getProductRecommendations(productId: string, limit = 5) {
    const session = driver.session();

    try {
        const result = await session.run(
            `
      MATCH (p:Product {id: $productId})-[:SIMILAR_TO|BOUGHT_TOGETHER*1..2]-(rec:Product)
      WHERE rec.id <> $productId
      RETURN DISTINCT rec, 
             COUNT(*) as strength
      ORDER BY strength DESC
      LIMIT $limit
    `,
            { productId, limit }
        );

        return result.records.map((record) => ({
            ...record.get('rec').properties,
            recommendationStrength: record.get('strength').toNumber(),
        }));
    } catch (error) {
        console.error('Graph DB recommendation error:', error);
        return [];
    } finally {
        await session.close();
    }
}

export async function createProductRelationships(product: any) {
    const session = driver.session();

    try {
        // Create product node
        await session.run(
            `
      MERGE (p:Product {id: $id})
      SET p.name = $name,
          p.category = $category,
          p.price = $price,
          p.rating = $rating
    `,
            product
        );

        // Create category relationships
        await session.run(
            `
      MATCH (p:Product {id: $id})
      MERGE (c:Category {name: $category})
      MERGE (p)-[:BELONGS_TO]->(c)
    `,
            { id: product.id, category: product.category }
        );

        // Create similarity relationships based on category and price range
        await session.run(
            `
      MATCH (p1:Product {id: $id})
      MATCH (p2:Product)
      WHERE p1.category = p2.category 
        AND p1.id <> p2.id
        AND abs(p1.price - p2.price) < (p1.price * 0.3)
      MERGE (p1)-[:SIMILAR_TO]-(p2)
    `,
            { id: product.id }
        );
    } catch (error) {
        console.error('Graph DB relationship creation error:', error);
    } finally {
        await session.close();
    }
}

export async function trackUserBehavior(
    userId: string,
    productId: string,
    action: string
) {
    const session = driver.session();

    try {
        await session.run(
            `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId})
      CREATE (u)-[:${action.toUpperCase()} {timestamp: datetime()}]->(p)
    `,
            { userId, productId }
        );

        // Create "bought together" relationships
        if (action === 'PURCHASED') {
            await session.run(
                `
        MATCH (u:User {id: $userId})-[:PURCHASED]->(p1:Product)
        MATCH (u)-[:PURCHASED]->(p2:Product)
        WHERE p1.id <> p2.id
        MERGE (p1)-[:BOUGHT_TOGETHER]-(p2)
      `,
                { userId }
            );
        }
    } catch (error) {
        console.error('Graph DB behavior tracking error:', error);
    } finally {
        await session.close();
    }
}

export async function closeConnection() {
    await driver.close();
}
