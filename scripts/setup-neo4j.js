const neo4j = require("neo4j-driver")

const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(process.env.NEO4J_USERNAME || "neo4j", process.env.NEO4J_PASSWORD || "password"),
)

async function setupNeo4j() {
  const session = driver.session()

  try {
    console.log("Setting up Neo4j database...")

    // Create constraints
    await session.run(`
      CREATE CONSTRAINT product_id IF NOT EXISTS
      FOR (p:Product) REQUIRE p.id IS UNIQUE
    `)

    await session.run(`
      CREATE CONSTRAINT user_id IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `)

    await session.run(`
      CREATE CONSTRAINT category_name IF NOT EXISTS
      FOR (c:Category) REQUIRE c.name IS UNIQUE
    `)

    // Create sample data
    const sampleData = [
      {
        id: "prod1",
        name: "Wireless Headphones",
        category: "Electronics",
        price: 199.99,
        rating: 4.5,
      },
      {
        id: "prod2",
        name: "Smart Watch",
        category: "Electronics",
        price: 299.99,
        rating: 4.3,
      },
      {
        id: "prod3",
        name: "Running Shoes",
        category: "Sports",
        price: 129.99,
        rating: 4.7,
      },
    ]

    for (const product of sampleData) {
      await session.run(
        `
        MERGE (p:Product {id: $id})
        SET p.name = $name,
            p.category = $category,
            p.price = $price,
            p.rating = $rating
      `,
        product,
      )

      await session.run(
        `
        MATCH (p:Product {id: $id})
        MERGE (c:Category {name: $category})
        MERGE (p)-[:BELONGS_TO]->(c)
      `,
        { id: product.id, category: product.category },
      )
    }

    // Create similarity relationships
    await session.run(`
      MATCH (p1:Product), (p2:Product)
      WHERE p1.category = p2.category 
        AND p1.id <> p2.id
        AND abs(p1.price - p2.price) < (p1.price * 0.3)
      MERGE (p1)-[:SIMILAR_TO]-(p2)
    `)

    console.log("Neo4j setup completed successfully!")
  } catch (error) {
    console.error("Neo4j setup error:", error)
  } finally {
    await session.close()
    await driver.close()
  }
}

setupNeo4j()
