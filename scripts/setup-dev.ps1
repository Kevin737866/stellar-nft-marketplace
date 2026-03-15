# PowerShell script for setting up development environment

Write-Host "🛠️  Setting up Stellar NFT Marketplace development environment" -ForegroundColor Green

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm is installed (version: $pnpmVersion)" -ForegroundColor Green
} catch {
    Write-Error "❌ pnpm is not installed. Please install pnpm first:"
    Write-Host "npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Check if Rust is installed
try {
    $rustVersion = rustc --version
    Write-Host "✅ Rust is installed ($rustVersion)" -ForegroundColor Green
} catch {
    Write-Error "❌ Rust is not installed. Please install Rust first:"
    Write-Host "Visit https://rustup.rs/ to install Rust" -ForegroundColor Yellow
    exit 1
}

# Check if Soroban CLI is installed
try {
    $sorobanVersion = soroban --version
    Write-Host "✅ Soroban CLI is installed ($sorobanVersion)" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Soroban CLI..." -ForegroundColor Blue
    cargo install soroban-cli
}

# Add wasm target for Rust
Write-Host "🔧 Adding wasm target for Rust..." -ForegroundColor Blue
rustup target add wasm32-unknown-unknown

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install

# Setup database
Write-Host "🗄️  Setting up database..." -ForegroundColor Blue
if (Test-Path "packages/indexer/.env") {
    Write-Host "Indexer .env file already exists" -ForegroundColor Yellow
} else {
    Copy-Item "packages/indexer/.env.example" "packages/indexer/.env"
    Write-Host "Created indexer .env file" -ForegroundColor Green
}

# Setup frontend environment
Write-Host "🌐 Setting up frontend environment..." -ForegroundColor Blue
if (Test-Path "packages/frontend/.env.local") {
    Write-Host "Frontend .env.local file already exists" -ForegroundColor Yellow
} else {
    Copy-Item "packages/frontend/.env.local.example" "packages/frontend/.env.local"
    Write-Host "Created frontend .env.local file" -ForegroundColor Green
}

# Build contracts
Write-Host "🔧 Building contracts..." -ForegroundColor Blue
Set-Location packages/contracts
cargo build --release --target wasm32-unknown-unknown
Set-Location ../..

Write-Host "🎉 Development environment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your environment variables in:" -ForegroundColor White
Write-Host "   - packages/frontend/.env.local" -ForegroundColor Cyan
Write-Host "   - packages/indexer/.env" -ForegroundColor Cyan
Write-Host "2. Deploy contracts to testnet:" -ForegroundColor White
Write-Host "   .\scripts\deploy-testnet.ps1" -ForegroundColor Cyan
Write-Host "3. Start development servers:" -ForegroundColor White
Write-Host "   pnpm dev" -ForegroundColor Cyan
