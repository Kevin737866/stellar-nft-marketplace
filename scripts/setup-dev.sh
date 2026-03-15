#!/bin/bash

set -e

echo "🛠️  Setting up Stellar NFT Marketplace development environment"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check if Soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo "📦 Installing Soroban CLI..."
    cargo install soroban-cli
fi

# Add wasm target for Rust
echo "🔧 Adding wasm target for Rust..."
rustup target add wasm32-unknown-unknown

echo "📦 Installing dependencies..."
pnpm install

echo "🗄️  Setting up database..."
cd packages/indexer
cp .env.example .env
cd ../..

echo "🌐 Setting up frontend environment..."
cd packages/frontend
cp .env.local.example .env.local
cd ../..

echo "🔧 Building contracts..."
cd packages/contracts
cargo build --release --target wasm32-unknown-unknown
cd ../..

echo "🎉 Development environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in:"
echo "   - packages/frontend/.env.local"
echo "   - packages/indexer/.env"
echo "2. Deploy contracts to testnet:"
echo "   ./scripts/deploy-testnet.sh"
echo "3. Start development servers:"
echo "   pnpm dev"
