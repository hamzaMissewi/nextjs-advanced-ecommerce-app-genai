import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPaymentIntent } from "@/lib/stripe"
import { OrderStatus, PaymentStatus, FulfillmentStatus, PaymentMethod } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const skip = (page - 1) * limit

    const where = userId ? { userId } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          shippingAddress: true,
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items, shippingAddressId, shippingMethod } = await request.json()

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const itemTotal = Number(product.price) * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      })
    }

    const taxAmount = subtotal * 0.08 // 8% tax
    const shippingAmount = subtotal > 100 ? 0 : 9.99 // Free shipping over $100
    const total = subtotal + taxAmount + shippingAmount

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(total, "usd", {
      orderNumber,
      userId,
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        shippingAddressId,
        shippingMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        subtotal,
        taxAmount,
        shippingAmount,
        total,
        items: {
          create: orderItems,
        },
        payments: {
          create: {
            amount: total,
            currency: "usd",
            status: PaymentStatus.PENDING,
            method: PaymentMethod.STRIPE,
            stripePaymentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        shippingAddress: true,
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Clear cart items
    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId: {
          in: items.map((item: any) => item.productId),
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
