#!/bin/bash

# Script to clean database for order debugging
# This script will:
# 1. Delete invalid products (status = false or orphaned products)
# 2. Delete all orders and order items
# 3. Clean up related data

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting database cleanup on NAS server..."

# Execute commands on NAS server via SSH
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -q sunny@192.168.2.71 << 'EOF'
set -e

echo "=== Database Cleanup Started ==="

# 1. Delete all order items first (due to foreign key constraints)
echo "Deleting all order items..."
docker exec sunnynow-db psql -U sunny -d sunnynow -c "
DELETE FROM order_items;"

echo "Order items deleted successfully."

# 2. Delete all orders
echo "Deleting all orders..."
docker exec sunnynow-db psql -U sunny -d sunnynow -c "
DELETE FROM orders;"

echo "Orders deleted successfully."

# 3. Delete invalid products
echo "Cleaning up invalid products..."

# Delete products with status = false
docker exec sunnynow-db psql -U sunny -d sunnynow -c "
DELETE FROM products WHERE status = false;"

echo "Invalid products (status=false) deleted."

# Delete orphaned products (products without valid merchant_id)
docker exec sunnynow-db psql -U sunny -d sunnynow -c "
DELETE FROM products 
WHERE merchant_id NOT IN (SELECT id FROM merchants WHERE id IS NOT NULL);"

echo "Orphaned products deleted."

# 4. Optional: Clean up test users (keep this commented out by default)
# echo "Cleaning up test users..."
# docker exec sunnynow-db psql -U sunny -d sunnynow -c "
# DELETE FROM users WHERE phone LIKE '+14165829301' OR phone LIKE '+14265829301';"
# echo "Test users cleaned up."

# 5. Verify cleanup results
echo "=== Verification Results ==="

echo "Products count:"
docker exec sunnynow-db psql -U sunny -d sunnynow -t -c "SELECT COUNT(*) FROM products;"

echo "Valid products (status=true):"
docker exec sunnynow-db psql -U sunny -d sunnynow -t -c "SELECT COUNT(*) FROM products WHERE status = true;"

echo "Orders count:"
docker exec sunnynow-db psql -U sunny -d sunnynow -t -c "SELECT COUNT(*) FROM orders;"

echo "Order items count:"
docker exec sunnynow-db psql -U sunny -d sunnynow -t -c "SELECT COUNT(*) FROM order_items;"

echo "Users count:"
docker exec sunnynow-db psql -U sunny -d sunnynow -t -c "SELECT COUNT(*) FROM users;"

echo "Merchants count:"
docker exec sunnynow-db psql -U sunny -d sunnynow -t -c "SELECT COUNT(*) FROM merchants;"

echo "=== Database Cleanup Completed Successfully! ==="
EOF

echo "Remote cleanup script execution completed."
echo ""
echo "Note: Frontend shopping cart data is stored in localStorage and needs to be cleared separately in the browser."