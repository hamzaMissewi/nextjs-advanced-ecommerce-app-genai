# Next.js E-commerce with AI Testing & Advanced Search

A modern, full-featured e-commerce application built with Next.js 15, featuring AI-powered testing, Elasticsearch search, and graph database recommendations.

## 🚀 Features

-   **Next.js 15** with App Router and Server Components
-   **AI-Powered Testing** with automated test generation
-   **Elasticsearch** for advanced search and filtering
-   **Neo4j Graph Database** for product recommendations
-   **CI/CD Pipeline** with GitHub Actions
-   **Performance Monitoring** with Lighthouse CI
-   **Responsive Design** with Tailwind CSS
-   **Type Safety** with TypeScript

## 🛠 Tech Stack

### Frontend

-   Next.js 15 (App Router)
-   React 18
-   TypeScript
-   Tailwind CSS
-   Lucide React Icons

### Backend & Database

-   Elasticsearch (Search & Analytics)
-   Neo4j (Graph Database for Recommendations)
-   Redis (Caching)

### Testing & CI/CD

-   Jest (Unit Testing)
-   React Testing Library
-   AI-Powered Test Generation
-   GitHub Actions
-   Lighthouse CI
-   Docker & Docker Compose

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd nextjs-ecommerce-advanced
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local

    # Edit .env.local with your configuration

    \`\`\`

4. **Start services with Docker**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

5. **Set up databases**
   \`\`\`bash
   npm run setup:all
   \`\`\`

6. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🗄️ Database (PostgreSQL with Prisma)

### Setup

1. **Install PostgreSQL** (version 14+)
2. **Create database**: `createdb ecommerce_db`
3. **Set environment variables** in `.env.local`
4. **Run migrations**: `npm run db:migrate`
5. **Seed database**: `npm run db:seed`

### Database Management Commands

\`\`\`bash

# Generate Prisma client

npm run db:generate

# Push schema changes

npm run db:push

# Create and apply migration

npm run db:migrate

# Seed database with sample data

npm run db:seed

# Open Prisma Studio

npm run db:studio

# Reset database (careful!)

npm run db:reset
\`\`\`

### Backup & Restore

\`\`\`bash

# Create backup

node scripts/database-backup.js create

# List backups

node scripts/database-backup.js list

# Restore backup

node scripts/database-backup.js restore backups/backup-file.sql

# Clean old backups

node scripts/database-backup.js clean 30
\`\`\`

### Database Schema

-   **Users**: Customer accounts and admin users
-   **Categories**: Product categorization with hierarchy
-   **Products**: Product catalog with variants and images
-   **Orders**: Order management with items and payments
-   **Cart**: Shopping cart functionality
-   **Reviews**: Product reviews and ratings
-   **Addresses**: Customer shipping/billing addresses
-   **Payments**: Stripe payment integration

## 🧪 Testing

### Run Tests

\`\`\`bash

# Unit tests

npm run test

# Watch mode

npm run test:watch

# Coverage report

npm run test:coverage

# AI-powered testing

npm run test:ai
\`\`\`

### AI Testing Features

-   Automated test case generation
-   Performance testing with Lighthouse
-   Code coverage analysis
-   Test recommendations

## 🔍 Search & Recommendations

### Elasticsearch Features

-   Full-text search across products
-   Auto-suggestions and autocomplete
-   Category filtering
-   Price range filtering
-   Fuzzy matching for typos

### Graph Database Recommendations

-   Product similarity based on categories and price
-   "Customers who bought this also bought" recommendations
-   User behavior tracking
-   Collaborative filtering

## 🚀 Deployment

### Vercel (Recommended)

\`\`\`bash

# Deploy to staging

vercel

# Deploy to production

vercel --prod
\`\`\`

### Docker

\`\`\`bash

# Build and run with Docker

docker build -t ecommerce-app .
docker run -p 3000:3000 ecommerce-app
\`\`\`

## 📊 Performance

The application is optimized for performance with:

-   Server Components for reduced JavaScript bundle
-   Image optimization with Next.js Image component
-   Code splitting and lazy loading
-   Elasticsearch for fast search queries
-   Redis caching for frequently accessed data

## 🔧 Configuration

### Elasticsearch Setup

1. Install Elasticsearch 8.11+
2. Create the products index: `npm run setup:elasticsearch`
3. Configure connection in `.env.local`

### Neo4j Setup

1. Install Neo4j 5.15+
2. Set up constraints and sample data: `npm run setup:neo4j`
3. Configure connection in `.env.local`

## 📈 Monitoring & Analytics

-   **Performance**: Lighthouse CI integration
-   **Error Tracking**: Sentry integration ready
-   **Search Analytics**: Elasticsearch query analytics
-   **User Behavior**: Neo4j relationship tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

-   Create an issue on GitHub
-   Check the documentation
-   Review the test reports in `test-reports/`

## 🔮 Future Enhancements

-   [ ] Real-time chat support
-   [ ] Advanced analytics dashboard
-   [ ] Machine learning recommendations
-   [ ] Multi-language support
-   [ ] Progressive Web App features
-   [ ] Voice search integration
