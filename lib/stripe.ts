import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
    // apiVersion: "2024-06-20",
});

export async function createPaymentIntent(
    amount: number,
    currency = 'usd',
    metadata?: Record<string, string>
) {
    return stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    });
}

export async function confirmPaymentIntent(paymentIntentId: string) {
    return stripe.paymentIntents.confirm(paymentIntentId);
}

export async function retrievePaymentIntent(paymentIntentId: string) {
    return stripe.paymentIntents.retrieve(paymentIntentId);
}
