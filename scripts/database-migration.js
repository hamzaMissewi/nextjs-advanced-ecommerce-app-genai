require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function runMigrations() {
    console.log('🔄 Running database migrations...');

    try {
        // Check if database is accessible
        await prisma.$connect();
        console.log('✅ Database connection established');

        // Run Prisma migrations using CLI command
        console.log('📦 Applying Prisma migrations...');
        // This would typically be done via CLI: npx prisma migrate deploy
        // But we can check migration status programmatically

        //     const migrations = await prisma.$queryRaw`
        //   SELECT * FROM "_prisma_migrations"
        //   ORDER BY finished_at DESC
        //   LIMIT 5
        // `;

        //     console.log('📋 Recent migrations:');
        //     console.table(migrations);
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });

        // Custom data migrations can be added here
        await customDataMigrations();

        console.log('✅ All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

async function customDataMigrations() {
    console.log('🔧 Running custom data migrations...');

    // Example: Update product slugs if they don't exist
    // const productsWithoutSlugs = await prisma.product.findMany({
    //     where: { slug: null },
    // });

    // for (const product of productsWithoutSlugs) {
    //     const slug = product.name
    //         .toLowerCase()
    //         .replace(/[^a-z0-9]+/g, '-')
    //         .replace(/(^-|-$)/g, '');

    //     await prisma.product.update({
    //         where: { id: product.id },
    //         data: { slug },
    //     });
    // }

    // Example: Ensure all users have default addresses
    const usersWithoutAddresses = await prisma.user.findMany({
        where: {
            addresses: {
                none: {},
            },
        },
    });

    console.log(
        `Found ${usersWithoutAddresses.length} users without addresses`
    );

    // Example: Update order numbers format
    const ordersWithoutNumbers = await prisma.order.findMany({
        where: { orderNumber: null },
    });

    for (let i = 0; i < ordersWithoutNumbers.length; i++) {
        const order = ordersWithoutNumbers[i];
        const orderNumber = `ORD-${String(i + 1).padStart(6, '0')}`;

        await prisma.order.update({
            where: { id: order.id },
            data: { orderNumber },
        });
    }

    console.log('✅ Custom data migrations completed');
}

// Run migrations
runMigrations().catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
});
