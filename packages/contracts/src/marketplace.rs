use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, token, IntoVal};

pub const PLATFORM_FEE_BPS: i128 = 250; // 2.5% fee (250 basis points)
pub const FEE_PRECISION: i128 = 10000;

#[contracttype]
pub enum MarketplaceDataKey {
    Admin,
    Listing(u32),
    ListingsByOwner(Address),
    AllListings,
    NextListingId,
    ReentrancyGuard,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Listing {
    pub id: u32,
    pub nft_contract: Address,
    pub token_id: u32,
    pub seller: Address,
    pub price: i128,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Sale {
    pub listing_id: u32,
    pub nft_contract: Address,
    pub token_id: u32,
    pub seller: Address,
    pub buyer: Address,
    pub price: i128,
}

#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&MarketplaceDataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&MarketplaceDataKey::Admin, &admin);
        env.storage().instance().set(&MarketplaceDataKey::NextListingId, &1u32);
    }

    pub fn list(
        env: Env,
        seller: Address,
        nft_contract: Address,
        token_id: u32,
        price: i128,
    ) -> u32 {
        seller.require_auth();
        
        // Verify the seller owns the NFT
        let owner: Address = env.invoke_contract(
            &nft_contract,
            &Symbol::new(&env, "owner_of"),
            (token_id,).into_val(&env),
        );
        
        if owner != seller {
            panic!("not token owner");
        }

        // Transfer NFT to marketplace contract (escrow)
        env.invoke_contract::<()>(
            &nft_contract,
            &Symbol::new(&env, "transfer_from"),
            (seller.clone(), seller.clone(), env.current_contract_address(), token_id).into_val(&env),
        );

        let listing_id: u32 = env.storage().instance()
            .get(&MarketplaceDataKey::NextListingId)
            .unwrap_or(1);

        let listing = Listing {
            id: listing_id,
            nft_contract: nft_contract.clone(),
            token_id,
            seller: seller.clone(),
            price,
            active: true,
        };

        env.storage().instance().set(&MarketplaceDataKey::Listing(listing_id), &listing);
        
        // Add to seller's listings
        let mut seller_listings: Vec<u32> = env.storage().instance()
            .get(&MarketplaceDataKey::ListingsByOwner(seller.clone()))
            .unwrap_or(Vec::new(&env));
        seller_listings.push_back(listing_id);
        env.storage().instance().set(&MarketplaceDataKey::ListingsByOwner(seller), &seller_listings);

        // Add to all listings
        let mut all_listings: Vec<u32> = env.storage().instance()
            .get(&MarketplaceDataKey::AllListings)
            .unwrap_or(Vec::new(&env));
        all_listings.push_back(listing_id);
        env.storage().instance().set(&MarketplaceDataKey::AllListings, &all_listings);

        // Increment next listing ID
        env.storage().instance().set(&MarketplaceDataKey::NextListingId, &(listing_id + 1));

        env.events().publish(
            (Symbol::new(&env, "listing_created"), listing_id),
            (nft_contract, token_id, price),
        );

        listing_id
    }

    pub fn buy(env: Env, buyer: Address, listing_id: u32) {
        buyer.require_auth();
        Self::_enter_reentrancy_guard(env.clone());
        
        let mut listing: Listing = env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"));

        if !listing.active {
            panic!("listing not active");
        }

        // Calculate platform fee
        let platform_fee = (listing.price * PLATFORM_FEE_BPS) / FEE_PRECISION;
        let seller_amount = listing.price - platform_fee;
        
        // Get marketplace admin for fee collection
        let admin: Address = env.storage().instance()
            .get(&MarketplaceDataKey::Admin)
            .unwrap_or_else(|| panic!("admin not set"));

        // Transfer XLM from buyer to seller (minus platform fee)
        token::Client::new(&env, &env.current_contract_address())
            .transfer(&buyer, &listing.seller, &seller_amount);
            
        // Transfer platform fee to admin
        if platform_fee > 0 {
            token::Client::new(&env, &env.current_contract_address())
                .transfer(&buyer, &admin, &platform_fee);
        }

        // Transfer NFT from marketplace contract to buyer
        env.invoke_contract::<()>(
            &listing.nft_contract,
            &Symbol::new(&env, "transfer_from"),
            (env.current_contract_address(), env.current_contract_address(), buyer.clone(), listing.token_id).into_val(&env),
        );

        // Mark listing as inactive
        listing.active = false;
        env.storage().instance().set(&MarketplaceDataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "sale_completed"), listing_id),
            (listing.nft_contract, listing.token_id, listing.seller, buyer, listing.price, platform_fee),
        );
        
        Self::_exit_reentrancy_guard(env);
    }

    pub fn delist(env: Env, seller: Address, listing_id: u32) {
        seller.require_auth();
        
        let mut listing: Listing = env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"));

        if listing.seller != seller {
            panic!("not listing seller");
        }

        if !listing.active {
            panic!("listing not active");
        }

        // Return NFT to seller from escrow
        env.invoke_contract::<()>(
            &listing.nft_contract,
            &Symbol::new(&env, "transfer_from"),
            (env.current_contract_address(), env.current_contract_address(), seller.clone(), listing.token_id).into_val(&env),
        );

        listing.active = false;
        env.storage().instance().set(&MarketplaceDataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "listing_cancelled"), listing_id),
            (listing.nft_contract, listing.token_id),
        );
    }

    pub fn update_price(env: Env, seller: Address, listing_id: u32, new_price: i128) {
        seller.require_auth();
        
        let mut listing: Listing = env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"));

        if listing.seller != seller {
            panic!("not listing seller");
        }

        if !listing.active {
            panic!("listing not active");
        }

        if new_price <= 0 {
            panic!("price must be positive");
        }

        listing.price = new_price;
        env.storage().instance().set(&MarketplaceDataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "price_updated"), listing_id),
            new_price,
        );
    }

    pub fn get_listing(env: Env, listing_id: u32) -> Listing {
        env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"))
    }

    pub fn get_listings_by_owner(env: Env, owner: Address) -> Vec<Listing> {
        let listing_ids: Vec<u32> = env.storage().instance()
            .get(&MarketplaceDataKey::ListingsByOwner(owner))
            .unwrap_or(Vec::new(&env));

        let mut listings = Vec::new(&env);
        for listing_id in listing_ids.iter() {
            let listing: Listing = env.storage().instance()
                .get(&MarketplaceDataKey::Listing(listing_id))
                .unwrap();
            if listing.active {
                listings.push_back(listing);
            }
        }
        
        listings
    }

    pub fn get_listings(env: Env, start: u32, limit: u32) -> Vec<Listing> {
        if limit == 0 || limit > 100 {
            panic!("limit must be between 1 and 100");
        }
        
        let listing_ids: Vec<u32> = env.storage().instance()
            .get(&MarketplaceDataKey::AllListings)
            .unwrap_or(Vec::new(&env));

        let mut listings = Vec::new(&env);
        let end = std::cmp::min(start + limit, listing_ids.len() as u32);
        
        for i in start..end {
            if let Some(listing_id) = listing_ids.get(i) {
                let listing: Listing = env.storage().instance()
                    .get(&MarketplaceDataKey::Listing(listing_id))
                    .unwrap();
                if listing.active {
                    listings.push_back(listing);
                }
            }
        }
        
        listings
    }

    pub fn get_all_active_listings(env: Env) -> Vec<Listing> {
        let listing_ids: Vec<u32> = env.storage().instance()
            .get(&MarketplaceDataKey::AllListings)
            .unwrap_or(Vec::new(&env));

        let mut listings = Vec::new(&env);
        for listing_id in listing_ids.iter() {
            let listing: Listing = env.storage().instance()
                .get(&MarketplaceDataKey::Listing(listing_id))
                .unwrap();
            if listing.active {
                listings.push_back(listing);
            }
        }
        
        listings
    }

    pub fn get_listings_by_nft(env: Env, nft_contract: Address, token_id: u32) -> Vec<Listing> {
        let all_listings = Self::get_all_active_listings(env.clone());
        let mut filtered_listings = Vec::new(&env);
        
        for listing in all_listings.iter() {
            if listing.nft_contract == nft_contract && listing.token_id == token_id {
                filtered_listings.push_back(listing.clone());
            }
        }
        
        filtered_listings
    }

    fn _enter_reentrancy_guard(env: Env) {
        let guard = env.storage().instance().get::<_, bool>(&MarketplaceDataKey::ReentrancyGuard);
        if guard.unwrap_or(false) {
            panic!("reentrancy detected");
        }
        env.storage().instance().set(&MarketplaceDataKey::ReentrancyGuard, &true);
    }

    fn _exit_reentrancy_guard(env: Env) {
        env.storage().instance().set(&MarketplaceDataKey::ReentrancyGuard, &false);
    }

    fn require_admin(env: Env) {
        let admin: Address = env.storage().instance()
            .get(&MarketplaceDataKey::Admin)
            .unwrap_or_else(|| panic!("admin not set"));
        admin.require_auth();
    }
}
