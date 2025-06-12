'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    inStock: boolean;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            // quantity: 1,
        });
    };

    return (
        <Card className='group hover:shadow-lg transition-shadow duration-200'>
            <CardContent className='p-4'>
                <div className='relative aspect-square mb-4 overflow-hidden rounded-lg'>
                    <Image
                        src={
                            product.image ||
                            `/placeholder.svg?height=300&width=300`
                        }
                        alt={product.name}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-200'
                    />
                    {!product.inStock && (
                        <Badge
                            variant='destructive'
                            className='absolute top-2 right-2'>
                            Out of Stock
                        </Badge>
                    )}
                </div>

                <div className='space-y-2'>
                    <Badge variant='secondary'>{product.category}</Badge>
                    <h3 className='font-semibold text-lg line-clamp-2'>
                        {product.name}
                    </h3>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                        {product.description}
                    </p>

                    <div className='flex items-center gap-1'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                        <span className='text-sm text-gray-600 ml-1'>
                            ({product.rating.toFixed(1)})
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className='p-4 pt-0 flex items-center justify-between'>
                <span className='text-2xl font-bold'>
                    ${product.price.toFixed(2)}
                </span>
                <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className='flex items-center gap-2'>
                    <ShoppingCart className='w-4 h-4' />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
