#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short,
    token, Address, BytesN, Env, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    AgreementAlreadyExists = 4,
    AgreementNotFound = 5,
    InvalidStatus = 6,
    InvalidAmount = 7,
    TimeoutNotReached = 8,
    DisputeSplitMismatch = 9,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AgreementStatus {
    Active = 1,
    ConditionMet = 2,
    Settled = 3,
    Refunded = 4,
    Disputed = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Agreement {
    pub id: Symbol,
    pub buyer: Address,
    pub seller: Address,
    pub token: Address,
    pub amount: i128,
    pub status: AgreementStatus,
    pub timeout_ledger: u32,
    pub proof_hash: Option<BytesN<32>>,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Sentinel,
    Agreement(Symbol),
    ActiveCount,
}

#[contract]
pub struct PokaEscrowContract;

#[contractimpl]
impl PokaEscrowContract {
    /// Initialize the POKA Escrow contract with admin and sentinel addresses
    pub fn initialize(env: Env, admin: Address, sentinel: Address) -> Result<(), EscrowError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Sentinel, &sentinel);
        env.storage().instance().set(&DataKey::ActiveCount, &0u32);

        // Extend instance TTL (Soroban state persistence best practice)
        env.storage().instance().extend_ttl(50_000, 100_000);

        Ok(())
    }

    /// Deposit funds into escrow for a designated agreement
    pub fn deposit(
        env: Env,
        agreement_id: Symbol,
        buyer: Address,
        seller: Address,
        token: Address,
        amount: i128,
        timeout_ledger: u32,
    ) -> Result<(), EscrowError> {
        buyer.require_auth();

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        let agreement_key = DataKey::Agreement(agreement_id.clone());
        if env.storage().persistent().has(&agreement_key) {
            return Err(EscrowError::AgreementAlreadyExists);
        }

        // Transfer funds from buyer to this contract
        let client = token::Client::new(&env, &token);
        client.transfer(&buyer, &env.current_contract_address(), &amount);

        let agreement = Agreement {
            id: agreement_id.clone(),
            buyer: buyer.clone(),
            seller: seller.clone(),
            token: token.clone(),
            amount,
            status: AgreementStatus::Active,
            timeout_ledger,
            proof_hash: None,
        };

        env.storage().persistent().set(&agreement_key, &agreement);
        env.storage().persistent().extend_ttl(&agreement_key, 50_000, 100_000);

        // Increment active counter
        let mut count: u32 = env.storage().instance().get(&DataKey::ActiveCount).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::ActiveCount, &count);

        // Emit on-chain event for Sentinel indexing
        env.events().publish(
            (symbol_short!("poka"), symbol_short!("deposit")),
            (agreement_id, buyer, seller, amount),
        );

        Ok(())
    }

    /// Mark condition as met with cryptographic proof hash (invoked by Sentinel or Buyer)
    pub fn mark_condition_met(
        env: Env,
        agreement_id: Symbol,
        caller: Address,
        proof_hash: BytesN<32>,
    ) -> Result<(), EscrowError> {
        caller.require_auth();

        let agreement_key = DataKey::Agreement(agreement_id.clone());
        let mut agr: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_key)
            .ok_or(EscrowError::AgreementNotFound)?;

        let sentinel: Address = env
            .storage()
            .instance()
            .get(&DataKey::Sentinel)
            .ok_or(EscrowError::NotInitialized)?;

        if caller != sentinel && caller != agr.buyer {
            return Err(EscrowError::Unauthorized);
        }

        if agr.status != AgreementStatus::Active {
            return Err(EscrowError::InvalidStatus);
        }

        agr.status = AgreementStatus::ConditionMet;
        agr.proof_hash = Some(proof_hash.clone());

        env.storage().persistent().set(&agreement_key, &agr);
        env.storage().persistent().extend_ttl(&agreement_key, 50_000, 100_000);

        env.events().publish(
            (symbol_short!("poka"), symbol_short!("cond_met")),
            (agreement_id, proof_hash),
        );

        Ok(())
    }

    /// Settle escrow: release funds to seller (invoked by Sentinel after verification, or Buyer)
    pub fn settle(env: Env, agreement_id: Symbol, caller: Address) -> Result<(), EscrowError> {
        caller.require_auth();

        let agreement_key = DataKey::Agreement(agreement_id.clone());
        let mut agr: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_key)
            .ok_or(EscrowError::AgreementNotFound)?;

        let sentinel: Address = env
            .storage()
            .instance()
            .get(&DataKey::Sentinel)
            .ok_or(EscrowError::NotInitialized)?;

        if caller != sentinel && caller != agr.buyer {
            return Err(EscrowError::Unauthorized);
        }

        // Must be in ConditionMet or Active (if buyer settles directly)
        if agr.status != AgreementStatus::ConditionMet && !(agr.status == AgreementStatus::Active && caller == agr.buyer) {
            return Err(EscrowError::InvalidStatus);
        }

        // Transfer funds from contract to seller
        let client = token::Client::new(&env, &agr.token);
        client.transfer(&env.current_contract_address(), &agr.seller, &agr.amount);

        agr.status = AgreementStatus::Settled;
        env.storage().persistent().set(&agreement_key, &agr);
        env.storage().persistent().extend_ttl(&agreement_key, 50_000, 100_000);

        env.events().publish(
            (symbol_short!("poka"), symbol_short!("settled")),
            (agreement_id, agr.seller, agr.amount),
        );

        Ok(())
    }

    /// Refund escrow: return funds to buyer (if timeout expired, or Sentinel aborts)
    pub fn refund(env: Env, agreement_id: Symbol, caller: Address) -> Result<(), EscrowError> {
        caller.require_auth();

        let agreement_key = DataKey::Agreement(agreement_id.clone());
        let mut agr: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_key)
            .ok_or(EscrowError::AgreementNotFound)?;

        let sentinel: Address = env
            .storage()
            .instance()
            .get(&DataKey::Sentinel)
            .ok_or(EscrowError::NotInitialized)?;

        // Buyer can refund only if timeout ledger has passed
        // Sentinel can refund if delivery failed or agreement canceled
        let is_sentinel = caller == sentinel;
        let is_buyer_after_timeout = caller == agr.buyer && env.ledger().sequence() >= agr.timeout_ledger;

        if !is_sentinel && !is_buyer_after_timeout {
            if caller == agr.buyer {
                return Err(EscrowError::TimeoutNotReached);
            }
            return Err(EscrowError::Unauthorized);
        }

        if agr.status != AgreementStatus::Active && agr.status != AgreementStatus::ConditionMet {
            return Err(EscrowError::InvalidStatus);
        }

        // Transfer funds back to buyer
        let client = token::Client::new(&env, &agr.token);
        client.transfer(&env.current_contract_address(), &agr.buyer, &agr.amount);

        agr.status = AgreementStatus::Refunded;
        env.storage().persistent().set(&agreement_key, &agr);
        env.storage().persistent().extend_ttl(&agreement_key, 50_000, 100_000);

        env.events().publish(
            (symbol_short!("poka"), symbol_short!("refunded")),
            (agreement_id, agr.buyer, agr.amount),
        );

        Ok(())
    }

    /// Flag an agreement as disputed for arbitrated resolution
    pub fn dispute(env: Env, agreement_id: Symbol, caller: Address) -> Result<(), EscrowError> {
        caller.require_auth();

        let agreement_key = DataKey::Agreement(agreement_id.clone());
        let mut agr: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_key)
            .ok_or(EscrowError::AgreementNotFound)?;

        if caller != agr.buyer && caller != agr.seller {
            return Err(EscrowError::Unauthorized);
        }

        if agr.status != AgreementStatus::Active && agr.status != AgreementStatus::ConditionMet {
            return Err(EscrowError::InvalidStatus);
        }

        agr.status = AgreementStatus::Disputed;
        env.storage().persistent().set(&agreement_key, &agr);

        env.events().publish(
            (symbol_short!("poka"), symbol_short!("disputed")),
            (agreement_id, caller),
        );

        Ok(())
    }

    /// Resolve dispute by splitting funds according to admin decision
    pub fn resolve_dispute(
        env: Env,
        agreement_id: Symbol,
        caller: Address,
        buyer_payout: i128,
        seller_payout: i128,
    ) -> Result<(), EscrowError> {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::NotInitialized)?;

        if caller != admin {
            return Err(EscrowError::Unauthorized);
        }

        let agreement_key = DataKey::Agreement(agreement_id.clone());
        let mut agr: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_key)
            .ok_or(EscrowError::AgreementNotFound)?;

        if agr.status != AgreementStatus::Disputed {
            return Err(EscrowError::InvalidStatus);
        }

        if buyer_payout + seller_payout != agr.amount {
            return Err(EscrowError::DisputeSplitMismatch);
        }

        let client = token::Client::new(&env, &agr.token);
        if buyer_payout > 0 {
            client.transfer(&env.current_contract_address(), &agr.buyer, &buyer_payout);
        }
        if seller_payout > 0 {
            client.transfer(&env.current_contract_address(), &agr.seller, &seller_payout);
        }

        agr.status = AgreementStatus::Settled;
        env.storage().persistent().set(&agreement_key, &agr);

        env.events().publish(
            (symbol_short!("poka"), symbol_short!("resolved")),
            (agreement_id, buyer_payout, seller_payout),
        );

        Ok(())
    }

    // --- View Functions ---

    pub fn get_agreement(env: Env, agreement_id: Symbol) -> Option<Agreement> {
        env.storage().persistent().get(&DataKey::Agreement(agreement_id))
    }

    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    pub fn get_sentinel(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Sentinel)
    }

    pub fn get_active_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::ActiveCount).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
