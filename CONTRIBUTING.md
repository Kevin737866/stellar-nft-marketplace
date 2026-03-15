# Contributing to Stellar NFT Marketplace

Thank you for your interest in contributing to the Stellar NFT Marketplace! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- Rust and Cargo
- Soroban CLI

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/Kevin737866/stellar-nft-marketplace.git
   cd stellar-nft-marketplace
   ```

2. Run the setup script:
   ```bash
   chmod +x scripts/setup-dev.sh
   ./scripts/setup-dev.sh
   ```

3. Configure environment variables:
   - Copy `packages/frontend/.env.local.example` to `packages/frontend/.env.local`
   - Copy `packages/indexer/.env.example` to `packages/indexer/.env`
   - Fill in your API keys and contract addresses

4. Deploy contracts to testnet:
   ```bash
   chmod +x scripts/deploy-testnet.sh
   ./scripts/deploy-testnet.sh
   ```

5. Start development:
   ```bash
   pnpm dev
   ```

## Project Structure

```
stellar-nft-marketplace/
├── packages/
│   ├── contracts/         # Soroban smart contracts (Rust)
│   ├── frontend/         # Next.js frontend
│   └── indexer/          # Node.js event indexer
├── scripts/             # Deployment and setup scripts
└── docs/               # Additional documentation
```

## Development Commands

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm contracts:build` - Build smart contracts
- `pnpm contracts:test` - Test smart contracts
- `pnpm frontend:dev` - Start frontend development server
- `pnpm indexer:start` - Start indexer
- `pnpm indexer:migrate` - Run database migrations

## Smart Contracts

The smart contracts are written in Rust using the Soroban SDK:

- **NFT Contract** (`packages/contracts/src/nft.rs`): Handles NFT minting, transfers, and metadata
- **Marketplace Contract** (`packages/contracts/src/marketplace.rs`): Handles listings, sales, and marketplace operations

### Testing Contracts

```bash
cd packages/contracts
cargo test
```

### Building Contracts

```bash
cd packages/contracts
cargo build --release --target wasm32-unknown-unknown
```

## Frontend

The frontend is built with Next.js 14, TypeScript, and Tailwind CSS:

- **Wallet Connection**: Uses `stellar-wallet-connect`
- **IPFS Integration**: Uses `nft.storage` for metadata storage
- **Stellar Integration**: Uses `@stellar/stellar-sdk`

### Key Components

- `components/WalletProvider.tsx` - Wallet connection context
- `components/NFTGallery.tsx` - NFT gallery display
- `components/Marketplace.tsx` - Marketplace interface
- `app/mint/page.tsx` - NFT minting interface

## Indexer

The indexer listens to Stellar blockchain events and stores them in SQLite:

- **Event Processing**: Tracks NFT and marketplace events
- **Database**: SQLite with migrations
- **API**: REST API for frontend consumption

### Running the Indexer

```bash
cd packages/indexer
pnpm start
```

## Deployment

### Testnet Deployment

1. Set up environment variables:
   ```bash
   export SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
   export SECRET_KEY="your_secret_key"
   ```

2. Run deployment script:
   ```bash
   ./scripts/deploy-testnet.sh
   ```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns and naming conventions
- Write tests for new functionality
- Update documentation for new features

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them
4. Push to your fork: `git push origin feature-name`
5. Create a pull request

## Testing

- Run all tests before submitting: `pnpm test`
- Ensure contracts build successfully: `pnpm contracts:build`
- Test frontend functionality: `pnpm frontend:dev`

## Getting Help

- Check existing issues for similar problems
- Read the Soroban documentation: https://soroban.stellar.org/
- Join the Stellar Discord: https://discord.gg/stellar

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
