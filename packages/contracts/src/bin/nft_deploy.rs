use soroban_sdk::{Env, Address, String};
use stellar_nft_marketplace_contracts::{NFTContract, Metadata};

fn main() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTContract);
    
    // Initialize with admin address
    let admin = Address::from_string(&String::from_str(&env, "GD..."));
    NFTContract::initialize(&env, admin.clone());
    
    println!("NFT Contract deployed at: {:?}", contract_id);
    println!("Admin: {:?}", admin);
}
