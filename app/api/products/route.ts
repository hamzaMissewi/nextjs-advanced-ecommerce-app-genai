import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const page = Number.parseInt(searchParams.get('page') || '1');
        const limit = Number.parseInt(searchParams.get('limit') || '12');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            status: ProductStatus.ACTIVE,
        };

        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { tags: { has: query } },
            ];
        }

        if (category) {
            where.category = {
                slug: category,
            };
        }

        // Build order by clause
        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        orderBy: { position: 'asc' },
                        take: 1,
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        // Calculate average ratings
        const productsWithRatings = await Promise.all(
            products.map(async (product) => {
                const avgRating = await prisma.review.aggregate({
                    where: { productId: product.id },
                    _avg: { rating: true },
                });

                return {
                    ...product,
                    rating: avgRating._avg.rating || 0,
                    reviewCount: product._count.reviews,
                    image:
                        product.images[0]?.url ||
                        '/placeholder.svg?height=300&width=300',
                };
            })
        );

        return NextResponse.json({
            products: productsWithRatings,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const product = await prisma.product.create({
            data: {
                ...data,
                images: data.images
                    ? {
                          create: data.images,
                      }
                    : undefined,
                variants: data.variants
                    ? {
                          create: data.variants,
                      }
                    : undefined,
            },
            include: {
                category: true,
                images: true,
                variants: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
