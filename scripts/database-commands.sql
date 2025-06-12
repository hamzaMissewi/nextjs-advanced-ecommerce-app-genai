-- PostgreSQL Database Management Commands for E-commerce

-- ============================================
-- DATABASE SETUP AND MAINTENANCE
-- ============================================

-- Create database (run as superuser)
CREATE DATABASE ecommerce_db;

-- Connect to database
\c ecommerce_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================
-- PERFORMANCE OPTIMIZATION
-- ============================================

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin ON products USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_description_gin ON products USING gin(description gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_tags_gin ON products USING gin(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status ON products(category_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================
-- DATA ANALYSIS QUERIES
-- ============================================

-- Top selling products
SELECT 
    p.name,
    p.sku,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total) as total_revenue,
    COUNT(DISTINCT oi.order_id) as order_count
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
GROUP BY p.id, p.name, p.sku
ORDER BY total_sold DESC
LIMIT 20;

-- Revenue by category
SELECT 
    c.name as category,
    COUNT(DISTINCT p.id) as product_count,
    SUM(oi.quantity) as items_sold,
    SUM(oi.total) as total_revenue
FROM categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- Monthly sales report
SELECT 
    DATE_TRUNC('month', o.created_at) as month,
    COUNT(DISTINCT o.id) as order_count,
    SUM(o.total) as total_revenue,
    AVG(o.total) as avg_order_value,
    COUNT(DISTINCT o.user_id) as unique_customers
FROM orders o
WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- Customer lifetime value
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT o.id) as order_count,
    SUM(o.total) as total_spent,
    AVG(o.total) as avg_order_value,
    MAX(o.created_at) as last_order_date
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- Low stock alert
SELECT 
    p.name,
    p.sku,
    p.stock,
    p.low_stock,
    c.name as category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.low_stock
    AND p.status = 'ACTIVE'
ORDER BY p.stock ASC;

-- Product performance with ratings
SELECT 
    p.name,
    p.sku,
    p.price,
    COUNT(r.id) as review_count,
    ROUND(AVG(r.rating), 2) as avg_rating,
    SUM(oi.quantity) as total_sold
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
WHERE p.status = 'ACTIVE'
GROUP BY p.id, p.name, p.sku, p.price
ORDER BY avg_rating DESC, total_sold DESC;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Clean up abandoned carts (older than 30 days)
DELETE FROM cart_items 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Update product stock after inventory count
-- Example: UPDATE products SET stock = 100 WHERE sku = 'PRODUCT_SKU';

-- Archive old orders (move to archive table if needed)
-- First create archive table, then move old data

-- Vacuum and analyze for performance
VACUUM ANALYZE products;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;
VACUUM ANALYZE users;

-- ============================================
-- BACKUP AND RESTORE
-- ============================================

-- Create backup (run from command line)
-- pg_dump -h localhost -U username -d ecommerce_db > backup_$(date +%Y%m%d_%H%M%S).sql

-- Restore from backup (run from command line)
-- psql -h localhost -U username -d ecommerce_db < backup_file.sql

-- ============================================
-- SECURITY QUERIES
-- ============================================

-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ecommerce_db TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Revoke permissions if needed
-- REVOKE ALL ON DATABASE ecommerce_db FROM analytics_user;

-- ============================================
-- MONITORING QUERIES
-- ============================================

-- Check database size
SELECT 
    pg_size_pretty(pg_database_size('ecommerce_db')) as database_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE datname = 'ecommerce_db';

-- Check slow queries (if pg_stat_statements is enabled)
-- SELECT query, calls, total_time, mean_time 
-- FROM pg_stat_statements 
-- ORDER BY mean_time DESC 
-- LIMIT 10;
