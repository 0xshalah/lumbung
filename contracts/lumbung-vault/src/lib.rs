#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, MuxedAddress, String};
use stellar_tokens::{
    fungible::{Base, FungibleToken},
    vault::{FungibleVault, Vault},
};

#[cfg(test)]
mod test;

#[contract]
pub struct LumbungVault;

#[contractimpl]
impl LumbungVault {
    /// Dipanggil sekali saat deploy. Tidak ada fungsi re-inisialisasi.
    pub fn __constructor(
        e: &Env,
        name: String,
        symbol: String,
        asset: Address,
        decimals_offset: u32,
    ) {
        // Urutan WAJIB: asset -> offset -> metadata.
        // `decimals()` = asset_decimals + offset, jadi offset harus di-set
        // sebelum metadata dibekukan.
        Vault::set_asset(e, asset);
        Vault::set_decimals_offset(e, decimals_offset);
        Base::set_metadata(e, Self::decimals(e), name, symbol);
    }
}

#[contractimpl(contracttrait)]
impl FungibleToken for LumbungVault {
    type ContractType = Vault;

    fn decimals(e: &Env) -> u32 {
        Vault::decimals(e)
    }
}

#[contractimpl(contracttrait)]
impl FungibleVault for LumbungVault {}
