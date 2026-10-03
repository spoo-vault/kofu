#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient as TokenAdminClient},
    Address, BytesN, Env, Symbol,
};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(env, &contract_address.address()),
        TokenAdminClient::new(env, &contract_address.address()),
    )
}

#[test]
fn test_escrow_full_happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sentinel = Address::generate(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);

    // Register token and fund buyer
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&buyer, &10_000_000); // 100 USDC in 7 decimals

    // Register escrow contract
    let contract_id = env.register(KofuEscrowContract, ());
    let client = KofuEscrowContractClient::new(&env, &contract_id);

    // Initialize
    client.initialize(&admin, &sentinel);
    assert_eq!(client.get_admin(), Some(admin.clone()));
    assert_eq!(client.get_sentinel(), Some(sentinel.clone()));

    // Deposit 50 USDC
    let agreement_id = Symbol::new(&env, "kofu_001");
    let amount = 5_000_000; // 50 units
    let timeout = 1000;

    client.deposit(
        &agreement_id,
        &buyer,
        &seller,
        &token.address,
        &amount,
        &timeout,
    );

    assert_eq!(token.balance(&buyer), 5_000_000);
    assert_eq!(token.balance(&contract_id), 5_000_000);
    assert_eq!(client.get_active_count(), 1);

    // Sentinel marks condition as satisfied
    let proof: BytesN<32> = BytesN::from_array(&env, &[42u8; 32]);
    client.mark_condition_met(&agreement_id, &sentinel, &proof);

    let agr = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(agr.status, AgreementStatus::ConditionMet);

    // Sentinel settles payment to seller
    client.settle(&agreement_id, &sentinel);

    assert_eq!(token.balance(&seller), 5_000_000);
    assert_eq!(token.balance(&contract_id), 0);

    let settled_agr = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(settled_agr.status, AgreementStatus::Settled);
}

#[test]
fn test_escrow_refund_after_timeout() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sentinel = Address::generate(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&buyer, &10_000_000);

    let contract_id = env.register(KofuEscrowContract, ());
    let client = KofuEscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &sentinel);

    let agreement_id = Symbol::new(&env, "kofu_002");
    let amount = 3_000_000;
    let timeout = 500;

    client.deposit(&agreement_id, &buyer, &seller, &token.address, &amount, &timeout);
    assert_eq!(token.balance(&buyer), 7_000_000);

    // Fast-forward ledger past timeout
    env.ledger().set_sequence_number(501);

    // Buyer claims refund
    client.refund(&agreement_id, &buyer);

    assert_eq!(token.balance(&buyer), 10_000_000);
    assert_eq!(token.balance(&contract_id), 0);

    let agr = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(agr.status, AgreementStatus::Refunded);
}

#[test]
fn test_escrow_sentinel_abort_refund() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sentinel = Address::generate(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&buyer, &5_000_000);

    let contract_id = env.register(KofuEscrowContract, ());
    let client = KofuEscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &sentinel);

    let agreement_id = Symbol::new(&env, "kofu_003");
    client.deposit(&agreement_id, &buyer, &seller, &token.address, &5_000_000, &10_000);

    // Sentinel aborts/refunds immediately without waiting for timeout
    client.refund(&agreement_id, &sentinel);

    assert_eq!(token.balance(&buyer), 5_000_000);
    let agr = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(agr.status, AgreementStatus::Refunded);
}
