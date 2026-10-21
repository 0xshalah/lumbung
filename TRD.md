# TRD — Lumbung Vault

**Technical Requirements & Implementation Document**

| Field | Value |
|---|---|
| Versi | 1.0 (implementasi) |
| Tanggal | 21 Oktober 2026, 14.30 WIB |
| Status | Disetujui untuk dieksekusi |
| Pemilik | Shalahuddin Al-Ayyubi |
| Dokumen terkait | [`PRD.md`](./PRD.md) v0.2 · [`TASKS.md`](./TASKS.md) v0.2 · [`LANDING.md`](./LANDING.md) v0.2 |
| Target | Submission Aegis Vault Reward Challenge, **24 Okt 2026 23.59 WIB** |
| Deadline internal | **24 Okt 2026 20.00 WIB** |

> **Cara membaca dokumen ini.** Bagian 1–5 adalah keputusan dan batas. Bagian 6–9 adalah spesifikasi yang bisa langsung dieksekusi. Bagian 10–17 adalah jaminan kualitas, operasi, dan rencana harian. Semua angka versi, signature fungsi, dan perintah di dokumen ini **sudah diverifikasi** terhadap source/kode resmi per 21 Okt 2026 — bukan karangan. Yang belum terverifikasi ditandai eksplisit dengan `⚠️ VERIFY`.

---

## 1. Ringkasan

Lumbung adalah **vault tokenized SEP-56** di Stellar Testnet: pengguna menyetor XLM dan menerima share (SEP-41) yang mewakili porsi kepemilikan pool. Tidak ada admin, tidak ada biaya, tidak ada lockup, tidak ada whitelist.

Dokumen ini menetapkan bagaimana tiga komponen dibangun dan disatukan:

1. **Kontrak** — Rust + Soroban, memakai OpenZeppelin `stellar-tokens` 0.7.2.
2. **Web** — satu aplikasi React yang memuat landing (`/`) dan vault app (`/app`).
3. **Artefak submission** — bukti checker Aegis + brief + post X.

**Prinsip yang tidak boleh dilanggar:**

| # | Prinsip | Konsekuensi bila dilanggar |
|---|---|---|
| P1 | Kontrak adalah satu-satunya hal yang dinilai checker | Landing sempurna tidak menyelamatkan kontrak yang gagal conformance |
| P2 | Tidak ada data palsu yang ditampilkan sebagai data on-chain | Kredibilitas hancur saat juri membandingkan landing dengan hasil checker |
| P3 | Semua aritmatika uang memakai `BigInt`/`i128`, tidak pernah `Number` | Kehilangan presisi pada 7 desimal (R5) |
| P4 | Desimal share **dibaca dari chain**, tidak di-hardcode | Offset 3 membuat share 10 desimal, bukan 7 |
| P5 | Private key tidak pernah menyentuh kode aplikasi | NFR-03 |
| P6 | Setiap artefak submission memuat contract address | Syarat eksplisit grup Aegis |

---

## 2. Keputusan arsitektur (ADR)

| ID | Keputusan | Alternatif yang ditolak | Alasan | Konsekuensi |
|---|---|---|---|---|
| AD-01 | **Satu repo** `lumbung-vault` dengan `contracts/`, `web/`, `submission/`, `docs/` | Dua repo terpisah | Brief & post X harus menunjuk satu produk; bukti proyek jadi koheren | Perlu merge repo landing (riwayat git landing dipertahankan via subtree) |
| AD-02 | **Web tetap React 19 SPA (CRA/craco)**, bukan Next.js 16 | Port ke Next.js + Tailwind 4 | Landing sudah jadi & terbukti build; dApp tidak butuh SSR; 3–4 jam porting lebih baik dialihkan ke kontrak | PRD §8 harus diamendemen; `craco.config.js` dipertahankan sebagai lapisan kompatibilitas |
| AD-03 | **Tidak ada backend di P0** | Indexer + API sekarang | Retensi RPC 7 hari cukup untuk challenge; D6 PRD | Riwayat panjang & grafik TVL ditunda ke P1 (pasca-submission) |
| AD-04 | **Baca state langsung dari RPC** via `simulateTransaction` | Cache server / cron | Tanpa server; cukup untuk traffic challenge | Perlu akun source read-only yang funded |
| AD-05 | **`decimals_offset = 3`** | 0 (default) | Mitigasi donation/inflation attack (SEP-56 §Notes On Decimals Offset) | Share = 10 desimal; semua formatter wajib dinamis |
| AD-06 | **XLM via SAC** sebagai underlying | USDC | Tanpa trustline → onboarding 1 langkah | Butuh SAC address testnet yang benar |
| AD-07 | **Tanpa `Capped`, tanpa admin, tanpa upgrade** | Ownable/Capped | Permissionless & lolos pemeriksaan "no admin keys" | Tidak bisa memperbaiki kontrak setelah deploy → QA wajib sebelum deploy |
| AD-08 | **Pakai high-level trait OZ**, tidak menulis ulang logika vault | Implementasi sendiri | Auth, event, pembulatan sudah teruji | Wajib paham `deposit_internal`/`withdraw_internal` tidak boleh dipanggil langsung |
| AD-09 | **Deploy web di Vercel** dengan SPA rewrite | Netlify / GitHub Pages | Satu platform, gratis, rewrite mudah | Wajib `vercel.json`; tanpa itu `/app` 404 |
| AD-10 | **Artefak disimpan di `submission/` dan di-commit** | Google Drive saja | Dapat diaudit ulang; address terlihat di repo | Ukuran video besar → pakai Git LFS atau link eksternal + file pointer |

---

## 3. Ruang lingkup

### 3.1 Termasuk (P0)

| Komponen | Item |
|---|---|
| Kontrak | SEP-41 + SEP-56 lengkap via OZ, constructor, deploy testnet, verifikasi |
| Web | `/` landing (sudah ada, diperbaiki), `/app` fungsional (connect, deposit, withdraw, redeem) |
| Data | Baca `total_assets`, `total_supply`, `decimals`, `query_asset`, `balance`, `max_*`, `preview_*` |
| Submission | Screen record, screenshot, JSON, MD, brief, post X |
| Dokumen | PRD v0.3, TASKS v0.3, TRD v1.0, README repo |

### 3.2 Tidak termasuk (dengan alasan)

| Item | Alasan |
|---|---|
| Indexer riwayat + grafik TVL | P1; butuh DB + scheduler; tidak dinilai checker |
| Faucet otomatis | Friendbot link sudah cukup |
| Transfer share UI | P1 (`transfer` tetap ada di kontrak dan bisa diuji via CLI) |
| Multi-asset, yield, APY | P2; mengundang klaim yang tidak bisa dibuktikan |
| Mainnet | Testnet-only, sesuai challenge |
| i18n halaman `/app` | Landing sudah EN/ID; app cukup EN |

---

## 4. Arsitektur sistem

### 4.1 Diagram komponen

```
┌─────────────────────────────────────────────────────────────────────┐
│ Browser                                                             │
│                                                                     │
│  /  Landing (React)          /app  Vault App (React)                │
│  ├─ copy EN/ID               ├─ WalletBar                           │
│  ├─ StatsPanel ──────┐       ├─ PositionCard                        │
│  └─ ContractId       │       ├─ ActionPanel (Deposit | Withdraw)    │
│                      │       └─ TxDialog                            │
│                      ▼                ▼                             │
│              lib/vault-read.js   lib/tx.js  lib/wallet.js           │
│                      └────────┬───────┘                             │
└───────────────────────────────┼─────────────────────────────────────┘
                                │ HTTPS (JSON-RPC)
                                ▼
                 ┌──────────────────────────────┐
                 │ Soroban Testnet RPC          │
                 │ soroban-testnet.stellar.org  │
                 └──────────────┬───────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │ Vault Contract (C...)        │
                 │ ├─ SEP-41 share token        │
                 │ ├─ SEP-56 vault logic        │
                 │ └─ asset: XLM SAC (C...)     │
                 └──────────────┬───────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │ Stellar Asset Contract (XLM) │
                 └──────────────────────────────┘

  Off-chain, sekali jalan:
  Aegis Checker ──► RPC ──► Vault ──► JSON/MD + rekaman
```

### 4.2 Alur baca (read)

```
UI mount
  └─► readVault()
        ├─ source = wallet?.address ?? READONLY_SOURCE
        ├─ simulate total_assets()      ─┐
        ├─ simulate total_supply()       │ 4 panggilan terpisah,
        ├─ simulate decimals()           │ dijalankan paralel
        ├─ simulate query_asset()       ─┘
        └─ (bila wallet terhubung)
             ├─ simulate balance(user)
             ├─ simulate max_withdraw(user)
             └─ simulate max_redeem(user)
  └─► render (loading → ok | error | not-deployed)
```

**Aturan:** setiap hasil simulasi dibaca lewat `scValToNative()` dan **segera** dikonversi ke `BigInt`. Tidak ada `Number` untuk nilai moneter.

### 4.3 Alur tulis (write)

```
User menekan "Deposit"
  └─► validate (address, amount > 0, balance cukup)
        └─► simulate deposit(...)               → dapat footprint + hasil preview
              └─► user menandatangani (wallet)  → XDR
                    └─► sendTransaction          → hash
                          └─► poll getTransaction tiap 1s (maks 30s)
                                └─► SUCCESS | FAILED
```

### 4.4 Batas kepercayaan

| Batas | Aturan |
|---|---|
| Browser ↔ wallet | Signing **hanya** di wallet. Aplikasi tidak pernah melihat secret |
| Browser ↔ RPC | RPC tidak dipercaya untuk kebenaran final; status tx dikonfirmasi lewat `getTransaction` |
| RPC ↔ kontrak | Kontrak adalah sumber kebenaran; UI hanya menampilkan hasil simulasi/`getTransaction` |
| Submission ↔ checker | Address di JSON/MD, di brief, di X, dan di landing **harus identik** |

---

## 5. Struktur repo

```
lumbung-vault/
├── README.md                       # cara build, deploy, alamat kontrak
├── .gitignore
├── docs/
│   ├── PRD.md
│   ├── TASKS.md
│   ├── TRD.md                      # dokumen ini
│   ├── LANDING.md
│   └── raw/                        # arsip chat WhatsApp (bukti konteks)
├── contracts/
│   └── lumbung-vault/
│       ├── Cargo.toml
│       ├── rust-toolchain.toml
│       ├── src/
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Makefile
├── web/
│   ├── package.json
│   ├── package-lock.json           # WAJIB di-commit
│   ├── craco.config.js             # dipertahankan, dibersihkan
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                 # SPA rewrites
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.svg
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── pages/                  # Landing, VaultApp, Docs, Status, Changelog
│       ├── components/
│       │   ├── landing/
│       │   ├── app/
│       │   └── ui/                 # shadcn
│       └── lib/
│           ├── config.js
│           ├── rpc.js              # BARU: koneksi Soroban RPC
│           ├── vault-read.js       # DIISI: baca state nyata
│           ├── vault-write.js      # BARU: deposit/withdraw
│           ├── wallet.js           # BARU: adapter wallets-kit
│           ├── format.js           # diperbaiki: desimal dinamis
│           ├── tx-state.js         # BARU: state machine + error map
│           ├── copy.js
│           ├── app-copy.js
│           ├── pages-copy.js
│           └── i18n.js
└── submission/
    ├── README.md                   # checklist + cara reproduksi
    ├── brief-lumbung.md
    ├── checker.json
    ├── checker.md
    ├── screenshots/
    └── video.md                    # link rekaman (file besar di luar repo)
```

---

## 6. Toolchain & versi terkunci

### 6.1 Status mesin (per 21 Okt 14.30 WIB)

| Komponen | Versi target | Status |
|---|---|---|
| Node.js | 26.8.2 | ✅ terpasang |
| npm | 11.19.1 | ✅ terpasang |
| Rust (stable) | ≥ 1.8x | ❌ **belum terpasang** |
| Target `wasm32v1-none` | — | ❌ belum |
| Stellar CLI | 28.x | ❌ **belum terpasang** |
| Chromium (QA/screenshot) | 154 | ✅ terpasang |
| Freighter | — | ⚠️ VERIFY: pastikan terpasang & punya akun testnet |

> **R2 masih hidup.** Timebox pemasangan toolchain: **45 menit**. Bila lewat, pakai binary rilis resmi (lihat §13.1).

### 6.2 Versi library yang dikunci

| Library | Versi | Sumber | Catatan |
|---|---|---|---|
| `soroban-sdk` | `26.1.1` | crates.io | `26.1.0` **tidak bisa dipakai**: ia mengunci `soroban-env-host 26.1.3` yang menarik `ed25519-dalek 3.0.0` dengan API `rand_core` yang tidak kompatibel → gagal compile. `26.1.1` memakai `env-host 26.1.4` (dalek 2.x). |
| `stellar-tokens` | `0.7.2` | crates.io | **Jangan** upgrade ke 0.8.x (butuh SDK lebih baru) |
| `@stellar/stellar-sdk` | `17.2.1` | npm | |
| `@creit.tech/stellar-wallets-kit` | `2.7.1` | npm | |
| `react` / `react-dom` | `19.0.0` | npm | sudah terpasang di landing |
| `tailwindcss` | `3.4.17` | npm | |
| `@craco/craco` | `7.1.0` | npm | |
| `ajv` | `8.20.0` | npm | **wajib ditambahkan** (lihat §8.9 L2) |

**Aturan NFR-06:** `Cargo.lock` dan `package-lock.json` **wajib** ada di repo. `package.json` memakai versi eksak (tanpa `^`) untuk semua dependency produksi.

### 6.3 Jaringan

| Item | Nilai |
|---|---|
| Network | Testnet |
| Passphrase | `Test SDF Network ; September 2015` |
| RPC URL | `https://soroban-testnet.stellar.org` |
| RPC alternatif | `https://soroban-rpc.testnet.stellar.gateway.fm` |
| XLM SAC (testnet) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Explorer | `https://stellar.expert/explorer/testnet/contract/<C...>` |

---

## 7. Kontrak

### 7.1 Dependensi

`contracts/lumbung-vault/Cargo.toml`:

```toml
[package]
name = "lumbung-vault"
version = "0.1.0"
edition = "2021"
license = "MIT"
publish = false

[lib]
crate-type = ["cdylib"]
doctest = false

[dependencies]
# 26.1.1 wajib: 26.1.0 menarik env-host 26.1.3 yang gagal compile.
soroban-sdk = "=26.1.1"
stellar-tokens = "=0.7.2"

[dev-dependencies]
soroban-sdk = { version = "=26.1.1", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true
```

`contracts/lumbung-vault/rust-toolchain.toml`:

```toml
[toolchain]
channel = "stable"
targets = ["wasm32v1-none"]
components = ["rustfmt", "clippy", "rust-src"]
```

> `overflow-checks = true` penting: kegagalan aritmetika harus panic, bukan wrap-around.

### 7.2 Kode kontrak (terverifikasi terhadap contoh resmi v0.7.2)

`contracts/lumbung-vault/src/lib.rs`:

```rust
#![no_std]

// `MuxedAddress` WAJIB diimpor: macro `contracttrait` meng-expand default fn
// `transfer` yang mereferensikan tipe ini di scope crate. Tanpa impor → E0425.
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
        // Urutan WAJIB: asset → offset → metadata.
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
```

**Yang didapat gratis dari OZ (dan tidak boleh ditulis ulang):**

- SEP-41: `allowance`, `approve`, `balance`, `transfer`, `transfer_from`, `decimals`, `name`, `symbol`, `total_supply` (9 fungsi)
- SEP-56: `total_assets`, `query_asset`, `convert_to_shares`, `convert_to_assets`, `max_deposit/mint/withdraw/redeem`, `preview_*`, `deposit`, `mint`, `withdraw`, `redeem` (16 fungsi)
- Event `deposit` & `withdraw`
- Pembulatan & penanganan overflow (muldiv ala Script3)

> **Koreksi hasil build (21 Okt):** `burn` dan `burn_from` **tidak** ikut. Keduanya ada di extension `FungibleBurnable`, bukan di `FungibleToken`, dan vault tidak mengimplementasikannya. Ini benar: share hanya dibakar internal saat `withdraw`/`redeem`. Spec final = **26 entri** (9 + 16 + `__constructor`).

> ⚠️ **Jangan** memanggil `Vault::deposit_internal` / `Vault::withdraw_internal` dari wrapper sendiri. Keduanya **melewati auth** dan hanya boleh dipakai dari high-level function.

### 7.3 Constructor

| Arg | Tipe | Nilai Lumbung | Catatan |
|---|---|---|---|
| `name` | `String` | `Lumbung Vault Share` | metadata SEP-41 |
| `symbol` | `String` | `LMB` | |
| `asset` | `Address` | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | XLM SAC testnet |
| `decimals_offset` | `u32` | `3` | maks 10 (OZ `MAX_DECIMALS_OFFSET`) |

**Hasil:** `decimals()` = 7 + 3 = **10**. `query_asset()` tidak akan panic karena asset di-set di constructor (menutup deviation SEP-56).

**Inisialisasi hanya sekali:** `set_asset` dan `set_decimals_offset` mem-panic dengan `401`/`402` bila dipanggil dua kali. Tidak ada jalur untuk mengganti asset setelah deploy.

### 7.4 Permukaan fungsi

#### SEP-41 (share token)

| Fungsi | Signature | Auth | Catatan |
|---|---|---|---|
| `name` | `() -> String` | — | |
| `symbol` | `() -> String` | — | |
| `decimals` | `() -> u32` | — | **10** (override ke `Vault::decimals`) |
| `total_supply` | `() -> i128` | — | unit share (10 desimal) |
| `balance` | `(id: Address) -> i128` | — | |
| `allowance` | `(from, spender) -> i128` | — | |
| `approve` | `(from, spender, amount, expiration_ledger) -> bool` | `from` | |
| `transfer` | `(from, to: MuxedAddress, amount) -> ()` | `from` | |
| `transfer_from` | `(spender, from, to, amount) -> ()` | `spender` | butuh allowance |

> `burn` / `burn_from` **tidak ada** di ABI. Vault membakar share secara internal saat
> `withdraw`/`redeem`. Menambahkannya berarti mengimplementasikan `FungibleBurnable`,
> yang membuka jalur pembakaran share milik orang lain — tidak diperlukan untuk P0.

#### SEP-56 (vault)

| Fungsi | Signature | Auth | Pembulatan |
|---|---|---|---|
| `query_asset` | `() -> Address` | — | — |
| `total_assets` | `() -> i128` | — | — |
| `convert_to_shares` | `(assets: i128) -> i128` | — | floor |
| `convert_to_assets` | `(shares: i128) -> i128` | — | floor |
| `max_deposit` | `(receiver) -> i128` | — | — |
| `preview_deposit` | `(assets) -> i128` | — | floor |
| `deposit` | `(assets, receiver, from, operator) -> i128` | `operator` | floor |
| `max_mint` | `(receiver) -> i128` | — | — |
| `preview_mint` | `(shares) -> i128` | — | ceil |
| `mint` | `(shares, receiver, from, operator) -> i128` | `operator` | ceil |
| `max_withdraw` | `(owner) -> i128` | — | — |
| `preview_withdraw` | `(assets) -> i128` | — | ceil |
| `withdraw` | `(assets, receiver, owner, operator) -> i128` | `operator` | ceil |
| `max_redeem` | `(owner) -> i128` | — | — |
| `preview_redeem` | `(shares) -> i128` | — | floor |
| `redeem` | `(shares, receiver, owner, operator) -> i128` | `operator` | floor |

> **Urutan argumen `deposit` adalah `(assets, receiver, from, operator)`** — bukan `(assets, receiver, operator, from)`. Kesalahan urutan ini adalah bug integrasi paling umum; lihat §8.6.

### 7.5 Otorisasi & alur allowance (terverifikasi dari `vault/storage.rs`)

```
deposit(assets, receiver, from, operator):
    operator.require_auth()
    if operator == from:  asset.transfer(from → vault, assets)
    else:                 asset.transfer_from(operator, from → vault, assets)
    mint shares ke receiver

withdraw(assets, receiver, owner, operator):
    operator.require_auth()
    if operator != owner: spend_allowance(owner, operator, shares)   # allowance pada SHARE
    burn shares dari owner
    asset.transfer(vault → receiver, assets)
```

**Implikasi untuk UI:**

| Skenario | Panggilan | Approve yang dibutuhkan |
|---|---|---|
| User deposit XLM miliknya sendiri | `deposit(assets, user, user, user)` | ❌ tidak ada |
| User withdraw untuk dirinya | `withdraw(assets, user, user, user)` | ❌ tidak ada |
| Pihak ketiga deposit untuk user | `deposit(assets, receiver, user, operator)` | ✅ allowance XLM (SAC) dari `user` ke `operator` |
| Pihak ketiga withdraw untuk user | `withdraw(assets, receiver, owner, operator)` | ✅ allowance **share** dari `owner` ke `operator` |

P0 hanya memakai dua baris pertama → **tidak ada langkah `approve`** di alur utama. Ini menyederhanakan UI dan mengurangi satu transaksi.

**Kontrak tidak punya admin.** Tidak ada `owner`, tidak ada `upgrade`, tidak ada `pause`, tidak ada fungsi yang bisa memindahkan dana user selain `withdraw`/`redeem` oleh pemilik share. Ini memenuhi NFR-07 dan pemeriksaan permissionless Aegis.

### 7.6 Matematika & pembulatan

Rumus (dengan virtual shares/assets dari offset):

```
totalAssets' = total_assets + 1
totalSupply' = total_supply + 10^decimals_offset

shares  = assets  * totalSupply' / totalAssets'   (floor)   # deposit
assets  = shares  * totalAssets' / totalSupply'   (ceil)    # mint
shares  = assets  * totalSupply' / totalAssets'   (ceil)    # withdraw
assets  = shares  * totalAssets' / totalSupply'   (floor)   # redeem
```

**Aturan:** pembulatan selalu menguntungkan vault (user tidak bisa menarik lebih dari kontribusinya). Ini bukan bug — ini perilaku yang disyaratkan.

**Konsekuensi UI:** tampilkan hasil `preview_*` dari chain, jangan menghitung sendiri di browser. Browser hanya boleh menghitung untuk **tampilan sementara** dan harus sama dengan hasil simulasi; kalau berbeda, percayai chain.

### 7.7 `decimals_offset` = 3

| Aspek | Nilai |
|---|---|
| Desimal asset (XLM) | 7 |
| Desimal share | 10 |
| 1 XLM (10^7 stroops) | ≈ 10^10 unit share = **1,0000000000 share** |
| Virtual shares | 10^3 |
| Virtual assets | 1 |

**Yang berubah di frontend:**

- `formatShares()` **wajib** menerima `decimals` dari chain, bukan `7`.
- Harga per share: `price = (rawAssets * 10^(shareDec - assetDec)) / rawShares`, lalu diformat dengan 7 desimal.
- Saat `total_supply == 0`, harga = 1.0 (bukan pembagian nol).

### 7.8 Event

| Event | Topics | Data |
|---|---|---|
| Deposit | `["deposit", operator: Address, from: Address, receiver: Address]` | `[assets: i128, shares: i128]` |
| Withdraw | `["withdraw", operator: Address, receiver: Address, owner: Address]` | `[assets: i128, shares: i128]` |

- 4 topik per event → masih muat dalam batas filter `getEvents` (maks 4 matcher).
- Event ini yang nanti dipakai indexer P1; untuk challenge, event hanya perlu **muncul** di explorer sebagai bukti.

### 7.9 Kode error

| Kode | Nama | Arti | Penanganan UI |
|---|---|---|---|
| 400 | `VaultAssetAddressNotSet` | asset belum di-set | Tidak mungkin di production (constructor) |
| 401 | `VaultAssetAddressAlreadySet` | set_asset dua kali | — |
| 402 | `VaultVirtualDecimalsOffsetAlreadySet` | offset dua kali | — |
| 403 | `VaultInvalidAssetsAmount` | assets ≤ 0 | "Amount must be greater than zero" |
| 404 | `VaultInvalidSharesAmount` | shares ≤ 0 | idem |
| 405–408 | `VaultExceededMax*` | melebihi `max_*` | "Amount exceeds your balance" |
| 409 | `VaultMaxDecimalsOffsetExceeded` | offset > 10 | deploy gagal (bukan runtime) |
| 410 | `MathOverflow` | overflow | "Amount too large" |

### 7.10 Invariant yang harus selalu benar

| # | Invariant | Cara uji |
|---|---|---|
| I1 | `total_assets() == balance XLM milik kontrak` | bandingkan dengan SAC `balance(vault)` |
| I2 | `total_supply() == Σ balance(user)` | setelah beberapa deposit |
| I3 | `redeem(deposit(a))` mengembalikan `≤ a` | property test |
| I4 | `preview_deposit(x) == deposit(x)` pada state sama | unit test |
| I5 | `withdraw(max_withdraw(u))` berhasil dan menyisakan 0 share | unit test |
| I6 | Pihak ketiga tanpa allowance tidak bisa `deposit` atas nama user | unit test (harus gagal auth) |
| I7 | `query_asset()` tidak panic setelah constructor | unit test |

### 7.11 Build

```bash
cd contracts/lumbung-vault
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
stellar contract build
ls -lh target/wasm32v1-none/release/lumbung_vault.wasm
```

**Budget ukuran wasm:** < 100 KB (OZ vault biasanya 60–90 KB). Kalau lebih besar, cek `opt-level`/`lto`.

### 7.12 Test matrix

| # | Kasus | Ekspektasi |
|---|---|---|
| T01 | Constructor: `query_asset`, `decimals`, `name`, `symbol` | sesuai argumen; decimals = 10 |
| T02 | Deposit pertama 10 XLM | shares ≈ 10 × 10^10 |
| T03 | Deposit kedua user lain, harga tetap | shares sesuai rasio |
| T04 | Donation attack: transfer langsung ke vault sebelum deposit korban | korban tetap dapat shares > 0 (offset 3); dengan donation 10× deposit, kerugian korban < 1%; serangan baru "efektif" bila donation > ~1000× deposit — dan itu selalu merugikan penyerang |
| T05 | `deposit(0)` | **no-op**: mengembalikan 0 share, state tidak berubah (OZ hanya menolak `amount < 0`). Bukan panic 403. |
| T06 | `deposit` melebihi saldo | panic (transfer gagal) |
| T07 | `withdraw` sebagian | shares terbakar sesuai preview |
| T08 | `withdraw` semua via `max_withdraw` | saldo share = 0 |
| T09 | `redeem` semua share | XLM kembali ≤ deposit awal |
| T10 | `preview_deposit` vs `deposit` | identik |
| T11 | `preview_withdraw` vs `withdraw` | identik |
| T12 | `deposit` dengan `operator != from` tanpa approve | gagal auth/allowance |
| T13 | `deposit` dengan `operator != from` + approve | berhasil |
| T14 | `withdraw` dengan `operator != owner` tanpa allowance share | gagal |
| T15 | `transfer` share antar user | saldo berpindah, `total_supply` tetap |
| T16 | `approve` + `transfer_from` | allowance berkurang |
| T17 | Event `deposit` | topik & data sesuai §7.8 |
| T18 | Event `withdraw` | idem |
| T19 | `convert_to_shares`/`convert_to_assets` round-trip | selisih ≤ 1 unit |
| T20 | Panggilan `set_asset` kedua kali | panic 401 |

> Test T04 wajib ada: ini bukti bahwa `decimals_offset` bekerja, dan bisa ditunjukkan ke juri.

### 7.13 Deploy runbook

```bash
# 1. Identitas deploy (sekali)
stellar keys generate deployer --network testnet --fund
stellar keys address deployer

# 2. Build
cd contracts/lumbung-vault && stellar contract build

# 3. Deploy + constructor
export VAULT_WASM=target/wasm32v1-none/release/lumbung_vault.wasm
export XLM_SAC=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

stellar contract deploy \
  --wasm "$VAULT_WASM" \
  --source deployer \
  --network testnet \
  -- \
  --name "Lumbung Vault Share" \
  --symbol "LMB" \
  --asset "$XLM_SAC" \
  --decimals_offset 3
# → cetak C... (56 karakter) → simpan sebagai VAULT_ID
```

**Catatan:** `--decimals_offset 3` bertipe `u32`; pastikan tidak dikirim sebagai string.

### 7.14 Verifikasi pasca-deploy

```bash
export VAULT_ID=C...

stellar contract invoke --id $VAULT_ID --network testnet -- query_asset
stellar contract invoke --id $VAULT_ID --network testnet -- total_assets
stellar contract invoke --id $VAULT_ID --network testnet -- total_supply
stellar contract invoke --id $VAULT_ID --network testnet -- decimals        # harus 10
stellar contract invoke --id $VAULT_ID --network testnet -- name
stellar contract invoke --id $VAULT_ID --network testnet -- symbol

# Deposit nyata (membuktikan alur tulis + event)
stellar contract invoke --id $VAULT_ID --network testnet --source deployer -- \
  deposit --assets 100000000 --receiver $(stellar keys address deployer) \
          --from $(stellar keys address deployer) \
          --operator $(stellar keys address deployer)

# Cek event muncul (perintah top-level `stellar events`, bukan `contract events`)
stellar events --id $VAULT_ID --network testnet --start-ledger <L>
```

**Gerbang D1 — deploy dianggap selesai bila:**
1. Address `C...` 56 karakter tercatat.
2. `decimals()` = 10, `query_asset()` = XLM SAC.
3. Satu `deposit` sukses, terlihat di explorer, event `deposit` muncul.
4. Satu `withdraw` sukses, saldo share kembali 0.
5. `total_assets()` > 0 (vault tidak kosong → R10).

---

## 8. Web

### 8.1 Stack & konsekuensi

| Aspek | Nilai | Konsekuensi |
|---|---|---|
| Build | CRA 5 + CRACO 7 | Build ~60 dtk; perlu polyfill Node di webpack |
| React | 19.0.0 | sudah terbukti build |
| Router | `react-router-dom` 7 | `/`, `/app`, `/docs`, `/status`, `/changelog` |
| Styling | Tailwind 3.4.17 | token warna di `design_guidelines.json` |
| Motion | framer-motion 11 + Lenis | hormati `prefers-reduced-motion` |
| Icons | lucide-react | |
| Chain | `@stellar/stellar-sdk` 17.2.1 | `SorobanRpc.Server`, `Contract`, `TransactionBuilder` |
| Wallet | `@creit.tech/stellar-wallets-kit` 2.7.1 | Freighter (+ xBull/Albedo opsional) |

**Polyfill yang wajib ditambahkan di `craco.config.js`:**

```js
webpack: {
  configure: (cfg) => {
    cfg.resolve.fallback = {
      ...cfg.resolve.fallback,
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
      stream: false,
      crypto: false,
    };
    return cfg;
  },
},
```

Tambahkan dependency `buffer` dan `process` (eksak). Tanpa ini, `stellar-sdk` gagal di browser (`Buffer is not defined`).

> ⚠️ **VERIFY saat implementasi:** jalankan `npm start`, buka `/app`, pastikan tidak ada error `Module not found` untuk `crypto`/`stream`/`buffer`. Kalau muncul, tambahkan `crypto-browserify` atau matikan modul yang tidak dipakai.

### 8.2 Struktur modul

| File | Tanggung jawab | Aturan |
|---|---|---|
| `lib/config.js` | env, `CONTRACT_ID`, `RPC_URL`, validasi `C...`/`G...` | tidak boleh ada logika UI |
| `lib/rpc.js` | instance `SorobanRpc.Server`, retry/backoff, `getHealth` | satu-satunya tempat membuat koneksi |
| `lib/vault-read.js` | simulasi fungsi baca, kembalikan `BigInt` | tidak menyentuh state React |
| `lib/vault-write.js` | build → simulate → assemble → sign → send → poll | tidak menyimpan key |
| `lib/wallet.js` | adapter wallets-kit: `connect`, `disconnect`, `sign`, `getNetwork` | satu-satunya tempat import wallets-kit |
| `lib/format.js` | format asset/share/price dengan desimal dinamis | tanpa `Number` untuk uang |
| `lib/tx-state.js` | enum state + peta error → pesan manusiawi | dipakai UI & test |
| `lib/vault-read.js` | **tidak boleh** fallback ke mock | lihat §8.9 |

### 8.3 Konfigurasi & env

| Variabel | Wajib | Contoh | Dipakai |
|---|---|---|---|
| `REACT_APP_VAULT_CONTRACT_ID` | ✅ | `C...` | baca/tulis |
| `REACT_APP_SOROBAN_RPC_URL` | ✅ | `https://soroban-testnet.stellar.org` | semua RPC |
| `REACT_APP_READONLY_SOURCE` | ✅ | `G...` (akun testnet funded) | simulasi saat wallet belum terhubung |
| `REACT_APP_NETWORK_PASSPHRASE` | ✅ | `Test SDF Network ; September 2015` | signing |
| `REACT_APP_GITHUB_URL` | ⬜ | `https://github.com/...` | footer |
| `REACT_APP_X_URL` | ⬜ | `https://x.com/...` | footer |
| `REACT_APP_CONTACT_EMAIL` | ⬜ | `hello@...` | footer |

**Aturan:** CRA meng-*inline* env saat build. Ganti contract ID = **build ulang**, bukan sekadar restart. Dokumentasikan ini di README.

`READONLY_SOURCE` dibuat sekali:

```bash
stellar keys generate readonly --network testnet --fund
stellar keys address readonly     # → G...
# Simpan hanya public key. Secret tidak dipakai aplikasi.
```

### 8.4 Lapisan RPC

```js
// lib/rpc.js (bentuk yang dituju)
import { SorobanRpc, Networks } from "@stellar/stellar-sdk";
import { RPC_URL } from "./config";

export const server = new SorobanRpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });

export const getHealth = () => server.getHealth();

export async function simulateCall(contractId, method, args = [], source) {
  // 1. ambil account source
  // 2. TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
  // 3. .addOperation(contract.call(method, ...args))
  // 4. .setTimeout(30).build()
  // 5. server.simulateTransaction(tx)
  // 6. jika Api.isSimulationError → lempar SimError(retval)
  // 7. scValToNative(result.retval)
}
```

**Aturan implementasi:**

| Aturan | Alasan |
|---|---|
| Setiap `simulate` memakai operasi tunggal | Soroban hanya mengembalikan satu `retval` |
| Baca state secara paralel (`Promise.all`) | 4 panggilan × ~300 ms → total ~400 ms, bukan 1.2 s |
| Cache hasil baca di memori 15 detik | mengurangi beban RPC tanpa menyembunyikan kesegaran |
| Retry 3× dengan backoff 500/1000/2000 ms pada error jaringan | R6 (RPC tidak stabil) |
| Timeout 10 s per panggilan | menghindari UI menggantung |
| Tidak pernah `catch` lalu mengembalikan angka palsu | P2 |

### 8.5 Lapisan wallet

Kontrak adapter (agar perubahan API wallets-kit hanya menyentuh satu file):

```js
// lib/wallet.js
export const wallet = {
  isAvailable(): boolean,
  connect(): Promise<{ address: string, network: string }>,
  disconnect(): void,
  getAddress(): string | null,
  signXdr(xdr: string, opts: { address: string }): Promise<string>,
};
```

**Alur connect:**

1. `StellarWalletsKit.init({ modules: [FreighterModule, xBullModule, AlbedoModule], network: Networks.TESTNET })`
2. `openModal()` → `{ address }`
3. Ambil network aktif; kalau ≠ TESTNET → state `WRONG_NETWORK` dengan tombol "Switch network", jangan lanjut.
4. Simpan address di state (bukan localStorage) → hilang saat refresh (disengaja: mengurangi state basi).

**Penanganan error:**

| Kondisi | State | Pesan |
|---|---|---|
| Ekstensi tidak ada | `NO_WALLET` | "Install Freighter to continue" + link |
| User menutup modal | `CANCELLED` | diam (kembali idle) |
| Network salah | `WRONG_NETWORK` | "Switch Freighter to Testnet" |
| Sign ditolak | `USER_REJECTED` | "Signature cancelled" |
| Sign timeout > 120 s | `SIGN_TIMEOUT` | "Wallet did not respond" |

### 8.6 Pipeline transaksi

**State machine:**

```
IDLE
 └─ submit() ──► VALIDATING
                   ├─ gagal ──► INVALID (kembali IDLE setelah pesan)
                   └─ ok ────► SIMULATING
                                 ├─ error ─► SIM_FAILED
                                 └─ ok ────► AWAITING_SIGNATURE
                                               ├─ tolak ─► USER_REJECTED
                                               └─ ok ────► SUBMITTING
                                                             ├─ error ─► SUBMIT_FAILED
                                                             └─ hash ──► PENDING
                                                                           ├─ SUCCESS
                                                                           ├─ FAILED
                                                                           └─ TIMEOUT (>30 s)
```

**Langkah teknis deposit:**

```js
// 1. validasi
if (!isValidAddress(address)) throw TxError.INVALID_ADDRESS;
if (amount <= 0n) throw TxError.INVALID_AMOUNT;

// 2. simulasi (juga menghasilkan footprint)
const tx = buildDepositTx({ assets: amount, receiver: addr, from: addr, operator: addr, source: addr });

// 3. assemble (footprint + resource fee)
const prepared = await server.prepareTransaction(tx);

// 4. sign di wallet
const signedXdr = await wallet.signXdr(prepared.toXDR(), { address: addr });

// 5. kirim
const res = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, PASSPHRASE));

// 6. poll
const final = await pollTransaction(res.hash, { timeoutMs: 30_000, intervalMs: 1_000 });
```

**Peta error → UI:**

| Sumber | Kode | Pesan |
|---|---|---|
| Validasi | `INVALID_AMOUNT` | "Enter an amount greater than 0" |
| Validasi | `INSUFFICIENT_BALANCE` | "Amount exceeds your XLM balance" |
| Simulasi | `SIM_FAILED` | "The vault rejected this transaction" + `error` dari RPC |
| Simulasi | contract `403`/`404` | "Amount must be greater than zero" |
| Simulasi | contract `407` | "Amount exceeds your withdrawable balance" |
| Simulasi | contract `410` | "Amount too large" |
| Wallet | `USER_REJECTED` | "Signature cancelled" |
| Kirim | `SUBMIT_FAILED` | "Network rejected the transaction" |
| Poll | `TIMEOUT` | "Still pending — check the explorer" + link |
| Poll | `FAILED` | "Transaction failed on-chain" + link |

**Aturan:** setiap state `PENDING`/`FAILED`/`TIMEOUT` menampilkan tx hash + link explorer. Tanpa itu, user tidak bisa memverifikasi sendiri.

### 8.7 Format uang

```js
export const formatUnits = (raw, decimals, places = 2) => { /* BigInt */ };
export const formatAssets = (raw) => formatUnits(raw, 7, 2);      // XLM
export const formatShares = (raw, shareDecimals) =>
  formatUnits(raw, shareDecimals, 4);
export const sharePrice = (rawAssets, rawShares, assetDec, shareDec) => {
  if (rawShares === 0n) return "1.00";
  const scale = 10n ** BigInt(shareDec - assetDec);
  return formatUnits((rawAssets * scale * 10n ** BigInt(assetDec)) / rawShares, assetDec, 4);
};
```

**Test wajib untuk formatter:**

| Input | Ekspektasi |
|---|---|
| `formatAssets(1254305500000n)` | `125,430.55` |
| `formatShares(1000000000000n, 10)` | `100.0000` |
| `sharePrice(1254305500000n, 1200000000000000n, 7, 10)` | ≈ `1.0452` |
| `sharePrice(0n, 0n, 7, 10)` | `1.00` |
| Angka > 10^15 | tidak kehilangan digit (tanpa `Number`) |

**Larangan:** `parseFloat`, `Number(raw)`, `toFixed()` pada nilai mentah, `Intl.NumberFormat` pada `BigInt` tanpa pembagian manual.

### 8.8 Matriks state UI

| Kondisi | Stats panel | Panel aksi | Tombol utama |
|---|---|---|---|
| Contract ID kosong/invalid | `—` + "Not deployed" (abu) | disabled | "Not available" |
| Loading | `…` (skeleton) | disabled | spinner |
| RPC error | `—` + "Unavailable" + Retry | disabled | "Retry" |
| Wallet belum connect | data publik tampil | disabled | "Connect wallet" |
| Wallet connect, network salah | data tampil | disabled | "Switch to Testnet" |
| Siap | data tampil | aktif | "Deposit" / "Withdraw" |
| Amount > saldo | — | aktif, pesan inline | disabled |
| Tx pending | data beku (tidak auto-refresh) | disabled | "Confirming…" |
| Tx sukses | refresh | aktif | "Done" + hash |
| Tx gagal | refresh | aktif | "Try again" |

**Aturan:** saat tx pending, hentikan auto-refresh statistik (mencegah angka berubah di tengah konfirmasi).

### 8.9 Perbaikan landing (wajib, 6 item)

| # | Masalah | Perbaikan | Kriteria terima |
|---|---|---|---|
| L1 | Mock ditampilkan sebagai "live vault state" | Hapus fallback `mock-chain` di `vault-read.js`. Bila contract kosong → `null`. Setelah integrasi nyata, hapus `src/lib/mock-chain.js` dan `src/components/app/DemoPanel.jsx` | Tidak ada angka karangan di build production |
| L2 | Build gagal di clone bersih | Commit `package-lock.json`; tambah `ajv@8.20.0` eksak | `rm -rf node_modules && npm ci && npm run build` sukses |
| L3 | `/app` 404 di hosting statis | Tambah `vercel.json` rewrite ke `/index.html` | `/app`, `/docs`, `/status`, `/changelog` HTTP 200 |
| L4 | Angka terpotong (`125,430.5…`) | `tabular-nums`, kolom penuh, atau 2 baris; hapus `truncate` pada nilai | Tidak ada ellipsis pada angka |
| L5 | Placeholder `[CONTRACT_ID]`, `[contact-email]` | Render "—" / sembunyikan baris | Tidak ada string `[` `]` di UI |
| L6 | Sisa tool AI builder | Hapus `.env` preview, `@emergentbase/*`, `plugins/health-check`; sederhanakan `craco.config.js`; tulis README | `npm ci` tidak menghubungi domain pihak ketiga |

**Indikator status jujur:**

| Kondisi | Titik | Label |
|---|---|---|
| Belum deploy | abu | "Not deployed" |
| Loading | amber berdenyut | "Reading…" |
| OK | hijau | "Live · <jam:menit>" |
| Error | merah | "RPC unavailable" |

### 8.10 Aturan kejujuran (mengikat)

1. Tidak ada angka on-chain yang berasal dari `localStorage`, mock, atau hardcode.
2. Setiap angka punya sumber yang bisa disebut: `total_assets()`, `total_supply()`, `decimals()`, `balance()`.
3. Bila data tidak tersedia → tampilkan `—`, bukan `0`.
4. Tidak ada klaim "audited", "yield", "APY", "secure", "guaranteed".
5. Testnet disclosure muncul di nav, hero, dan footer.
6. Tanggal di roadmap hanya yang benar-benar direncanakan; lebih baik "Next" tanpa tanggal.

### 8.11 Build & deploy

`web/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

Langkah deploy:

```bash
cd web
npm ci
npm run build                       # CI=false agar warning tidak gagal
vercel --prod                       # atau push ke GitHub → auto deploy
```

Env di dashboard Vercel (Production + Preview), lalu **redeploy** (env di-inline saat build).

### 8.12 Anggaran performa & a11y

| Metrik | Target | Cara ukur |
|---|---|---|
| LCP (4G) | < 2.0 s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Bundle JS gzip | < 250 KB | output build |
| A11y | ≥ 95 | Lighthouse + keyboard pass |
| Kontras | ≥ 4.5:1 | design token |
| Responsif | 360–1920 px | uji manual |

---

## 9. Submission (artefak Aegis)

### 9.1 Artefak wajib

| # | Artefak | Format | Nama file | Isi wajib |
|---|---|---|---|---|
| 1 | Screen record | MP4, 1–3 mnt, 1080p | `submission/video.md` (link) | Checker berjalan, hasil muncul, address terlihat |
| 2 | Screenshot proses | PNG | `screenshots/01-process.png` | Checker sedang berjalan |
| 3 | Screenshot hasil | PNG | `screenshots/02-result.png` | Jumlah success & error terlihat |
| 4 | Hasil JSON | `.json` | `checker.json` | **Address vault terlihat** |
| 5 | Hasil MD | `.md` | `checker.md` | **Address vault terlihat** |
| 6 | Brief intro vault | `.md` | `brief-lumbung.md` | Fungsi & fitur, bahasa non-teknis |
| 7 | Post X | URL | dikirim ke grup | Akun resmi, memuat rekaman + address |

### 9.2 Urutan produksi artefak

```
1. Pastikan vault TIDAK kosong (deposit dummy sudah dilakukan)  ← R10
2. Pastikan checker bisa mengakses vault tanpa whitelist
3. Nyalakan screen recorder (1 layar penuh, address terlihat)
4. Jalankan checker
5. Screenshot saat proses berjalan
6. Screenshot hasil akhir (success/error count)
7. Download JSON + MD
8. Buka JSON & MD, pastikan address ada di dalamnya
9. Tulis brief
10. Post di X (akun resmi), sertakan rekaman + link app
11. Salin URL post → kirim ke grup
```

### 9.3 Brief intro vault (kerangka)

```
# Lumbung Vault

## Apa ini
Vault tokenized di Stellar Testnet yang memungkinkan siapa pun menyetor XLM
dan menerima share (LMB) yang mewakili porsi kepemilikan pool.

## Cara kerja
1. Setor XLM → dapat share sesuai harga saat itu
2. Share dapat ditransfer seperti token biasa
3. Tarik kapan saja — tidak ada lockup

## Fungsi utama
- deposit / mint   : setor aset, dapat share
- withdraw / redeem: tarik aset, bakar share
- transfer         : kirim share ke alamat lain
- preview_*        : lihat hasil sebelum menandatangani
- total_assets / total_supply / query_asset: transparansi state

## Yang TIDAK ada
- Admin / pemilik kontrak
- Biaya deposit atau withdraw
- Whitelist / KYC
- Strategi yield atau janji imbal hasil
- Lockup

## Status
Testnet. Aset tidak bernilai. Kontrak: C...
```

### 9.4 Post X

**Syarat:** akun resmi project, memuat rekaman, menyebut Aegis Vault, memuat link app/kontrak.

**Kerangka:**

```
Lumbung is live on Stellar Testnet.

A SEP-56 tokenized vault: deposit XLM, hold a share of the pool,
withdraw anytime. No admin keys, no fees, no lockup.

Checked with @AegisVault's vault checker — [N]/11 checks returning results.

App: <url>/app
Contract: C...

#Stellar #Soroban #SEP56
```

**Aturan:** jangan menulis "passed all checks" bila ada error. Tulis apa adanya.

### 9.5 Checklist pra-kirim

- [ ] Contract address identik di: kontrak, web, brief, JSON, MD, post X
- [ ] `/app` dapat diakses publik (bukan localhost), HTTP 200
- [ ] Wallet connect berfungsi dari akun baru (tanpa whitelist)
- [ ] Deposit & withdraw terbukti dari akun kedua
- [ ] Vault tidak kosong saat checker dijalankan
- [ ] Screen record menampilkan address
- [ ] JSON & MD menampilkan address
- [ ] Post X dari akun resmi, publik (tidak dikunci)
- [ ] Semua file ada di `submission/`
- [ ] Link dikirim ke grup sebelum **24 Okt 20.00 WIB**

---

## 10. Observabilitas & penanganan error

| Lapisan | Mekanisme |
|---|---|
| RPC | retry 3× + backoff; log method, durasi, kode error (tanpa data pribadi) |
| Simulasi | sertakan `error` mentah di console, tampilkan versi manusiawi di UI |
| Wallet | state eksplisit; tidak ada `alert()` |
| UI | error boundary per halaman (`/app` tidak boleh memutihkan seluruh app) |
| Tx | hash disimpan di state + link explorer selalu tersedia |
| Build | `CI=false` disengaja; warning tidak memblokir deploy |

**Yang tidak dibangun:** Sentry, analytics, log server. Tidak ada server.

---

## 11. Rencana QA

### 11.1 Matriks uji manual (wajib sebelum freeze)

| # | Skenario | Ekspektasi |
|---|---|---|
| Q01 | Buka `/` tanpa wallet | Stats tampil atau `—`; tidak ada error console |
| Q02 | Buka `/app` tanpa wallet | Tombol Connect; data publik tampil |
| Q03 | Connect Freighter testnet | Address tampil, network hijau |
| Q04 | Connect di network PUBLIC | Ditolak dengan pesan jelas |
| Q05 | Deposit 1 XLM | Preview muncul; setelah sign, hash + sukses |
| Q06 | Deposit dari akun kedua | Share bertambah; `total_assets` naik |
| Q07 | Withdraw 0.5 XLM | Share berkurang sesuai preview |
| Q08 | Withdraw melebihi saldo | Ditolak sebelum sign |
| Q09 | Input `0` / kosong / huruf | Validasi inline, tombol disabled |
| Q10 | Tolak signature | State `USER_REJECTED`, tidak ada tx terkirim |
| Q11 | Refresh saat pending | Data konsisten dengan chain |
| Q12 | Putus internet saat simulate | Pesan RPC, tombol retry |
| Q13 | Mobile 360 px | Tidak ada overflow horizontal |
| Q14 | Keyboard-only | Semua kontrol dapat difokuskan |
| Q15 | `prefers-reduced-motion` | Animasi berhenti |
| Q16 | Copy contract ID | Clipboard berisi 56 karakter |
| Q17 | Link explorer | Membuka kontrak yang benar |
| Q18 | Hard refresh di `/app` | Tidak 404 (rewrite bekerja) |

### 11.2 Uji kontrak

Lihat §7.12 (T01–T20). Semua harus hijau sebelum deploy.

---

## 12. Keamanan

| # | Kontrol | Bukti |
|---|---|---|
| S1 | Tidak ada admin/upgrade/pause | `grep` fungsi publik + review kode |
| S2 | Auth pada `operator` untuk semua mutasi | test T12–T14 |
| S3 | Tidak memanggil `*_internal` dari wrapper | review kode |
| S4 | Overflow-checks aktif | `Cargo.toml` |
| S5 | Donation attack dimitigasi | `decimals_offset = 3` + test T04 |
| S6 | Tidak ada secret di repo | `git grep -i secret`; `.env` di `.gitignore` |
| S7 | Signing hanya di wallet | review `lib/*` — tidak ada `Keypair.fromSecret` |
| S8 | Semua tx disimulasikan dulu | `prepareTransaction` wajib |
| S9 | Validasi address `G...`/`C...` 56 char | unit test `config.js` |
| S10 | Dependency terkunci | `Cargo.lock` + `package-lock.json` |

---

## 13. Runbook operasional

### 13.1 Toolchain (bila belum terpasang)

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup target add wasm32v1-none
rustup component add rustfmt clippy rust-src

# Stellar CLI (pilih salah satu)
cargo install --locked stellar-cli --version 28.1.0   # bisa 10-20 mnt
# atau unduh binary rilis resmi sesuai arsitektur
```

**Timebox:** 45 menit. Bila `cargo install` lambat, **segera** pindah ke binary.

### 13.2 RPC bermasalah

1. Cek `getHealth` → `status: healthy`.
2. Ganti `REACT_APP_SOROBAN_RPC_URL` ke endpoint alternatif.
3. Rebuild + redeploy web.
4. Jangan mengubah kontrak.

### 13.3 Kehabisan XLM testnet

```bash
curl "https://friendbot.stellar.org/?addr=$(stellar keys address deployer)"
```

### 13.4 Kontrak salah deploy (sebelum diumumkan)

Deploy ulang dengan constructor yang benar. Karena tidak ada upgrade, **tidak ada cara memperbaiki** kontrak yang sudah salah. Sebelum mengumumkan address di X, verifikasi §7.14 poin 1–4.

---

## 14. Timeline & gate

Hari ini **Rabu 21 Okt, 14.30 WIB**. Sisa ke deadline internal: **±78 jam**.

| Blok | Waktu | Pekerjaan | Gate |
|---|---|---|---|
| D1-a | 21 Okt 14.30–15.15 | Pasang Rust + target + Stellar CLI | `stellar --version` OK |
| D1-b | 15.15–17.30 | Scaffold kontrak, `lib.rs`, build wasm | `.wasm` ada, < 100 KB |
| D1-c | 17.30–19.30 | Unit test T01–T20 | `cargo test` hijau |
| D1-d | 19.30–21.00 | Deploy + verifikasi §7.14 | **GATE D1**: address + deposit/withdraw |
| D2-a | 22 Okt 09.00–12.00 | Merge repo, `rpc.js` + `vault-read.js`, stats nyata | `/` menampilkan angka on-chain |
| D2-b | 13.00–17.00 | Wallet + deposit/withdraw UI | **GATE D2**: tx sukses dari UI |
| D2-c | 17.00–19.00 | QA Q01–Q18 tahap 1, perbaikan desimal | tidak ada bug blocker |
| D3-a | 23 Okt 09.00–11.00 | Jalankan checker, rekam, screenshot, unduh JSON/MD | artefak 1–5 |
| D3-b | 11.00–13.00 | Perbaikan landing L1–L6 + deploy | **GATE D3**: `/app` publik 200 |
| D3-c | 13.00–16.00 | Brief, akun X, post | artefak 6–7 |
| D3-d | 16.00–18.00 | Bundel `submission/`, checklist | semua centang |
| D4-a | 24 Okt 09.00–12.00 | QA final, freeze kode | **GATE D4**: tidak ada perubahan |
| D4-b | 12.00–20.00 | Kirim + buffer | terkirim < 20.00 |

**Aturan gate:** kalau sebuah gate lewat > 2 jam dari jadwal, **potong** pekerjaan berikutnya (urutan pemotongan: `/docs`, `/status`, `/changelog` → brief tambahan → polish landing). Kontrak, `/app`, dan artefak **tidak boleh** dipotong.

---

## 15. Risiko (diperbarui)

| # | Risiko | Prob. | Dampak | Mitigasi | Pemicu |
|---|---|---|---|---|---|
| R1 | Scope creep full stack | Tinggi | Tinggi | Gate harian; P1 dilarang | Mulai kerjakan hal di luar §3.1 |
| R2 | Toolchain > 3 jam | Sedang | Tinggi | Timebox 45 mnt + binary | `cargo install` > 20 mnt |
| R3 | API SEP-56 berubah | Rendah | Sedang | Versi dikunci | — |
| R4 | Checker tidak bisa akses vault | Rendah | **Kritis** | Tanpa whitelist; uji akun kedua | Checker error auth |
| R5 | Bug desimal 7 vs 10 | **Tinggi** | Tinggi | §8.7 + test formatter | Angka share terlihat 1000× |
| R6 | RPC/faucet tidak stabil | Sedang | Sedang | Retry + endpoint alternatif | `getHealth` gagal |
| R7 | Bug integrasi urutan argumen `deposit` | Sedang | Tinggi | §7.4 + test T02 | Simulasi gagal |
| R8 | Build CRA gagal (ajv/polyfill) | Sedang | Tinggi | L2 (§8.9) + lockfile | `npm ci` error |
| R9 | Artefak tidak lengkap di menit akhir | Sedang | Tinggi | Bundel D3, bukan D4 | — |
| R10 | Vault kosong saat checker | Sedang | Sedang | Deposit dummy D3 | `total_assets == 0` |
| R11 | Post X dari akun yang tidak terlihat resmi | Sedang | Sedang | Buat akun D0, posting 1–2 update lebih dulu | Akun baru tanpa histori |
| R12 | `/app` 404 di link post | **Tinggi** bila L3 tidak dikerjakan | Tinggi | `vercel.json` + uji hard refresh | Buka `/app` di production |

---

## 16. Definition of Done

### 16.1 Kontrak
- [ ] `cargo test` hijau (T01–T20)
- [ ] wasm < 100 KB
- [ ] Deploy testnet, address 56 karakter
- [ ] `decimals() == 10`, `query_asset() == XLM SAC`
- [ ] Deposit + withdraw sukses, terlihat di explorer
- [ ] `total_assets() > 0`
- [ ] Tidak ada fungsi admin (review)

### 16.2 Web
- [ ] `/` menampilkan data on-chain nyata atau `—` (tidak pernah mock)
- [ ] `/app` connect, deposit, withdraw berfungsi
- [ ] Semua error state punya pesan + aksi
- [ ] Formatter lulus test §8.7
- [ ] L1–L6 selesai
- [ ] `/app` HTTP 200 di production (hard refresh)
- [ ] Lighthouse: LCP < 2.0 s, a11y ≥ 95

### 16.3 Submission
- [ ] 7 artefak lengkap
- [ ] Address identik di semua tempat
- [ ] Post X publik dari akun resmi
- [ ] Link dikirim ke grup < 24 Okt 20.00 WIB

---

## 17. Amendemen PRD/TASKS (sudah diterapkan)

Diterapkan 21 Okt 2026 → `PRD.md` v0.3, `TASKS.md` v0.3, `LANDING.md` v0.3.

| # | Dokumen | Lokasi | Perubahan | Status |
|---|---|---|---|---|
| A1 | PRD | §8 tabel | Web: **React 19 SPA (CRA/CRACO)**, bukan Next.js. Utang teknis dicatat | ✅ |
| A2 | PRD | §8.1 D2 | `Compose<(Vault, TotalSupply)>` → `impl FungibleToken (ContractType = Vault)` + `impl FungibleVault` | ✅ |
| A3 | PRD | §8.1 D6 | Tanpa backend **service**; baca langsung dari RPC | ✅ |
| A4 | PRD | §11 timeline | Di-rebaseline sesuai §14 dokumen ini | ✅ |
| A5 | PRD | §5.1 **FR-03** | Acceptance donation-attack (test T04) ditambahkan ke alur deposit — bukan FR-02, karena sifatnya ada saat deposit | ✅ |
| A6 | PRD | Q1–Q7 | Semua ditutup dengan keputusan | ✅ |
| A7 | TASKS | D0/D1 | Scaffold sesuai §7, merge landing, deploy dengan constructor args | ✅ |
| A8 | TASKS | D2/D3 | React SPA, desimal dinamis, task landing jadi audit + L1–L6 | ✅ |
| A9 | LANDING | §10.1 | Status implementasi + L1–L6 sebagai pekerjaan 23 Okt | ✅ |

---

## 18. Pertanyaan terbuka

| # | Pertanyaan | Pemilik | Deadline | Default bila tidak dijawab |
|---|---|---|---|---|
| Q1 | Nama produk final: "Lumbung" atau lain? | Shalahuddin | 22 Okt | Lumbung |
| Q2 | Akun X resmi: handle apa? | Shalahuddin | 21 Okt | Buat `@lumbungvault` |
| Q3 | Domain kustom atau `*.vercel.app`? | Shalahuddin | 23 Okt | `lumbung-vault.vercel.app` |
| Q4 | `decimals_offset` final 3? | Shalahuddin | 21 Okt (sebelum deploy) | 3 |
| Q5 | Simbol share: `LMB`? | Shalahuddin | 21 Okt | `LMB` |
| Q6 | Repo publik atau privat saat submission? | Shalahuddin | 24 Okt | Publik |

---

## 19. Lampiran: fakta terverifikasi

| Fakta | Sumber |
|---|---|
| `deposit(e, assets, receiver, from, operator)` dan urutannya | SEP-56 §Interface, baris 150 |
| Topic event `deposit`: operator, from, receiver | SEP-56 §Events, baris 272–287 |
| `query_asset()` panic bila asset belum di-set | SEP-56 §ERC-4626 Deviation |
| `MAX_DECIMALS_OFFSET = 10` | `stellar-tokens 0.7.2`, `vault/mod.rs` |
| `operator.require_auth()` ada di high-level `deposit`/`withdraw` | `vault/storage.rs` baris 339, 432 |
| `transfer_from` dipakai bila `operator != from` | `vault/storage.rs` baris 744 |
| `spend_allowance` pada share bila `operator != owner` | `vault/storage.rs` baris 787 |
| `*_internal` melewati auth | doc-comment `deposit_internal` |
| Urutan init: asset → offset → metadata | `examples/fungible-vault/src/contract.rs` v0.7.2 |
| `Compose` tidak dipakai; memakai `contracttrait` | contoh resmi v0.7.2 |
| `soroban-sdk = 26.1.1` untuk `stellar-tokens 0.7.2` | workspace `Cargo.toml` OZ + verifikasi build 21 Okt |
| `overflow-checks = true` di profil rilis OZ | workspace `Cargo.toml` OZ |
| Retensi event RPC ±7 hari | dokumentasi Stellar RPC |
| XLM SAC testnet | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

---

*Dokumen ini adalah sumber kebenaran teknis. Bila implementasi menyimpang, perbarui dokumen ini bersamaan dengan kode — bukan setelahnya.*
