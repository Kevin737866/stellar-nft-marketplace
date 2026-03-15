use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map, token};

#[contracttype]
pub enum DataKey {
    Admin,
    Token(u32),
    Owner(u32),
    Metadata(u32),
    TotalSupply,
    Approved(u32),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Token {
    pub id: u32,
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
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0u32);
    }

    pub fn mint(env: Env, to: Address, token_id: u32, metadata_uri: String, metadata: Metadata) {
        Self::require_admin(env.clone());
        
        if env.storage().instance().has(&DataKey::Token(token_id)) {
            panic!("token already exists");
        }

        let token = Token {
            id: token_id,
            owner: to.clone(),
            metadata_uri: metadata_uri.clone(),
            approved: None,
        };

        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().set(&DataKey::Metadata(token_id), &metadata);

        let total_supply: u32 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply + 1));

        env.events().publish(
            (Symbol::new(&env, "mint"), token_id),
            (to, metadata_uri),
        );
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        from.require_auth();
        
        let mut token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));

        if token.owner != from {
            panic!("not token owner");
        }

        token.owner = to.clone();
        token.approved = None;

        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().remove(&DataKey::Approved(token_id));

        env.events().publish(
            (Symbol::new(&env, "transfer"), token_id),
            (from, to),
        );
    }

    pub fn approve(env: Env, owner: Address, approved: Address, token_id: u32) {
        owner.require_auth();
        
        let mut token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));

        if token.owner != owner {
            panic!("not token owner");
        }

        token.approved = Some(approved.clone());
        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Approved(token_id), &approved);

        env.events().publish(
            (Symbol::new(&env, "approve"), token_id),
            (owner, approved),
        );
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, token_id: u32) {
        spender.require_auth();
        
        let mut token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));

        let is_approved = token.approved.map_or(false, |addr| addr == spender);
        
        if token.owner != spender && !is_approved {
            panic!("not approved");
        }

        token.owner = to.clone();
        token.approved = None;

        env.storage().instance().set(&DataKey::Token(token_id), &token);
        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().remove(&DataKey::Approved(token_id));

        env.events().publish(
            (Symbol::new(&env, "transfer_from"), token_id),
            (from, to),
        );
    }

    pub fn owner_of(env: Env, token_id: u32) -> Address {
        env.storage().instance()
            .get(&DataKey::Owner(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    pub fn get_approved(env: Env, token_id: u32) -> Option<Address> {
        env.storage().instance().get(&DataKey::Approved(token_id))
    }

    pub fn token_metadata(env: Env, token_id: u32) -> Metadata {
        env.storage().instance()
            .get(&DataKey::Metadata(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    pub fn token_uri(env: Env, token_id: u32) -> String {
        let token: Token = env.storage().instance()
            .get(&DataKey::Token(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));
        token.metadata_uri
    }

    pub fn total_supply(env: Env) -> u32 {
        env.storage().instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn balance_of(env: Env, owner: Address) -> u32 {
        let mut balance = 0u32;
        let total_supply = Self::total_supply(env.clone());
        
        for token_id in 1..=total_supply {
            if let Some(token_owner) = env.storage().instance().get::<_, Address>(&DataKey::Owner(token_id)) {
                if token_owner == owner {
                    balance += 1;
                }
            }
        }
        
        balance
    }

    fn require_admin(env: Env) {
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("admin not set"));
        admin.require_auth();
    }
}
