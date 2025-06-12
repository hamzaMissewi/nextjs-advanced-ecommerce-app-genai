import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    })

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity
    }, 0)

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json()

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    let cartItem
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      })
    }

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json()

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })
      return NextResponse.json({ message: "Item removed from cart" })
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 })
  }
}
