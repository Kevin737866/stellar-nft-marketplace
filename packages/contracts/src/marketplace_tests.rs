use soroban_sdk::{Address, Env, String, Symbol, Vec, Map, token};
use crate::marketplace::{MarketplaceContract, MarketplaceDataKey, Listing, Sale, PLATFORM_FEE_BPS, FEE_PRECISION};
use crate::nft::{NFTContract, Metadata};

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as TestAddress;

    fn create_test_env() -> Env {
        let env = Env::default();
        env.mock_all_auths();
        env
    }

    fn setup_contracts(env: &Env) -> (Address, Address, Address, Address) {
        let admin = <soroban_sdk::Address as TestAddress>::generate(&env);
        let seller = <soroban_sdk::Address as TestAddress>::generate(&env);
        let buyer = <soroban_sdk::Address as TestAddress>::generate(&env);
        let marketplace_contract_id = env.register_contract(None, MarketplaceContract {});
        let nft_contract_id = env.register_contract(None, NFTContract {});

        // Initialize contracts
        MarketplaceContract::initialize(env.clone(), admin.clone());
        NFTContract::initialize(env.clone(), admin.clone());

        (marketplace_contract_id, nft_contract_id, seller, buyer)
    }

    fn mint_nft(env: &Env, nft_contract_id: &Address, admin: &Address, to: &Address, token_id: u32) {
        let metadata = Metadata {
            name: String::from_str(&env, "Test NFT"),
            description: String::from_str(&env, "A test NFT"),
            image: String::from_str(&env, "https://example.com/image.png"),
            attributes: Vec::new(&env),
        };

        NFTContract::mint(
            env.clone(),
            to.clone(),
            token_id,
            String::from_str(&env, "https://example.com/metadata.json"),
            metadata,
        );
    }

    #[test]
    fn test_marketplace_initialization() {
        let env = create_test_env();
        let admin = <soroban_sdk::Address as TestAddress>::generate(&env);
        let marketplace_contract_id = env.register_contract(None, MarketplaceContract {});

        MarketplaceContract::initialize(env.clone(), admin.clone());

        // Verify admin is set
        let stored_admin: Address = env.as_contract(&marketplace_contract_id, || {
            env.storage().instance()
                .get(&MarketplaceDataKey::Admin)
                .unwrap()
        });
        assert_eq!(stored_admin, admin);
    }

    #[test]
    fn test_platform_fee_calculation() {
        let price = 1000i128;
        let expected_fee = (price * PLATFORM_FEE_BPS) / FEE_PRECISION;
        assert_eq!(expected_fee, 25); // 2.5% of 1000
        
        let seller_amount = price - expected_fee;
        assert_eq!(seller_amount, 975);
    }

    #[test]
    fn test_nft_contract_functionality() {
        let env = create_test_env();
        let admin = <soroban_sdk::Address as TestAddress>::generate(&env);
        let user = <soroban_sdk::Address as TestAddress>::generate(&env);
        let nft_contract_id = env.register_contract(None, NFTContract {});

        // Initialize NFT contract
        NFTContract::initialize(env.clone(), admin.clone());

        // Mint NFT
        let token_id = 1u32;
        let metadata = Metadata {
            name: String::from_str(&env, "Test NFT"),
            description: String::from_str(&env, "A test NFT"),
            image: String::from_str(&env, "https://example.com/image.png"),
            attributes: Vec::new(&env),
        };

        NFTContract::mint(
            env.clone(),
            user.clone(),
            token_id,
            String::from_str(&env, "https://example.com/metadata.json"),
            metadata,
        );

        // Verify ownership
        let owner = NFTContract::owner_of(env.clone(), token_id);
        assert_eq!(owner, user);

        // Verify total supply
        let total_supply = NFTContract::total_supply(env.clone());
        assert_eq!(total_supply, 1);

        // Verify balance
        let balance = NFTContract::balance_of(env.clone(), user.clone());
        assert_eq!(balance, 1);
    }

    #[test]
    fn test_marketplace_data_structures() {
        let env = create_test_env();
        
        // Test Listing struct
        let listing = Listing {
            id: 1,
            nft_contract: Address::generate(&env),
            token_id: 1,
            seller: Address::generate(&env),
            price: 1000,
            active: true,
        };
        
        assert_eq!(listing.id, 1);
        assert_eq!(listing.price, 1000);
        assert!(listing.active);

        // Test Sale struct
        let sale = Sale {
            listing_id: 1,
            nft_contract: <soroban_sdk::Address as TestAddress>::generate(&env),
            token_id: 1,
            seller: <soroban_sdk::Address as TestAddress>::generate(&env),
            buyer: <soroban_sdk::Address as TestAddress>::generate(&env),
            price: 1000,
        };
        
        assert_eq!(sale.listing_id, 1);
        assert_eq!(sale.price, 1000);
    }

    #[test]
    fn test_constants() {
        assert_eq!(PLATFORM_FEE_BPS, 250); // 2.5%
        assert_eq!(FEE_PRECISION, 10000);
    }
}
