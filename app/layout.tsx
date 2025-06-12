import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartProvider } from '@/contexts/cart-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

// ✅  Linked to hamza47/hamza-advanced-ecommerce-app-genai (created .vercel and added it to .gitignore)

export const metadata: Metadata = {
    title: 'GenAI E-commerce - Next.js Store',
    description: 'Modern e-commerce platform with AI-powered features',
    keywords: 'ecommerce, nextjs, ai, elasticsearch, graph database',
    generator: 'v0.dev',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <CartProvider>
                    <div className='flex flex-col min-h-screen'>
                        <Header />
                        <main className='flex-1'>{children}</main>
                        <Footer />
                    </div>
                    <Toaster />
                </CartProvider>
            </body>
        </html>
    );
}
