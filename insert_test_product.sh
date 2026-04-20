#!/bin/bash

# Script to insert test product data into sunnynow database on NAS server
# This script addresses the issue with direct INSERT using subquery

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting product data insertion on NAS server..."

# Execute commands on NAS server via SSH
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -q sunny@192.168.2.71 << 'EOF'
set -e

# First, get a merchant ID from the merchants table
MERCHANT_ID=$(docker exec sunnynow-db psql -U postgres -d sunnynow -t -c "SELECT id FROM merchants LIMIT 1;" | tr -d ' \n\r')

if [ -z "$MERCHANT_ID" ]; then
  echo "No merchant found, inserting default merchant..."
  USER_ID=$(docker exec sunnynow-db psql -U postgres -d sunnynow -t -c "SELECT id FROM users LIMIT 1;" | tr -d ' \n\r')
  
  if [ -z "$USER_ID" ]; then
    echo "No user found, inserting default user..."
    docker exec sunnynow-db psql -U postgres -d sunnynow -c "
    INSERT INTO users (phone, nickname) VALUES ('+14165829301', 'System Admin') ON CONFLICT DO NOTHING;"
    USER_ID=$(docker exec sunnynow-db psql -U postgres -d sunnynow -t -c "SELECT id FROM users WHERE phone='+14165829301';" | tr -d ' \n\r')
  fi
  
  # Insert merchant
  docker exec sunnynow-db psql -U postgres -d sunnynow -c "
  INSERT INTO merchants (user_id, shop_name) VALUES ('$USER_ID', 'Default Shop') ON CONFLICT DO NOTHING;"
  MERCHANT_ID=$(docker exec sunnynow-db psql -U postgres -d sunnynow -t -c "SELECT id FROM merchants LIMIT 1;" | tr -d ' \n\r')
fi

# Check if we have a valid merchant ID
if [ -z "$MERCHANT_ID" ]; then
  echo "Error: Could not determine a valid merchant ID"
  exit 1
fi

echo "Using merchant ID: $MERCHANT_ID"

# Now insert the test product using only the fields that exist in the table
docker exec sunnynow-db psql -U postgres -d sunnynow -c "
INSERT INTO products (name, price, merchant_id) 
VALUES ('测试商品', 29.99, '$MERCHANT_ID') 
ON CONFLICT DO NOTHING;"

echo "Product insertion completed."

# Verify the inserted data
echo "Verifying inserted product:"
docker exec sunnynow-db psql -U postgres -d sunnynow -c "SELECT id, name, price FROM products WHERE name='测试商品';"

echo "Script completed successfully!"
EOF

echo "Remote script execution completed."