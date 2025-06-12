import {
  PrismaClient,
  UserRole,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethod,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: {},
    create: {
      email: "admin@ecommerce.com",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create test customer
  const customerPassword = await bcrypt.hash("customer123", 12)
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "John Doe",
      password: customerPassword,
      role: UserRole.CUSTOMER,
    },
  })

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
      image: "/placeholder.svg?height=200&width=200",
    },
  })

  const smartphones = await prisma.category.upsert({
    where: { slug: "smartphones" },
    update: {},
    create: {
      name: "Smartphones",
      slug: "smartphones",
      description: "Mobile phones and accessories",
      parentId: electronics.id,
    },
  })

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      image: "/placeholder.svg?height=200&width=200",
    },
  })

  const books = await prisma.category.upsert({
    where: { slug: "books" },
    update: {},
    create: {
      name: "Books",
      slug: "books",
      description: "Books and literature",
      image: "/placeholder.svg?height=200&width=200",
    },
  })

  // Create products
  const products = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "Latest iPhone with advanced features and powerful performance",
      shortDesc: "Premium smartphone with Pro camera system",
      sku: "IPH15PRO001",
      price: 999.99,
      comparePrice: 1099.99,
      stock: 50,
      categoryId: smartphones.id,
      status: ProductStatus.ACTIVE,
      tags: ["smartphone", "apple", "premium"],
      images: [
        { url: "/placeholder.svg?height=400&width=400", alt: "iPhone 15 Pro front view", position: 0 },
        { url: "/placeholder.svg?height=400&width=400", alt: "iPhone 15 Pro back view", position: 1 },
      ],
      variants: [
        { name: "Storage", value: "128GB", price: 999.99, stock: 20, sku: "IPH15PRO128" },
        { name: "Storage", value: "256GB", price: 1099.99, stock: 15, sku: "IPH15PRO256" },
        { name: "Storage", value: "512GB", price: 1299.99, stock: 10, sku: "IPH15PRO512" },
      ],
    },
    {
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      description: "Flagship Android smartphone with AI-powered features",
      shortDesc: "Advanced Android smartphone with Galaxy AI",
      sku: "SGS24001",
      price: 799.99,
      stock: 75,
      categoryId: smartphones.id,
      status: ProductStatus.ACTIVE,
      tags: ["smartphone", "samsung", "android"],
      images: [{ url: "/placeholder.svg?height=400&width=400", alt: "Galaxy S24 front view", position: 0 }],
    },
    {
      name: 'MacBook Pro 14"',
      slug: "macbook-pro-14",
      description: "Professional laptop with M3 chip for demanding workflows",
      shortDesc: "Powerful laptop for professionals",
      sku: "MBP14M3001",
      price: 1999.99,
      stock: 25,
      categoryId: electronics.id,
      status: ProductStatus.ACTIVE,
      tags: ["laptop", "apple", "professional"],
      images: [{ url: "/placeholder.svg?height=400&width=400", alt: "MacBook Pro 14 inch", position: 0 }],
    },
    {
      name: "Premium Cotton T-Shirt",
      slug: "premium-cotton-tshirt",
      description: "Comfortable and stylish cotton t-shirt for everyday wear",
      shortDesc: "Soft cotton t-shirt",
      sku: "TSHIRT001",
      price: 29.99,
      stock: 100,
      categoryId: clothing.id,
      status: ProductStatus.ACTIVE,
      tags: ["clothing", "cotton", "casual"],
      images: [{ url: "/placeholder.svg?height=400&width=400", alt: "Cotton T-Shirt", position: 0 }],
      variants: [
        { name: "Size", value: "S", stock: 25 },
        { name: "Size", value: "M", stock: 30 },
        { name: "Size", value: "L", stock: 25 },
        { name: "Size", value: "XL", stock: 20 },
      ],
    },
    {
      name: "The Great Gatsby",
      slug: "the-great-gatsby",
      description: "Classic American novel by F. Scott Fitzgerald",
      shortDesc: "Timeless American classic",
      sku: "BOOK001",
      price: 12.99,
      stock: 200,
      categoryId: books.id,
      status: ProductStatus.ACTIVE,
      tags: ["book", "classic", "literature"],
      images: [{ url: "/placeholder.svg?height=400&width=400", alt: "The Great Gatsby book cover", position: 0 }],
    },
  ]

  for (const productData of products) {
    const { images, variants, ...productInfo } = productData

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productInfo,
        images: {
          create: images,
        },
        variants: variants
          ? {
              create: variants,
            }
          : undefined,
      },
    })

    console.log(`Created product: ${product.name}`)
  }

  // Create customer address
  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      phone: "+1234567890",
      isDefault: true,
    },
  })

  // Create sample order
  const order = await prisma.order.create({
    data: {
      orderNumber: "ORD-001",
      userId: customer.id,
      shippingAddressId: address.id,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCEEDED,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      subtotal: 1029.98,
      taxAmount: 82.4,
      shippingAmount: 9.99,
      total: 1122.37,
      shippingMethod: "Standard Shipping",
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: "iphone-15-pro" } }))!.id,
            quantity: 1,
            price: 999.99,
            total: 999.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: "premium-cotton-tshirt" } }))!.id,
            quantity: 1,
            price: 29.99,
            total: 29.99,
          },
        ],
      },
      payments: {
        create: {
          amount: 1122.37,
          currency: "usd",
          status: PaymentStatus.SUCCEEDED,
          method: PaymentMethod.STRIPE,
          stripePaymentId: "pi_test_123456789",
        },
      },
    },
  })

  // Add items to customer's cart
  await prisma.cartItem.createMany({
    data: [
      {
        userId: customer.id,
        productId: (await prisma.product.findFirst({ where: { slug: "samsung-galaxy-s24" } }))!.id,
        quantity: 1,
      },
      {
        userId: customer.id,
        productId: (await prisma.product.findFirst({ where: { slug: "the-great-gatsby" } }))!.id,
        quantity: 2,
      },
    ],
  })

  console.log("✅ Database seeded successfully!")
  console.log(`👤 Admin user: admin@ecommerce.com / admin123`)
  console.log(`👤 Customer user: customer@example.com / customer123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
