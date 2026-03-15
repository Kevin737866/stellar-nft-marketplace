use soroban_sdk::{Env, Address, String};
use stellar_nft_marketplace_contracts::MarketplaceContract;

fn main() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MarketplaceContract);
    
    // Initialize with admin address
    let admin = Address::from_string(&String::from_str(&env, "GD..."));
    MarketplaceContract::initialize(&env, admin.clone());
    
    println!("Marketplace Contract deployed at: {}", contract_id);
    println!("Admin: {}", admin);
}
