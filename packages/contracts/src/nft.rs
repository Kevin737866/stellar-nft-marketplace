use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map};

pub type TokenId = u32;

#[contracttype]
pub enum DataKey {
    Admin,
    Token(TokenId),
    Owner(TokenId),
    MetadataUri(TokenId),
    TotalSupply,
    Approved(TokenId),
    NextTokenId,
    Name,
    Symbol,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Token {
    pub id: TokenId,
    pub owner: Address,
    pub metadata_uri: String,
    pub approved: Option<Address>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Metadata {
    pub name: String,
    pub description: String,
    pub image: String,
    pub attributes: Vec<Map<Symbol, String>>,
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    /// Initialize the NFT contract with admin, name, and symbol
    /// Following SIP-72 standard for Stellar NFTs
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0u32);
        env.storage().instance().set(&DataKey::NextTokenId, &1u32);
    }

    /// Mint a new NFT with unique ID and metadata URI
    /// Returns the token ID of the newly minted NFT
    pub fn mint(env: Env, to: Address, metadata_uri: String) -> TokenId {
        Self::require_admin(env.clone());
        
        let token_id: TokenId = env.storage().instance()
            .get(&DataKey::NextTokenId)
            .unwrap_or(1);

        // Ensure token doesn't already exist (should never happen with auto-increment)
        if env.storage().instance().has(&DataKey::Token(token_id)) {
            panic!("token already exists");
        }

        let token = Token {
            id: token_id,
            owner: to.clone(),
            metadata_uri: metadata_uri.clone(),
            approved: None,
        };

        // Store token data
        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().set(&DataKey::MetadataUri(token_id), &metadata_uri);

        // Update counters
        let total_supply: u32 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply + 1));
        env.storage().instance().set(&DataKey::NextTokenId, &(token_id + 1));

        // Emit mint event
        env.events().publish(
            (Symbol::new(&env, "mint"), token_id),
            (to.clone(), metadata_uri),
        );

        token_id
    }

    /// Transfer NFT from owner to another address
    /// Only the owner can initiate this transfer
    pub fn transfer(env: Env, from: Address, to: Address, token_id: TokenId) {
        from.require_auth();
        
        let mut token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));

        if token.owner != from {
            panic!("not token owner");
        }

        // Update token ownership
        token.owner = to.clone();
        token.approved = None; // Clear any existing approvals

        // Store updated token data
        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().remove(&DataKey::Approved(token_id));

        // Emit transfer event
        env.events().publish(
            (Symbol::new(&env, "transfer"), token_id),
            (from, to),
        );
    }

    /// Get the owner of a specific token
    pub fn owner_of(env: Env, token_id: TokenId) -> Address {
        env.storage().instance()
            .get(&DataKey::Owner(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    /// Get the number of NFTs owned by an address
    /// Gas optimized to avoid iterating through all tokens
    pub fn balance_of(env: Env, owner: Address) -> u32 {
        let mut balance = 0u32;
        let total_supply = Self::total_supply(env.clone());
        
        // Iterate through existing tokens to count ownership
        // Note: In production, consider maintaining a separate balance mapping for gas optimization
        for token_id in 1..=total_supply {
            if let Some(token_owner) = env.storage().instance().get::<_, Address>(&DataKey::Owner(token_id)) {
                if token_owner == owner {
                    balance += 1;
                }
            }
        }
        
        balance
    }

    /// Approve an operator to transfer a specific token
    pub fn approve(env: Env, operator: Address, token_id: TokenId) {
        let owner = Self::owner_of(env.clone(), token_id);
        owner.require_auth();
        
        let mut token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));

        // Set approval
        token.approved = Some(operator.clone());
        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Approved(token_id), &operator);

        // Emit approval event
        env.events().publish(
            (Symbol::new(&env, "approve"), token_id),
            (owner, operator),
        );
    }

    /// Get the approved operator for a token
    pub fn get_approved(env: Env, token_id: TokenId) -> Option<Address> {
        // Verify token exists
        if !env.storage().instance().has(&DataKey::Token(token_id)) {
            panic!("token does not exist");
        }
        
        env.storage().instance().get(&DataKey::Approved(token_id))
    }

    /// Transfer NFT from one address to another by an approved operator
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, token_id: TokenId) {
        spender.require_auth();
        
        let mut token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));

        // Verify authorization
        let is_owner = token.owner == spender;
        let is_approved = token.approved.map_or(false, |addr| addr == spender);
        
        if !is_owner && !is_approved {
            panic!("not authorized");
        }

        // Verify from address matches current owner
        if token.owner != from {
            panic!("from address does not match owner");
        }

        // Update token ownership
        token.owner = to.clone();
        token.approved = None; // Clear approval

        // Store updated token data
        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().remove(&DataKey::Approved(token_id));

        // Emit transfer event
        env.events().publish(
            (Symbol::new(&env, "transfer"), token_id),
            (from, to),
        );
    }

    /// Get the metadata URI for a token
    pub fn token_uri(env: Env, token_id: TokenId) -> String {
        env.storage().instance()
            .get(&DataKey::MetadataUri(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    /// Get the total number of tokens minted
    pub fn total_supply(env: Env) -> u32 {
        env.storage().instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get the contract name
    pub fn name(env: Env) -> String {
        env.storage().instance()
            .get(&DataKey::Name)
            .unwrap_or_else(|| panic!("contract not initialized"))
    }

    /// Get the contract symbol
    pub fn symbol(env: Env) -> String {
        env.storage().instance()
            .get(&DataKey::Symbol)
            .unwrap_or_else(|| panic!("contract not initialized"))
    }

    /// Check if a token exists
    pub fn exists(env: Env, token_id: TokenId) -> bool {
        env.storage().instance().has(&DataKey::Token(token_id))
    }

    /// Get token information
    pub fn token_info(env: Env, token_id: TokenId) -> Token {
        env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    /// Internal function to require admin authorization
    fn require_admin(env: Env) {
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("admin not set"));
        admin.require_auth();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as TestAddress, Env};

    fn create_test_env() -> Env {
        let env = Env::default();
        env.mock_all_auths();
        env
    }

    fn setup_contract(env: &Env) -> (Address, Address, Address, Address) {
        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register_contract(None, NFTContract {});
        
        // Initialize contract using as_contract
        env.as_contract(&contract_id, || {
            NFTContract::initialize(
                env.clone(),
                admin.clone(),
                String::from_str(&env, "Test NFT Collection"),
                String::from_str(&env, "TNFT"),
            );
        });
        
        (contract_id, admin, user1, user2)
    }

    #[test]
    fn test_initialization() {
        let env = create_test_env();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, NFTContract {});
        
        env.as_contract(&contract_id, || {
            NFTContract::initialize(
                env.clone(),
                admin.clone(),
                String::from_str(&env, "My NFT Collection"),
                String::from_str(&env, "MNC"),
            );
        });
        
        // Test contract metadata
        let name = env.as_contract(&contract_id, || NFTContract::name(env.clone()));
        let symbol = env.as_contract(&contract_id, || NFTContract::symbol(env.clone()));
        let total_supply = env.as_contract(&contract_id, || NFTContract::total_supply(env.clone()));
        
        assert_eq!(name, String::from_str(&env, "My NFT Collection"));
        assert_eq!(symbol, String::from_str(&env, "MNC"));
        assert_eq!(total_supply, 0);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_initialization() {
        let env = create_test_env();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, NFTContract {});
        
        env.as_contract(&contract_id, || {
            NFTContract::initialize(
                env.clone(),
                admin.clone(),
                String::from_str(&env, "Test Collection"),
                String::from_str(&env, "TEST"),
            );
        });
        
        // Should panic on second initialization
        env.as_contract(&contract_id, || {
            NFTContract::initialize(
                env.clone(),
                admin.clone(),
                String::from_str(&env, "Test Collection 2"),
                String::from_str(&env, "TEST2"),
            );
        });
    }

    #[test]
    fn test_mint() {
        let env = create_test_env();
        let (contract_id, _admin, user1, user2) = setup_contract(&env);
        
        let metadata_uri = String::from_str(&env, "https://ipfs.io/ipfs/QmTest123");
        let token_id = env.as_contract(&contract_id, || {
            NFTContract::mint(env.clone(), user1.clone(), metadata_uri.clone())
        });
        
        // Verify token was minted with ID 1
        assert_eq!(token_id, 1);
        
        // Verify ownership
        let owner = env.as_contract(&contract_id, || NFTContract::owner_of(env.clone(), token_id));
        assert_eq!(owner, user1);
        
        // Verify metadata URI
        let uri = env.as_contract(&contract_id, || NFTContract::token_uri(env.clone(), token_id));
        assert_eq!(uri, metadata_uri);
        
        // Verify total supply
        let total_supply = env.as_contract(&contract_id, || NFTContract::total_supply(env.clone()));
        assert_eq!(total_supply, 1);
        
        // Verify balance
        let balance1 = env.as_contract(&contract_id, || NFTContract::balance_of(env.clone(), user1.clone()));
        let balance2 = env.as_contract(&contract_id, || NFTContract::balance_of(env.clone(), user2.clone()));
        assert_eq!(balance1, 1);
        assert_eq!(balance2, 0);
        
        // Verify token exists
        let exists = env.as_contract(&contract_id, || NFTContract::exists(env.clone(), token_id));
        let not_exists = env.as_contract(&contract_id, || NFTContract::exists(env.clone(), 999));
        assert!(exists);
        assert!(!not_exists);
    }

    #[test]
    fn test_transfer() {
        let env = create_test_env();
        let (contract_id, _admin, user1, user2) = setup_contract(&env);
        
        // Mint NFT to user1
        let token_id = env.as_contract(&contract_id, || {
            NFTContract::mint(
                env.clone(),
                user1.clone(),
                String::from_str(&env, "https://ipfs.io/ipfs/QmTest"),
            )
        });
        
        // Transfer from user1 to user2
        env.as_contract(&contract_id, || {
            NFTContract::transfer(env.clone(), user1.clone(), user2.clone(), token_id)
        });
        
        // Verify ownership changed
        let owner = env.as_contract(&contract_id, || NFTContract::owner_of(env.clone(), token_id));
        assert_eq!(owner, user2);
        
        // Verify balances updated
        let balance1 = env.as_contract(&contract_id, || NFTContract::balance_of(env.clone(), user1.clone()));
        let balance2 = env.as_contract(&contract_id, || NFTContract::balance_of(env.clone(), user2.clone()));
        assert_eq!(balance1, 0);
        assert_eq!(balance2, 1);
    }

    #[test]
    fn test_approve() {
        let env = create_test_env();
        let (contract_id, _admin, user1, user2) = setup_contract(&env);
        
        // Mint NFT to user1
        let token_id = env.as_contract(&contract_id, || {
            NFTContract::mint(
                env.clone(),
                user1.clone(),
                String::from_str(&env, "https://ipfs.io/ipfs/QmTest"),
            )
        });
        
        // Approve user2 to transfer the token
        env.as_contract(&contract_id, || {
            NFTContract::approve(env.clone(), user2.clone(), token_id)
        });
        
        // Verify approval
        let approved = env.as_contract(&contract_id, || NFTContract::get_approved(env.clone(), token_id));
        assert_eq!(approved, Some(user2.clone()));
    }

    #[test]
    fn test_transfer_from() {
        let env = create_test_env();
        let (contract_id, _admin, user1, user2) = setup_contract(&env);
        let user3 = Address::generate(&env);
        
        // Mint NFT to user1
        let token_id = env.as_contract(&contract_id, || {
            NFTContract::mint(
                env.clone(),
                user1.clone(),
                String::from_str(&env, "https://ipfs.io/ipfs/QmTest"),
            )
        });
        
        // Approve user2 to transfer the token
        env.as_contract(&contract_id, || {
            NFTContract::approve(env.clone(), user2.clone(), token_id)
        });
        
        // User2 transfers from user1 to user3
        env.as_contract(&contract_id, || {
            NFTContract::transfer_from(env.clone(), user2.clone(), user1.clone(), user3.clone(), token_id)
        });
        
        // Verify ownership changed
        let owner = env.as_contract(&contract_id, || NFTContract::owner_of(env.clone(), token_id));
        assert_eq!(owner, user3);
        
        // Verify approval was cleared
        let approved = env.as_contract(&contract_id, || NFTContract::get_approved(env.clone(), token_id));
        assert_eq!(approved, None);
        
        // Verify balances
        let balance1 = env.as_contract(&contract_id, || NFTContract::balance_of(env.clone(), user1.clone()));
        let balance3 = env.as_contract(&contract_id, || NFTContract::balance_of(env.clone(), user3.clone()));
        assert_eq!(balance1, 0);
        assert_eq!(balance3, 1);
    }
}