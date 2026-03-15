use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map, token, IntoVal};

#[contracttype]
pub enum MarketplaceDataKey {
    Admin,
    Listing(u32),
    ListingsByOwner(Address),
    AllListings,
    NextListingId,
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
        nft_contract: Address,
        token_id: u32,
        price: i128,
    ) -> u32 {
        let seller = env.current_contract_address();
        
        // Verify the seller owns the NFT
        let owner = env.invoke_contract(
            &nft_contract,
            &Symbol::new(&env, "owner_of"),
            (token_id,).into_val(&env),
        );
        
        if owner != seller.into_val(&env) {
            panic!("not token owner");
        }

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

    pub fn buy(env: Env, listing_id: u32) {
        let buyer = env.current_contract_address();
        
        let mut listing: Listing = env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"));

        if !listing.active {
            panic!("listing not active");
        }

        // Transfer XLM from buyer to seller
        token::Client::new(&env, &env.current_contract_address())
            .transfer(&buyer, &listing.seller, &listing.price);

        // Transfer NFT from seller to buyer
        env.invoke_contract(
            &listing.nft_contract,
            &Symbol::new(&env, "transfer_from"),
            (listing.seller.clone(), listing.seller, buyer.clone(), listing.token_id).into_val(&env),
        );

        // Mark listing as inactive
        listing.active = false;
        env.storage().instance().set(&MarketplaceDataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "sale_completed"), listing_id),
            (listing.nft_contract, listing.token_id, listing.seller, buyer, listing.price),
        );
    }

    pub fn delist(env: Env, listing_id: u32) {
        let seller = env.current_contract_address();
        
        let mut listing: Listing = env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"));

        if listing.seller != seller {
            panic!("not listing seller");
        }

        if !listing.active {
            panic!("listing not active");
        }

        listing.active = false;
        env.storage().instance().set(&MarketplaceDataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "listing_cancelled"), listing_id),
            (listing.nft_contract, listing.token_id),
        );
    }

    pub fn update_price(env: Env, listing_id: u32, new_price: i128) {
        let seller = env.current_contract_address();
        
        let mut listing: Listing = env.storage().instance()
            .get(&MarketplaceDataKey::Listing(listing_id))
            .unwrap_or_else(|| panic!("listing does not exist"));

        if listing.seller != seller {
            panic!("not listing seller");
        }

        if !listing.active {
            panic!("listing not active");
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
        let all_listings = Self::get_all_active_listings(env);
        let mut filtered_listings = Vec::new(&env);
        
        for listing in all_listings.iter() {
            if listing.nft_contract == nft_contract && listing.token_id == token_id {
                filtered_listings.push_back(listing.clone());
            }
        }
        
        filtered_listings
    }

    fn require_admin(env: Env) {
        let admin: Address = env.storage().instance()
            .get(&MarketplaceDataKey::Admin)
            .unwrap_or_else(|| panic!("admin not set"));
        admin.require_auth();
    }
}
