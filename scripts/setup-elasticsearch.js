const { Client } = require("@elastic/elasticsearch")

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || "elastic",
    password: process.env.ELASTICSEARCH_PASSWORD || "changeme",
  },
})

async function setupElasticsearch() {
  try {
    console.log("Setting up Elasticsearch...")

    // Create products index
    const indexExists = await client.indices.exists({ index: "products" })

    if (!indexExists.body) {
      await client.indices.create({
        index: "products",
        body: {
          mappings: {
            properties: {
              name: { type: "text", analyzer: "standard" },
              description: { type: "text", analyzer: "standard" },
              category: {
                type: "text",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              price: { type: "float" },
              rating: { type: "float" },
              in_stock: { type: "boolean" },
              tags: { type: "keyword" },
              created_at: { type: "date" },
              suggest: {
                type: "completion",
                analyzer: "simple",
                preserve_separators: true,
                preserve_position_increments: true,
                max_input_length: 50,
              },
            },
          },
        },
      })
      console.log("Products index created successfully")
    }

    // Seed sample data
    const sampleProducts = [
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        category: "Electronics",
        price: 199.99,
        rating: 4.5,
        in_stock: true,
        tags: ["audio", "wireless", "headphones"],
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Smart Watch",
        description: "Feature-rich smartwatch with health tracking",
        category: "Electronics",
        price: 299.99,
        rating: 4.3,
        in_stock: true,
        tags: ["wearable", "smart", "fitness"],
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Running Shoes",
        description: "Comfortable running shoes for all terrains",
        category: "Sports",
        price: 129.99,
        rating: 4.7,
        in_stock: true,
        tags: ["shoes", "running", "sports"],
        image: "/placeholder.svg?height=300&width=300",
      },
    ]

    for (const product of sampleProducts) {
      await client.index({
        index: "products",
        body: {
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date(),
          suggest: {
            input: [product.name, ...product.tags],
            weight: 1,
          },
        },
      })
    }

    console.log("Sample products indexed successfully")
    console.log("Elasticsearch setup completed!")
  } catch (error) {
    console.error("Elasticsearch setup error:", error)
  }
}

setupElasticsearch()
