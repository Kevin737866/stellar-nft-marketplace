#!/bin/bash

set -e

echo "🚀 Deploying Stellar NFT Marketplace to Testnet"

# Check if required environment variables are set
if [ -z "$SOROBAN_RPC_URL" ]; then
    echo "Error: SOROBAN_RPC_URL environment variable is not set"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "Error: SECRET_KEY environment variable is not set"
    exit 1
fi

echo "📦 Building contracts..."
cd packages/contracts
cargo build --release --target wasm32-unknown-unknown

echo "🔧 Deploying NFT contract..."
NFT_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/stellar_nft_marketplace_contracts.wasm \
    --source-account $SECRET_KEY \
    --rpc-url $SOROBAN_RPC_URL \
    --network testnet)

echo "✅ NFT Contract deployed at: $NFT_CONTRACT_ID"

echo "🔧 Initializing NFT contract..."
soroban contract invoke \
    --id $NFT_CONTRACT_ID \
    --source-account $SECRET_KEY \
    --rpc-url $SOROBAN_RPC_URL \
    --network testnet \
    -- initialize \
    --admin $SECRET_KEY

echo "🔧 Deploying Marketplace contract..."
MARKETPLACE_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/stellar_nft_marketplace_contracts.wasm \
    --source-account $SECRET_KEY \
    --rpc-url $SOROBAN_RPC_URL \
    --network testnet)

echo "✅ Marketplace Contract deployed at: $MARKETPLACE_CONTRACT_ID"

echo "🔧 Initializing Marketplace contract..."
soroban contract invoke \
    --id $MARKETPLACE_CONTRACT_ID \
    --source-account $SECRET_KEY \
    --rpc-url $SOROBAN_RPC_URL \
    --network testnet \
    -- initialize \
    --admin $SECRET_KEY

echo "📝 Creating environment files..."

# Create frontend env file
cat > packages/frontend/.env.local << EOF
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NFT_CONTRACT_ID=$NFT_CONTRACT_ID
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$MARKETPLACE_CONTRACT_ID
NEXT_PUBLIC_INDEXER_API_URL=http://localhost:3001
EOF

# Create indexer env file
cat > packages/indexer/.env << EOF
STELLAR_NETWORK_URL=https://horizon-testnet.stellar.org
NFT_CONTRACT_ID=$NFT_CONTRACT_ID
MARKETPLACE_CONTRACT_ID=$MARKETPLACE_CONTRACT_ID
DATABASE_PATH=./indexer.db
LOG_LEVEL=info
EOF

echo "🎉 Deployment completed!"
echo "NFT Contract: $NFT_CONTRACT_ID"
echo "Marketplace Contract: $MARKETPLACE_CONTRACT_ID"
echo ""
echo "Next steps:"
echo "1. Add your WalletConnect and NFT.Storage tokens to packages/frontend/.env.local"
echo "2. Run 'pnpm frontend:dev' to start the frontend"
echo "3. Run 'pnpm indexer:start' to start the indexer"
