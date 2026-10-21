# Lumbung Vault

Vault tokenized **SEP-56** di Stellar Testnet. Menyimpan XLM, menerbitkan share
(`LMB`) yang nilainya mengikuti total aset di vault.

> **Testnet only.** Tidak ada dana nyata. Kontrak tidak memiliki admin, upgrade,
> atau pause, tidak ada pihak yang bisa membekukan atau mengganti aset.

## Kontrak

| Item | Nilai |
|---|---|
| Network | Stellar Testnet (Protocol 29) |
| Contract ID | `CDHICU2WIUHKLYPQCXD7ZD2VABMEGBR2G3TYEVC4Q5PMTCR6JHST55GI` |
| Explorer | https://stellar.expert/explorer/testnet/contract/CDHICU2WIUHKLYPQCXD7ZD2VABMEGBR2G3TYEVC4Q5PMTCR6JHST55GI |
| Underlying | XLM via SAC `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Share decimals | **10** (asset 7 + offset 3) |
| Wasm SHA-256 | `fe91db2b93c9c83caf22bd5cfb05caed21f8287d68cf410f1fa9dc6ca0434501` |

Detail deployment (tx hash, state awal, akun demo) ada di
[`deployments/testnet.json`](./deployments/testnet.json).

## Kenapa `decimals_offset = 3`

Share memakai 10 desimal, bukan 7. Offset ini melindungi depositor pertama dari
serangan donation/inflation: penyerang harus menyumbang sekitar 1000× deposit
korban agar share korban membulat ke nol, dan pada titik itu serangan selalu
merugikan penyerang. Dibuktikan oleh test `t04_donation_attack_unprofitable`.

## Struktur

```
contracts/lumbung-vault/   Kontrak Rust (OpenZeppelin stellar-tokens 0.7.2)
deployments/testnet.json   Alamat, hash, dan tx hash deployment
PRD.md / TRD.md            Dokumen produk dan teknis
web/                       Web app React 19 (landing + dashboard vault)
```

> Laporan audit Aegis Vault (JSON + Markdown) tersedia di
> [`web/public/aegis-report.md`](./web/public/aegis-report.md) dan
> `web/public/aegis-report.json`.

## Build & test

Prasyarat: Rust ≥ 1.84, target `wasm32v1-none`, Stellar CLI 28.x.

```bash
cd contracts/lumbung-vault
cargo test                      # 20 test
stellar contract build          # → target/wasm32v1-none/release/lumbung_vault.wasm
```

Deploy ulang ke testnet:

```bash
export XLM_SAC=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
stellar contract deploy \
  --wasm target/wasm32v1-none/release/lumbung_vault.wasm \
  --source-account deployer --network testnet --optimize=false \
  -- --name "Lumbung Vault Share" --symbol "LMB" \
     --asset "$XLM_SAC" --decimals_offset 3
```

## Web app

`web/` berisi landing page dan dashboard vault (React 19 + CRACO). Tidak ada
backend: state dibaca langsung dari Soroban RPC, transaksi ditandatangani
Freighter dan dikirim ke Testnet.

```bash
cd web
npm install
npm start          # http://localhost:3000
CI=false npm run build
```

Halaman: `/` (landing + statistik live), `/app` (deposit/withdraw/redeem),
`/docs`, `/status`, `/changelog`. Detail arsitektur dan env ada di
[`web/README.md`](./web/README.md).

Alur demo: pasang Freighter → pilih Testnet → buka `/app` → hubungkan dompet →
deposit XLM → withdraw atau redeem. Saldo share dan total aset diperbarui
langsung dari kontrak.

## Lisensi

MIT (kontrak memakai OpenZeppelin `stellar-tokens`, Apache-2.0).
