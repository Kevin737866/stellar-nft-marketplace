# PowerShell script for deploying to Stellar testnet

param(
    [string]$SecretKey = $env:SECRET_KEY,
    [string]$RpcUrl = $env:SOROBAN_RPC_URL
)

if (-not $SecretKey) {
    Write-Error "SECRET_KEY environment variable is not set"
    exit 1
}

if (-not $RpcUrl) {
    Write-Error "SOROBAN_RPC_URL environment variable is not set"
    exit 1
}

Write-Host "🚀 Deploying Stellar NFT Marketplace to Testnet" -ForegroundColor Green

# Build contracts
Write-Host "📦 Building contracts..." -ForegroundColor Blue
Set-Location packages/contracts
cargo build --release --target wasm32-unknown-unknown

# Deploy NFT contract
Write-Host "🔧 Deploying NFT contract..." -ForegroundColor Blue
$NftContractId = soroban contract deploy `
    --wasm target/wasm32-unknown-unknown/release/stellar_nft_marketplace_contracts.wasm `
    --source-account $SecretKey `
    --rpc-url $RpcUrl `
    --network testnet

Write-Host "✅ NFT Contract deployed at: $NftContractId" -ForegroundColor Green

# Initialize NFT contract
Write-Host "🔧 Initializing NFT contract..." -ForegroundColor Blue
soroban contract invoke `
    --id $NftContractId `
    --source-account $SecretKey `
    --rpc-url $RpcUrl `
    --network testnet `
    -- initialize `
    --admin $SecretKey

# Deploy Marketplace contract
Write-Host "🔧 Deploying Marketplace contract..." -ForegroundColor Blue
$MarketplaceContractId = soroban contract deploy `
    --wasm target/wasm32-unknown-unknown/release/stellar_nft_marketplace_contracts.wasm `
    --source-account $SecretKey `
    --rpc-url $RpcUrl `
    --network testnet

Write-Host "✅ Marketplace Contract deployed at: $MarketplaceContractId" -ForegroundColor Green

# Initialize Marketplace contract
Write-Host "🔧 Initializing Marketplace contract..." -ForegroundColor Blue
soroban contract invoke `
    --id $MarketplaceContractId `
    --source-account $SecretKey `
    --rpc-url $RpcUrl `
    --network testnet `
    -- initialize `
    --admin $SecretKey

# Create frontend env file
Write-Host "📝 Creating environment files..." -ForegroundColor Blue
$FrontendEnv = @"
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NFT_CONTRACT_ID=$NftContractId
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$MarketplaceContractId
NEXT_PUBLIC_INDEXER_API_URL=http://localhost:3001
"@
Set-Content -Path "../frontend/.env.local" -Value $FrontendEnv

# Create indexer env file
$IndexerEnv = @"
STELLAR_NETWORK_URL=https://horizon-testnet.stellar.org
NFT_CONTRACT_ID=$NftContractId
MARKETPLACE_CONTRACT_ID=$MarketplaceContractId
DATABASE_PATH=./indexer.db
LOG_LEVEL=info
"@
Set-Content -Path "../indexer/.env" -Value $IndexerEnv

Set-Location ../..

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "NFT Contract: $NftContractId" -ForegroundColor Cyan
Write-Host "Marketplace Contract: $MarketplaceContractId" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add your WalletConnect and NFT.Storage tokens to packages/frontend/.env.local"
Write-Host "2. Run 'pnpm frontend:dev' to start the frontend"
Write-Host "3. Run 'pnpm indexer:start' to start the indexer"
