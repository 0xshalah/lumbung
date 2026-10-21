#![cfg(test)]

extern crate std;

use soroban_sdk::{
    testutils::{Address as _, Events as _},
    token::{StellarAssetClient, TokenClient},
    Address, Env, Event, MuxedAddress,
};
use stellar_tokens::vault::{Deposit, Vault, Withdraw};

use crate::{LumbungVault, LumbungVaultClient};

/// 1 XLM in stroops (asset decimals = 7).
const XLM: i128 = 10_000_000;
/// Share decimals = 10 (asset 7 + offset 3).
const SHARE_DECIMALS: u32 = 10;
const OFFSET: u32 = 3;

fn setup<'a>(e: &'a Env) -> (Address, Address, LumbungVaultClient<'a>) {
    let admin = Address::generate(e);
    let sac = e.register_stellar_asset_contract_v2(admin);
    let asset = sac.address();
    let id = e.register(
        LumbungVault,
        (
            soroban_sdk::String::from_str(e, "Lumbung Vault Share"),
            soroban_sdk::String::from_str(e, "LMB"),
            asset.clone(),
            OFFSET,
        ),
    );
    let client = LumbungVaultClient::new(e, &id);
    (id, asset, client)
}

fn mint_xlm(e: &Env, asset: &Address, to: &Address, amount: i128) {
    e.mock_all_auths();
    StellarAssetClient::new(e, asset).mint(to, &amount);
}

// ---------------------------------------------------------------------------
// A. Konstruksi
// ---------------------------------------------------------------------------

#[test]
fn t01_constructor_metadata() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);

    assert_eq!(client.decimals(), SHARE_DECIMALS);
    assert_eq!(
        client.name(),
        soroban_sdk::String::from_str(&e, "Lumbung Vault Share")
    );
    assert_eq!(
        client.symbol(),
        soroban_sdk::String::from_str(&e, "LMB")
    );
    assert_eq!(client.query_asset(), asset);
    assert_eq!(client.total_assets(), 0);
    assert_eq!(client.total_supply(), 0);
}

#[test]
fn t20_set_asset_twice_panics() {
    let e = Env::default();
    let (_id, _asset, _client) = setup(&e);
    let other = Address::generate(&e);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        Vault::set_asset(&e, other);
    }));
    assert!(result.is_err(), "set_asset kedua kali harus panic 401");
}

// ---------------------------------------------------------------------------
// B. Deposit
// ---------------------------------------------------------------------------

#[test]
fn t02_first_deposit_virtual_offset() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 10 * XLM);

    let shares = client.deposit(&(10 * XLM), &user, &user, &user);

    // 10 XLM * 10^offset = 10 * 10^10 raw share units.
    assert_eq!(shares, 100_000_000_000);
    assert_eq!(client.balance(&user), shares);
    assert_eq!(client.total_assets(), 10 * XLM);
    assert_eq!(client.total_supply(), shares);
}

#[test]
fn t03_second_deposit_keeps_price() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let alice = Address::generate(&e);
    let bob = Address::generate(&e);
    mint_xlm(&e, &asset, &alice, 10 * XLM);
    mint_xlm(&e, &asset, &bob, 10 * XLM);

    let alice_shares = client.deposit(&(10 * XLM), &alice, &alice, &alice);
    let bob_shares = client.deposit(&(10 * XLM), &bob, &bob, &bob);

    // Virtual offset membuat deposit kedua satu unit lebih kecil, bukan persis sama.
    assert_eq!(alice_shares, 100_000_000_000);
    assert!(
        bob_shares >= 99_999_999_990 && bob_shares <= 100_000_000_010,
        "bob shares di luar toleransi: {bob_shares}"
    );
    assert_eq!(client.total_assets(), 20 * XLM);
}

#[test]
fn t04_donation_attack_unprofitable() {
    let e = Env::default();
    let (id, asset, client) = setup(&e);
    let attacker = Address::generate(&e);
    let victim = Address::generate(&e);
    mint_xlm(&e, &asset, &attacker, 1_000 * XLM + 1);
    mint_xlm(&e, &asset, &victim, 100 * XLM);

    // Seed supply dengan 1 stroop.
    client.deposit(&1, &attacker, &attacker, &attacker);
    assert_eq!(client.balance(&attacker), 1_000);

    // Donation langsung ke kontrak: tidak mencetak share.
    // Skenario wajar: donation 10x deposit korban.
    TokenClient::new(&e, &asset).transfer(
        &attacker,
        &MuxedAddress::from(id.clone()),
        &(1_000 * XLM),
    );

    let victim_shares = client.deposit(&(100 * XLM), &victim, &victim, &victim);
    assert!(victim_shares > 0, "korban mendapat 0 share");

    // Offset 3 membatasi kerugian korban: dengan donation 10x, kerugian < 1%.
    // (Serangan baru efektif bila donation > ~1000x deposit, dan itu merugikan penyerang.)
    let victim_value = client.convert_to_assets(&victim_shares);
    assert!(
        victim_value >= 99 * XLM,
        "kerugian korban melebihi 1%: {victim_value}"
    );

    let attacker_value = client.convert_to_assets(&client.balance(&attacker));
    assert!(
        attacker_value < 1 + 1_000 * XLM,
        "serangan menguntungkan: {attacker_value}"
    );
}

#[test]
fn t05_deposit_zero_is_noop() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 10 * XLM);

    // OZ 0.7.2 hanya menolak amount < 0, jadi 0 adalah no-op yang valid.
    let shares = client.deposit(&0, &user, &user, &user);
    assert_eq!(shares, 0);
    assert_eq!(client.balance(&user), 0);
    assert_eq!(client.total_supply(), 0);
    assert_eq!(client.total_assets(), 0);
}

#[test]
fn t06_deposit_over_balance_fails() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, XLM); // hanya 1 XLM

    let res = client.try_deposit(&(10 * XLM), &user, &user, &user);
    assert!(res.is_err(), "deposit melebihi saldo harus gagal");
}

#[test]
fn t10_preview_deposit_matches_execution() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 10 * XLM);

    let preview = client.preview_deposit(&(10 * XLM));
    let executed = client.deposit(&(10 * XLM), &user, &user, &user);
    assert_eq!(preview, executed);
}

// ---------------------------------------------------------------------------
// C. Withdraw & redeem
// ---------------------------------------------------------------------------

#[test]
fn t07_partial_withdraw_burns_previewed_shares() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 100 * XLM);
    let minted = client.deposit(&(100 * XLM), &user, &user, &user);

    let preview = client.preview_withdraw(&(40 * XLM));
    let burned = client.withdraw(&(40 * XLM), &user, &user, &user);

    assert_eq!(burned, preview);
    assert_eq!(client.balance(&user), minted - burned);
    assert_eq!(client.total_assets(), 60 * XLM);
}

#[test]
fn t08_withdraw_max_zeroes_shares() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 100 * XLM);
    client.deposit(&(100 * XLM), &user, &user, &user);

    let max = client.max_withdraw(&user);
    assert_eq!(max, 100 * XLM);
    client.withdraw(&max, &user, &user, &user);

    assert_eq!(client.balance(&user), 0);
    assert_eq!(client.total_supply(), 0);
    assert_eq!(client.total_assets(), 0);
}

#[test]
fn t09_redeem_all_returns_deposit() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 100 * XLM);
    client.deposit(&(100 * XLM), &user, &user, &user);

    let shares = client.balance(&user);
    let assets = client.redeem(&shares, &user, &user, &user);

    assert!(assets <= 100 * XLM && assets >= 100 * XLM - 2);
    assert_eq!(client.balance(&user), 0);
    assert_eq!(client.total_supply(), 0);
}

#[test]
fn t11_preview_withdraw_matches_execution() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 100 * XLM);
    client.deposit(&(100 * XLM), &user, &user, &user);

    let preview = client.preview_withdraw(&(25 * XLM));
    let executed = client.withdraw(&(25 * XLM), &user, &user, &user);
    assert_eq!(preview, executed);
}

#[test]
fn t19_convert_roundtrip() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 100 * XLM);
    client.deposit(&(100 * XLM), &user, &user, &user);

    let shares = client.balance(&user);
    let assets = client.convert_to_assets(&shares);
    let back = client.convert_to_shares(&assets);

    let diff = if back > shares { back - shares } else { shares - back };
    assert!(diff <= 1, "round-trip drift {diff}");
}

// ---------------------------------------------------------------------------
// D. Auth & allowance
// ---------------------------------------------------------------------------

#[test]
fn t12_deposit_on_behalf_requires_auth_and_allowance() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let owner = Address::generate(&e);
    let operator = Address::generate(&e);
    mint_xlm(&e, &asset, &owner, 10 * XLM);

    // 1) Tanpa otorisasi sama sekali.
    e.set_auths(&[]);
    assert!(client
        .try_deposit(&(10 * XLM), &owner, &owner, &operator)
        .is_err());

    // 2) Operator authorized, tetapi allowance aset tidak diberikan.
    e.mock_all_auths();
    assert!(client
        .try_deposit(&(10 * XLM), &owner, &owner, &operator)
        .is_err());
}

#[test]
fn t13_deposit_on_behalf_with_allowance_succeeds() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let owner = Address::generate(&e);
    let operator = Address::generate(&e);
    mint_xlm(&e, &asset, &owner, 10 * XLM);

    e.mock_all_auths();
    TokenClient::new(&e, &asset).approve(
        &owner,
        &operator,
        &(10 * XLM),
        &(e.ledger().sequence() + 1_000),
    );

    let shares = client.deposit(&(10 * XLM), &owner, &owner, &operator);
    assert_eq!(shares, 100_000_000_000);
    assert_eq!(client.balance(&owner), shares);
}

#[test]
fn t14_withdraw_on_behalf_without_share_allowance_fails() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let owner = Address::generate(&e);
    let operator = Address::generate(&e);
    mint_xlm(&e, &asset, &owner, 100 * XLM);
    client.deposit(&(100 * XLM), &owner, &owner, &owner);

    e.mock_all_auths();
    let res = client.try_withdraw(&(10 * XLM), &operator, &owner, &operator);
    assert!(res.is_err(), "withdraw on-behalf tanpa allowance harus gagal");
}

// ---------------------------------------------------------------------------
// E. Transfer share (SEP-41)
// ---------------------------------------------------------------------------

#[test]
fn t15_transfer_shares() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let alice = Address::generate(&e);
    let bob = Address::generate(&e);
    mint_xlm(&e, &asset, &alice, 10 * XLM);
    let minted = client.deposit(&(10 * XLM), &alice, &alice, &alice);

    e.mock_all_auths();
    client.transfer(
        &alice,
        &MuxedAddress::from(bob.clone()),
        &1_000_000_000,
    );

    assert_eq!(client.balance(&alice), minted - 1_000_000_000);
    assert_eq!(client.balance(&bob), 1_000_000_000);
    assert_eq!(client.total_supply(), minted);
}

#[test]
fn t16_approve_and_transfer_from() {
    let e = Env::default();
    let (_id, asset, client) = setup(&e);
    let alice = Address::generate(&e);
    let bob = Address::generate(&e);
    let carol = Address::generate(&e);
    mint_xlm(&e, &asset, &alice, 10 * XLM);
    client.deposit(&(10 * XLM), &alice, &alice, &alice);

    e.mock_all_auths();
    let amount = 2_000_000_000i128;
    client.approve(&alice, &bob, &amount, &(e.ledger().sequence() + 1_000));
    assert_eq!(client.allowance(&alice, &bob), amount);

    client.transfer_from(&bob, &alice, &carol, &amount);

    assert_eq!(client.allowance(&alice, &bob), 0);
    assert_eq!(client.balance(&carol), amount);
}

// ---------------------------------------------------------------------------
// F. Event
// ---------------------------------------------------------------------------

#[test]
fn t17_deposit_event() {
    let e = Env::default();
    let (id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 10 * XLM);

    client.deposit(&(10 * XLM), &user, &user, &user);

    let expected = Deposit {
        operator: user.clone(),
        from: user.clone(),
        receiver: user.clone(),
        assets: 10 * XLM,
        shares: 100_000_000_000,
    };
    assert_eq!(
        e.events().all().filter_by_contract(&id),
        [expected.to_xdr(&e, &id)]
    );
}

#[test]
fn t18_withdraw_event() {
    let e = Env::default();
    let (id, asset, client) = setup(&e);
    let user = Address::generate(&e);
    mint_xlm(&e, &asset, &user, 100 * XLM);
    client.deposit(&(100 * XLM), &user, &user, &user);

    let burned = client.withdraw(&(40 * XLM), &user, &user, &user);

    let expected = Withdraw {
        operator: user.clone(),
        receiver: user.clone(),
        owner: user.clone(),
        assets: 40 * XLM,
        shares: burned,
    };
    assert_eq!(
        e.events().all().filter_by_contract(&id),
        [expected.to_xdr(&e, &id)]
    );
}

/// Replikasi persis skenario `donation_attack` dari Aegis Vault Checker (21 Okt 2026).
///
/// Angka disalin apa adanya dari laporan resmi: penyerang deposit 1 stroop lalu donasi
/// 100_000_000 stroops langsung ke kontrak (melewati `deposit`, jadi tidak mencetak
/// share); lalu korban deposit 5_000_000 stroops dan menerima 99 share.
///
/// Yang diuji di sini: apakah "99 dari 5_000_000_000 share" berarti korban kehilangan
/// deposit-nya, atau cuma jumlah share-nya yang anjlok karena harga share ikut bergeser.
/// Jawaban: yang kedua. Nilainya hampir utuh, dan ini yang tidak terlihat di verdict.
#[test]
fn t21_aegis_donation_scenario_value_loss() {
    let e = Env::default();
    let (id, asset, client) = setup(&e);
    let attacker = Address::generate(&e);
    let victim = Address::generate(&e);
    mint_xlm(&e, &asset, &attacker, 200_000_000);
    mint_xlm(&e, &asset, &victim, 10_000_000);

    // 1. Penyerang deposit 1 stroop.
    client.deposit(&1, &attacker, &attacker, &attacker);

    // 2. Donasi langsung ke kontrak: tidak mencetak share.
    TokenClient::new(&e, &asset).transfer(
        &attacker,
        &MuxedAddress::from(id.clone()),
        &100_000_000,
    );

    // 3. Kalau tidak ada donasi, korban akan menerima 5_000_000_000 share.
    let expected_shares = 5_000_000_000i128;

    // 4. Korban deposit 5_000_000 stroops.
    let victim_shares = client.deposit(&5_000_000, &victim, &victim, &victim);

    // 5. Berapa yang benar-benar kembali ke korban, diukur dalam aset.
    let value = client.convert_to_assets(&victim_shares);

    std::println!(
        "korban: deposit 5_000_000 stroops -> {victim_shares} share (warta: 5_000_000_000) \
         = {:.4}% dari harapan | nilai balik: {value} stroops ({:.4} XLM) = {:.2}% dari deposit",
        victim_shares as f64 / expected_shares as f64 * 100.0,
        value as f64 / 10_000_000.0,
        value as f64 / 5_000_000.0 * 100.0,
    );

    // Jumlah share anjlok hampir nol: 99 dari 5 miliar, jadi < 0,01% dari harapan.
    assert!(
        victim_shares * 10_000 < expected_shares,
        "share count ternyata tidak serapuh: {victim_shares}"
    );

    // Tapi nilai deposit korban yang kembali hampir utuh: ruginya di bawah 1%.
    assert!(
        value * 100 >= 5_000_000 * 99,
        "rugi nilai korban melebihi 1%: {value} dari 5_000_000 stroops"
    );
}
