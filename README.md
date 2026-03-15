# Stellar NFT Marketplace

A complete NFT marketplace on the Stellar blockchain using Soroban smart contracts and Next.js frontend.

## Structure

```
stellar-nft-marketplace/
├── packages/
│   ├── contracts/     # Soroban Rust smart contracts
│   ├── frontend/      # Next.js 14 app
│   └── indexer/       # Node.js event indexer
├── package.json
└── README.md
```

## Tech Stack

- **Smart Contracts**: Soroban SDK (Rust)
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain**: @stellar/stellar-sdk
- **Wallet**: stellar-wallet-connect
- **Storage**: IPFS via nft.storage
- **Indexer**: Node.js + SQLite
- **Package Manager**: pnpm workspaces

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build contracts:
   ```bash
   pnpm contracts:build
   ```

3. Start frontend:
   ```bash
   pnpm frontend:dev
   ```

4. Start indexer:
   ```bash
   pnpm indexer:start
   ```

## Development

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm contracts:deploy:testnet` - Deploy contracts to testnet

## Features

- NFT minting with metadata
- NFT transfers
- Marketplace listing/buying with XLM
- IPFS metadata storage
- Event indexing
- Wallet connection

## License

MIT
