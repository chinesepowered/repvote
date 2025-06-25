#!/bin/bash

# Script to update all contract addresses after deployment
# Usage: ./update_contract_addresses.sh 0xYOUR_CONTRACT_ADDRESS

if [ $# -eq 0 ]; then
    echo "Usage: $0 <contract_address>"
    echo "Example: $0 0x1234567890abcdef"
    exit 1
fi

CONTRACT_ADDRESS=$1

echo "Updating contract addresses to: $CONTRACT_ADDRESS"

# Update frontend configuration
echo "Updating frontend files..."
sed -i.bak "s/0x1d007d755706c469/$CONTRACT_ADDRESS/g" src/lib/flow.ts

# Update all Cadence files
echo "Updating Cadence files..."
find cadence -name "*.cdc" -exec sed -i.bak "s/0xREPVOUCH_ADDRESS/$CONTRACT_ADDRESS/g" {} \;

# Update environment example
echo "Updating .env.example..."
sed -i.bak "s/0x1d007d755706c469/$CONTRACT_ADDRESS/g" .env.example

# Create/update .env.local
echo "Creating .env.local..."
cat > .env.local << EOF
# Flow Configuration - Auto-generated
NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
NODE_ENV=development
EOF

echo "✅ All files updated successfully!"
echo ""
echo "Files updated:"
echo "- src/lib/flow.ts"
echo "- All Cadence files in cadence/"
echo "- .env.example"
echo "- .env.local (created/updated)"
echo ""
echo "Next steps:"
echo "1. Verify the changes look correct"
echo "2. Test your application: pnpm dev"
echo "3. Deploy to Vercel!"

# Clean up backup files
echo "Cleaning up backup files..."
find . -name "*.bak" -delete

echo "Done! 🚀"