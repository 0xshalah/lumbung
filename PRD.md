# PRD — Lumbung Vault

> **Status:** Draft v0.3 (diamendemen oleh [`TRD.md`](./TRD.md) v1.0)
> **Pemilik:** Shalahuddin Al-Ayyubi
> **Terakhir diperbarui:** 21 Oktober 2026
> **Target rilis:** 24 Oktober 2026 (submission Aegis Vault Reward Challenge)
> **Dokumen terkait:** SOW Aegis Vault (Google Docs), [`TASKS.md`](./TASKS.md), [`LANDING.md`](./LANDING.md), [`TRD.md`](./TRD.md)
>
> **Catatan v0.3:** PRD diselaraskan dengan kondisi implementasi per 21 Okt 2026:
> landing page **sudah jadi** (repo terpisah, React SPA), API kontrak `stellar-tokens 0.7.2`
> **diverifikasi ulang** (D2 dikoreksi), timeline **di-rebaseline**, dan pertanyaan
> terbuka Q1–Q7 **ditutup**. Detail teknis ada di `TRD.md`; PRD tetap dokumen produk.
>
> **Catatan v0.2:** landing page ditambahkan sebagai **P0.5/P1** (bukan P0) melalui
> [`LANDING.md`](./LANDING.md), yang mengamendemen dokumen ini (LP-01..LP-14, LP-NFR-01..LP-NFR-05, G6).

> **Nama "Lumbung" adalah working title** dan bisa diganti tanpa memengaruhi isi PRD.
> Alasan pemilihan: lumbung = tempat menyimpan hasil bersama, tempat orang menitipkan
> gabah lalu menerima bagian sesuai kontribusi — persis mental model tokenized vault.

---

## 1. Ringkasan Eksekutif

**Masalah.**
Di Stellar, standar tokenized vault (**SEP-56**) baru berstatus *Draft* dan belum ada
UI publik yang memudahkan orang mencoba vault standar di testnet. Akibatnya developer
harus menilai vault hanya dari kode, dan pengguna tidak punya cara sederhana untuk
memahami "berapa nilai share saya sekarang".

**Solusi.**
Lumbung adalah aplikasi full stack (kontrak + web; indexer menyusul di P1) yang:
1. men-deploy vault **SEP-56** di Stellar Testnet,
2. memberi UI untuk **deposit / withdraw / redeem** dengan angka yang jujur
   (preview sebelum eksekusi, desimal 7 digit ditangani benar),
3. menampilkan **posisi pengguna, harga share, dan riwayat transaksi**.

**Kenapa sekarang.**
Aegis Vault Reward Challenge memberi tenggat keras 24 Oktober 2026 dan reward
Rp200.000 untuk submission yang lengkap. Challenge ini berfungsi sebagai
**deadline pemaksa** untuk mengubah konsep menjadi produk nyata, bukan sekadar
kontrak contoh.

**Metrik keberhasilan utama.**
Submission lengkap (4 artefak + 1 link X) sebelum **24 Okt 2026 20.00 WIB**, dengan
alur deposit → withdraw terbukti berjalan on-chain (tx hash dapat diverifikasi di explorer).

---

## 2. Latar Belakang & Konteks

### 2.1 Kenapa sekarang

| Faktor | Detail | Sumber |
|---|---|---|
| Tenggat eksternal | Submission 24 Okt 2026, 23.59 WIB (verbal: bisa 25 Okt) | SOW + chat Stella |
| Insentif | Rp200.000 per peserta qualified, **PASS maupun FAIL** | SOW §1, §2.C |
| Kebutuhan standar | SEP-56 masih Draft, implementasi acuan baru tersedia | SEP-56, OpenZeppelin |
| Kondisi peserta | Belum punya project vault; diberi izin membangun baru | Chat 20 Okt 13.37–13.45 |

### 2.2 Masalah yang diselesaikan

1. **Untuk pengguna testnet:** tidak ada cara mudah memahami dan mencoba vault
   standar tanpa membaca kode Rust.
2. **Untuk developer:** tidak ada contoh end-to-end (kontrak → UI → verifikasi)
   yang bisa dipakai sebagai referensi implementasi SEP-56.
3. **Untuk tim Aegis:** mereka butuh vault nyata milik peserta untuk diuji, dan
   feedback tentang pengalaman memakai checker mereka.

### 2.3 Asumsi (yang harus divalidasi, bukan dipercaya)

| # | Asumsi | Cara validasi | Tenggat |
|---|---|---|---|
| A1 | Checker Aegis memanggil fungsi standar (bukan whitelist/KYC) | Baca UI checker + coba dengan vault sendiri | 21 Okt |
| A2 | XLM (via SAC) bisa jadi underlying asset tanpa trustline | Uji deposit 1 XLM di testnet | 21 Okt |
| A3 | Pengguna testnet mau mencoba bila cukup "1 klik faucet + 1 signature" | 3 usability test singkat | 23 Okt |
| A4 | Library OpenZeppelin v0.7.x cukup stabil untuk dipakai apa adanya | Compile + jalankan test bawaan | 21 Okt |

> Catatan metodologis: PRD ini tidak memakai angka pasar yang tidak terverifikasi.
> Semua klaim kuantitatif harus punya sumber atau dicatat sebagai asumsi (lihat §10).

### 2.4 Posisi terhadap solusi lain

| Alternatif | Kenapa kurang |
|---|---|
| Deploy kontrak saja, tanpa UI | Lolos syarat minimum, tapi cerita project lemah; post X minim bukti |
| Pakai vault demo milik Aegis | Tidak memenuhi syarat "vault milik peserta" |
| Fork vault EVM/ERC-4626 | Tidak kompatibel dengan Soroban; biaya adaptasi lebih besar daripada pakai OZ |
| Bangun vault dari nol | Rawan bug pembulatan & otorisasi; tidak cukup waktu 4 hari |

---

## 3. Tujuan & Non-Tujuan

### 3.1 Tujuan (Goals)

- **G1** — Vault SEP-56 berjalan di Stellar Testnet dengan contract address `C...` (56 karakter).
- **G2** — Pengguna dapat **deposit** dan **withdraw/redeem** lewat UI, dengan feedback status transaksi yang jelas.
- **G3** — Semua angka ditampilkan benar dalam desimal 7 digit; tidak ada bug pembulatan yang merugikan pengguna.
- **G4** — Submission Aegis lengkap dan dapat diverifikasi (record, screenshot, JSON+MD, brief, link X).
- **G5** — Repo publik yang bisa dibaca orang lain: README, arsitektur, dan cara menjalankan.
- **G6** — Landing page publik yang jujur: menjelaskan produk dalam < 5 detik, menampilkan
  angka vault hidup, dan secara eksplisit menyebutkan keterbatasannya. Lihat [`LANDING.md`](./LANDING.md).

### 3.2 Non-Tujuan (eksplisit TIDAK dikerjakan)

- ❌ Deploy ke **Mainnet** atau menerima dana nyata.
- ❌ Strategi **yield/APY nyata** (vault tanpa yield tetap valid secara SEP-56).
- ❌ Multi-asset vault, leveraged vault, atau strategi lending.
- ❌ KYC, allowlist, geofencing, fiat on-ramp.
- ❌ Aplikasi mobile native.
- ❌ Governance on-chain, upgradeable proxy, multisig.
- ❌ Audit keamanan pihak ketiga (cukup: pin library teraudit + test sendiri).
- ❌ Fitur sosial (leaderboard publik, komentar, profil).
- ❌ Dukungan wallet selain browser extension pada rilis pertama.

> Aturan anti-scope-creep: fitur apa pun yang tidak punya ID requirement di §5
> **tidak boleh dikerjakan** sebelum 24 Okt 2026 20.00 WIB.

---

## 4. Pengguna & Use Case

### 4.1 Persona

**P1 — Rio, "Testnet Explorer" (persona utama)**
- Mahasiswa/developer, punya Freighter, pernah pakai DEX testnet.
- Tujuan: mencoba vault, paham share-nya, melihat bukti on-chain.
- Frustrasi: tidak tahu harus berapa desimal, takut salah jaringan, tidak paham
  kenapa jumlah share ≠ jumlah aset.
- Konteks: desktop, malam hari, koneksi biasa.

**P2 — Dita, "Developer Stellar"**
- Sedang membangun produk yang butuh vault; mencari contoh implementasi SEP-56.
- Tujuan: membaca kode, menjalankan lokal, membandingkan dengan spec.
- Frustrasi: dokumentasi Draft berubah-ubah; tidak ada contoh UI.

**P3 — Evaluator Aegis (sekunder, non-interaktif)**
- Menjalankan checker terhadap contract address, lalu memverifikasi artefak submission.
- Kebutuhan: vault **permissionless**, terisi aset testnet, dan artefak mudah dicek.

### 4.2 Use case kunci

**UC-1 — Deposit pertama**
- Precondition: wallet terhubung, jaringan Testnet, saldo XLM cukup.
- Flow: buka app → connect wallet → input jumlah → lihat preview share → konfirmasi → tanda tangan → status sukses + link explorer.
- Outcome: saldo share bertambah, `total_assets` naik.
- Edge case: signature ditolak, saldo kurang, deposit menghasilkan 0 share, RPC timeout.

**UC-2 — Withdraw sebagian**
- Precondition: punya share.
- Flow: pilih mode "withdraw by assets" → input jumlah → lihat share yang akan dibakar → konfirmasi.
- Outcome: aset diterima, share berkurang.
- Edge case: jumlah melebihi `max_withdraw`, harga share berubah antar-preview, vault liquidity kurang.

**UC-3 — Redeem seluruh posisi**
- Flow: pilih "redeem all" → lihat estimasi aset → konfirmasi.
- Outcome: share = 0, aset diterima penuh.

**UC-4 — Verifikasi eksternal**
- Flow: pengguna membuka explorer dari link tx → mencocokkan jumlah dengan UI.
- Outcome: kepercayaan naik; angka UI = angka on-chain.

**UC-5 — Submission challenge**
- Flow: jalankan checker Aegis → rekam → screenshot → unduh JSON+MD → post X → kirim ke grup.
- Outcome: submission diterima.

---

## 5. Kebutuhan Produk

### 5.1 Functional Requirements — P0 (wajib, gate submission)

> Format acceptance criteria: **Given / When / Then**, harus bisa diuji manual.

#### FR-01 — Koneksi wallet
- **Deskripsi:** Menghubungkan wallet browser (Freighter) dan menampilkan address.
- **User story:** Sebagai Rio, saya ingin menghubungkan wallet agar bisa melihat posisi saya.
- **Acceptance criteria:**
  - [ ] Given wallet belum terpasang, when klik "Connect", then tampil instruksi instalasi (bukan error mentah).
  - [ ] Given wallet di jaringan selain Testnet, when terhubung, then app menampilkan peringatan blocking dan tombol ganti jaringan.
  - [ ] Given wallet terhubung, when halaman dimuat ulang, then sesi tetap terbaca (auto-reconnect) atau ada tombol reconnect yang jelas.
  - [ ] Address ditampilkan terpotong (`GABC…XYZ`) + tombol copy.

#### FR-02 — Pembacaan state vault
- **Deskripsi:** Menampilkan `query_asset`, `total_assets`, `total_supply`, harga per share, saldo share user, saldo aset user.
- **Acceptance criteria:**
  - [ ] Given contract address valid, when halaman dibuka, then kelima nilai tampil < 3 detik pada koneksi normal.
  - [ ] Given `total_supply = 0`, when ditampilkan, then harga share = 1.0000000 (bukan NaN/Infinity).
  - [ ] Semua nilai diformat 7 desimal dengan pemisah ribuan; nilai mentah (`i128`) tersedia via tooltip/detail.
  - [ ] Given RPC gagal, when fetch, then tampil state error + tombol retry (bukan angka 0 palsu).

#### FR-03 — Deposit
- **Deskripsi:** Deposit aset, dengan preview share sebelum eksekusi.
- **Acceptance criteria:**
  - [ ] Given input jumlah valid, when user mengetik, then preview share muncul (debounce ≤ 400 ms) memakai `preview_deposit`.
  - [ ] Given jumlah menghasilkan 0 share, when user konfirmasi, then tombol disabled + pesan "jumlah terlalu kecil".
  - [ ] Given user menyetujui, when tx dikirim, then status berubah: *simulating → awaiting signature → pending → success/failed*.
  - [ ] Given tx sukses, when selesai, then saldo share & `total_assets` ter-refresh tanpa reload manual, dan link explorer tampil.
  - [ ] Given signature ditolak, when kembali ke form, then input tidak hilang dan tidak ada tx terkirim.
  - [ ] Given vault baru dan penyerang melakukan donation (transfer langsung ke kontrak) sebelum deposit korban, when korban deposit, then korban menerima share > 0 dan tidak kehilangan dana (bukti `decimals_offset` bekerja; test T04 di `TRD.md` §7.12).

#### FR-04 — Withdraw & Redeem
- **Deskripsi:** Dua mode keluar: berdasarkan jumlah aset (`withdraw`) dan berdasarkan jumlah share (`redeem`).
- **Acceptance criteria:**
  - [ ] User dapat berpindah mode tanpa kehilangan konteks posisi.
  - [ ] Preview menampilkan jumlah share yang dibakar (mode aset) atau aset yang diterima (mode share), memakai `preview_withdraw` / `preview_redeem`.
  - [ ] Given input > `max_withdraw`/`max_redeem`, when konfirmasi, then tombol disabled + alasan.
  - [ ] Given "Redeem all", when diklik, then input terisi seluruh saldo share.
  - [ ] Tx sukses me-refresh saldo aset, saldo share, dan `total_assets`.

#### FR-05 — Ringkasan posisi
- **Deskripsi:** Kartu ringkasan: nilai posisi (share × harga), porsi kepemilikan (% dari `total_supply`), P/L sederhana terhadap rata-rata deposit (bila tersedia dari indexer).
- **Acceptance criteria:**
  - [ ] Nilai posisi konsisten dengan `convert_to_assets(balance)`.
  - [ ] Given saldo 0, when ditampilkan, then empty state yang mengarahkan ke form deposit.

#### FR-06 — Penanganan error & edge case
- **Acceptance criteria:**
  - [ ] Error dipetakan ke pesan manusiawi untuk minimal 6 kasus: wallet tidak ada, jaringan salah, saldo kurang, signature ditolak, RPC timeout, simulasi gagal.
  - [ ] Tidak ada stack trace / pesan `HostError` mentah yang tampil ke pengguna.
  - [ ] Setiap kegagalan tx menampilkan tombol "coba lagi" tanpa membuat tx duplikat.

#### FR-07 — Kontrak vault & deployment
- **Deskripsi:** Kontrak SEP-56 memakai library OpenZeppelin, di-deploy ke Testnet.
- **Acceptance criteria:**
  - [ ] Contract address diawali `C`, panjang 56 karakter, diverifikasi di explorer.
  - [ ] Constructor menetapkan asset dan `decimals_offset` **sekali**; tidak ada fungsi untuk mengubahnya setelah init.
  - [ ] `deposit`, `mint`, `withdraw`, `redeem` memakai fungsi high-level (dengan auth + event), bukan `*_internal`.
  - [ ] Event `Deposit` dan `Withdraw` terpancar dan terbaca dari RPC.
  - [ ] Unit test kontrak lulus (minimal: deposit, withdraw, redeem, konversi, kasus 0 share, overflow guard).

#### FR-08 — Brief vault & dokumentasi
- **Acceptance criteria:**
  - [ ] README berisi: deskripsi project, alamat kontrak, fungsi umum vault, cara menjalankan lokal, dan tautan explorer.
  - [ ] Ada brief intro vault (mengikuti template Aegis) yang menjelaskan fungsi & fitur dalam bahasa non-teknis.

#### FR-09 — Post X
- **Acceptance criteria:**
  - [ ] Post dari akun X resmi project memuat screen recording proses pengecekan Aegis.
  - [ ] Post menyebut Aegis Vault dan memuat link app/kontrak.
  - [ ] Link post dikirim ke grup challenge.

#### FR-10 — Bundel submission
- **Acceptance criteria:**
  - [ ] 4 artefak lengkap: screen record, screenshot proses+hasil, file JSON, file MD — semuanya memperlihatkan address vault.
  - [ ] Artefak disimpan di satu folder lokal `~/lumbung-artifacts/submission/` (tidak di-commit) dan diunggah/di-share sesuai instruksi grup.
  - [ ] Ada checklist final yang ditandatangani (centang) sebelum dikirim.

### 5.2 Functional Requirements — P1 (hanya jika P0 selesai lebih awal)

| ID | Fitur | Acceptance criteria ringkas |
|---|---|---|
| FR-11 | Indexer riwayat transaksi | Event `Deposit`/`Withdraw` tersimpan di DB; UI menampilkan ≥ 10 tx terakhir dengan link explorer |
| FR-12 | Grafik TVL & harga share | Data historis dari snapshot; grafik menampilkan minimal 7 titik atau empty state jelas |
| FR-13 | Tombol faucet testnet | Mengarah ke Friendbot dengan address user terisi otomatis |
| FR-14 | Transfer share (SEP-41) | User dapat mengirim share ke address lain; saldo ter-update |

### 5.3 Functional Requirements — P2 (dicatat, tidak dikerjakan sekarang)

- Strategi yield sederhana + tampilan APY
- Multi-asset vault
- WalletConnect / mobile wallet
- Mode gelap, i18n (ID/EN)
- Notifikasi email/Telegram saat tx selesai

### 5.4 Functional Requirements — Landing Page (P0.5 / P1)

> Didefinisikan penuh di [`LANDING.md`](./LANDING.md). Ringkasan trace:
>
> - **P0.5 (wajib, ~3 jam):** LP-01..LP-11 — routing `/` vs `/app`, nav + badge testnet,
>   hero dengan statistik hidup, how it works, what is a share, why a standard vault,
>   security & known limitations, FAQ jujur, footer, meta + OG image.
> - **P1 (~4 jam, hanya bila Gate C hijau):** LP-12..LP-14 — halaman `/docs`,
>   mechanics & transparency, roadmap jujur.
>
> **Aturan keras:** landing tidak boleh dikerjakan sebelum FR-03 (deposit) dan FR-04
> (withdraw) terbukti jalan. Ini proteksi terhadap risiko R1.
>
> **Status v0.3:** LP-01..LP-14 **sudah terimplementasi**. Karena itu yang tersisa bukan
> pembangunan, melainkan 6 perbaikan wajib **L1–L6** di [`LANDING.md`](./LANDING.md) §10.1.
> Aturan keras tetap berlaku untuk perbaikan tersebut: dikerjakan **setelah** deposit &
> withdraw jalan (D3), bukan sebelumnya. L1 (data mock ditampilkan sebagai live) dan
> L3 (SPA rewrite) tidak boleh dipotong.

---

## 6. Non-Functional Requirements

| ID | Kategori | Requirement | Cara ukur |
|---|---|---|---|
| NFR-01 | Performa | LCP < 2.5 s pada 4G; pembacaan state vault p95 < 1.5 s | Lighthouse + timing log |
| NFR-02 | Performa | Feedback status tx < 1 s setelah signature; konfirmasi mengikuti ledger (~5 s) | Uji manual 5× |
| NFR-03 | Keamanan | Private key/seed **tidak pernah** menyentuh server; signing hanya di wallet | Code review |
| NFR-04 | Keamanan | Semua transaksi disimulasikan sebelum dikirim; kegagalan simulasi memblokir pengiriman | Code review + uji |
| NFR-05 | Keamanan | Validasi format address (`G...`/`C...`, 56 karakter) di semua input | Unit test |
| NFR-06 | Keamanan | Dependency dikunci ke versi tertentu (lockfile + tag rilis library, bukan `main`) | Cek `Cargo.lock`/`package-lock.json` |
| NFR-07 | Keamanan | Kontrak tidak memiliki fungsi admin yang dapat menarik dana pengguna | Audit manual fungsi publik |
| NFR-08 | Aksesibilitas | Kontras ≥ 4.5:1, navigasi keyboard, label form eksplisit, fokus terlihat | Lighthouse a11y ≥ 90 |
| NFR-09 | Kompatibilitas | Chrome/Firefox/Safari 2 versi terakhir; responsif ≥ 360 px | Uji manual |
| NFR-10 | Observabilitas | Error frontend tertangkap error boundary; log server terstruktur (JSON) | Code review |
| NFR-11 | Privasi | Tidak menyimpan PII; hanya data publik on-chain | Code review |
| NFR-12 | Biaya | Operasional = Rp0 (hosting free tier, testnet) | Cek tagihan |
| LP-NFR-01..05 | Landing | Performa (LCP < 2.0 s, CLS < 0.1), a11y ≥ 95, kualitas copy, responsif 360–1920 px, degradasi saat RPC mati | Lighthouse + checklist [`LANDING.md`](./LANDING.md) §11 |

---

## 7. UX & Prinsip Desain

### 7.1 Layar utama (P0)

1. **Beranda / Vault** — satu halaman, tiga blok: header wallet, kartu statistik vault, panel aksi (tab Deposit | Withdraw).
2. **Panel posisi** — saldo share, nilai aset, porsi kepemilikan.
3. **Riwayat** — (P1) daftar transaksi.
4. **Status transaksi** — modal/step yang tidak bisa ditutup sebelum hasil final.

### 7.2 Prinsip

- **Angka jujur di atas angka cantik.** Selalu tampilkan preview sebelum aksi, dan tampilkan nilai mentah bila diminta.
- **Satu aksi, satu signature.** Manfaatkan perilaku `transfer` langsung saat `operator == from` (tanpa `approve`).
- **Jelaskan, jangan asumsikan.** Desimal, harga share, dan "kenapa share ≠ aset" diberi penjelasan singkat kontekstual.
- **Gagal dengan jelas.** Setiap error punya penyebab + langkah berikutnya.
- **Testnet terasa aman.** Label "TESTNET — dana tidak bernilai" selalu terlihat.

### 7.3 Alur utama

```
[Connect Wallet] → [Baca state vault] → [Input jumlah]
       → [Preview share/aset] → [Simulate] → [Sign]
       → [Pending] → [Success + link explorer] → [Refresh posisi]
```

---

## 8. Arsitektur Teknis (ringkas)

> Detail implementasi, skema DB, dan keputusan teknis ada di [`TRD.md`](./TRD.md).
> Bagian ini hanya menetapkan **batas** agar PRD tetap bisa dibaca non-teknis.

| Komponen | Teknologi | Tanggung jawab |
|---|---|---|
| Kontrak | Rust / Soroban SDK 26.1, `stellar-tokens` 0.7.2 (OpenZeppelin) | Vault SEP-56: share token + logika konversi |
| Web | **React 19 SPA (CRA + CRACO)**, JavaScript | UI, wallet, baca/tulis kontrak |
| Wallet | Freighter via Stellar Wallets Kit | Signing di sisi klien |
| RPC | Soroban Testnet RPC | Simulate, send, getEvents |
| Indexer (P1) | Node service + SQLite/Postgres | Riwayat & snapshot TVL |
| Hosting | Vercel (web), free tier (indexer) | Deployment publik |

> **Perubahan v0.3:** web **tidak** memakai Next.js. Landing page sudah terimplementasi
> sebagai React SPA dan menjadi satu aplikasi dengan `/app`. Alasannya di `TRD.md` AD-02;
> ini utang teknis yang dicatat, bukan keputusan yang disembunyikan.

### 8.1 Keputusan teknis yang sudah ditetapkan

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Pakai **OpenZeppelin `stellar-tokens` 0.7.2**, bukan tulis dari nol | Bagian paling rawan (pembulatan, auth, event) sudah teruji & teraudit |
| D2 | `impl FungibleToken for LumbungVault { type ContractType = Vault; }` + `impl FungibleVault` (pola `contracttrait` resmi v0.7.2) | **Koreksi v0.3:** `Compose<(Vault, TotalSupply)>` tidak dipakai di versi ini; pola resmi adalah dua trait impl di atas |
| D3 | Underlying asset: **XLM via SAC** | Tanpa trustline → onboarding paling sederhana |
| D4 | `decimals_offset = 3` | Mitigasi donation/inflation attack pada vault baru |
| D5 | Semua perhitungan uang pakai **`BigInt`** dan desimal dibaca dari chain | Menghindari galat floating point; offset 3 membuat share **10 desimal**, bukan 7 |
| D6 | Tidak ada **backend service** di P0; web membaca langsung dari RPC | Mengurangi komponen yang bisa gagal sebelum deadline |
| D7 | **Tanpa admin, tanpa upgrade, tanpa pause** | Permissionless; memenuhi pemeriksaan keamanan Aegis |
| D8 | Inisialisasi hanya di constructor dengan urutan `set_asset` → `set_decimals_offset` → `set_metadata` | `decimals()` = desimal aset + offset; metadata membekukan nilai tersebut |

### 8.2 Batasan dari SEP-56 yang wajib dipatuhi

- Vault **harus** mengimplementasikan SEP-41 (transfer, approve, allowance, metadata).
- `query_asset()` panic bila asset belum di-set → constructor wajib.
- Pembulatan: user selalu dirugikan (deposit floor, mint ceil, withdraw ceil, redeem floor).
- Otorisasi tidak dipaksakan standar → implementasi wajib memakai jalur high-level library.

---

## 9. Ukuran Keberhasilan

| # | Metrik | Baseline | Target | Tenggat | Cara ukur |
|---|---|---|---|---|---|
| M1 | Kelengkapan submission Aegis | 0/5 | 5/5 (4 artefak + link X) | 24 Okt 20.00 | Checklist §11 |
| M2 | Alur deposit → withdraw terbukti on-chain | 0 | ≥ 1 tx sukses masing-masing | 22 Okt | Tx hash di explorer |
| M3 | Waktu pengguna baru sampai deposit pertama | — | < 3 menit | 23 Okt | 3 uji usability (stopwatch) |
| M4 | Checker Aegis berjalan sampai hasil keluar | 0/11 | 11/11 check mengembalikan hasil | 24 Okt | Screenshot |
| M5 | Bug kritis terbuka saat submission | — | 0 | 24 Okt | Issue tracker |
| M6 | Kontrak terverifikasi & dapat diakses publik | — | 100% | 21 Okt | Explorer + UI |
| M7 | (Pasca-challenge) wallet unik yang mencoba | 0 | ≥ 5 dalam 7 hari | 31 Okt | Indexer/RPC |

> **Catatan:** reward Rp200.000 **bukan** metrik keberhasilan produk — itu konsekuensi
> dari M1. Hasil PASS/FAIL checker juga bukan metrik; yang diukur adalah kelengkapan
> dan kebenaran proses.

---

## 10. Dependensi, Risiko, dan Asumsi Terbuka

### 10.1 Dependensi

| Dependensi | Status | Dampak bila gagal | Mitigasi |
|---|---|---|---|
| Toolchain Rust + Soroban CLI | **Belum terpasang** (Node v26 & npm tersedia) | Tidak bisa build/deploy kontrak | Pasang di D0; siapkan binary prebuilt |
| Akses faucet testnet | Belum dicoba | Tidak bisa uji deposit | Fund awal D1, retry berkala |
| Akun X resmi project | **Belum ada** | Submission tidak sah | Buat D0, langsung posting 1–2 update |
| Wallet Freighter untuk QA | Perlu dipastikan | Tidak bisa uji E2E | Instal + import akun testnet |
| Library OpenZeppelin versi stabil | Perlu verifikasi | Build gagal / API berubah | Pin tag rilis, timebox 2 jam |

### 10.2 Risiko

| # | Risiko | Prob. | Dampak | Mitigasi | Pemilik | Keputusan |
|---|---|---|---|---|---|---|
| R1 | Scope creep full stack membuat P0 tidak selesai | **Tinggi** | Tinggi | Gate P0 di §5.1; P1 hanya boleh mulai 23 Okt bila P0 hijau | Shalahuddin | Harian |
| R2 | Setup Rust/Soroban memakan > 1 hari | Sedang | Tinggi | Timebox 3 jam; fallback binary rilis resmi | Shalahuddin | 21 Okt 12.00 |
| R3 | API SEP-56 (Draft) berubah / tidak cocok | Sedang | Sedang | Pin versi, vendor contoh resmi, jangan upgrade di tengah | Shalahuddin | 21 Okt |
| R4 | Checker Aegis tidak bisa mengakses vault (auth/whitelist) | Rendah | **Kritis** | Jangan tambah allowlist; uji dengan wallet kedua | Shalahuddin | 22 Okt |
| R5 | Bug desimal 7 digit (angka 10^7 salah) | Sedang | Tinggi | Semua uang `BigInt`; unit test konversi; QA checklist | Shalahuddin | 22 Okt |
| R6 | Testnet RPC/faucet tidak stabil | Sedang | Sedang | Retry + fallback RPC; snapshot nilai terakhir | Shalahuddin | Berkelanjutan |
| R7 | Wallet pengguna tidak terpasang saat demo/record | Sedang | Sedang | Siapkan panduan 3 langkah; rekam setelah wallet siap | Shalahuddin | 23 Okt |
| R8 | Deadline bergeser/ambigu (24 vs 25 Okt) | Sedang | Sedang | Pakai 24 Okt sebagai deadline internal, 25 Okt sebagai buffer | Shalahuddin | Tetap |
| R9 | Artefak submission tidak lengkap di menit akhir | Sedang | Tinggi | Kumpulkan artefak sejak 23 Okt, bukan 24 Okt | Shalahuddin | 23 Okt |
| R10 | Vault terisi 0 aset → withdraw gagal saat dicek Aegis | Sedang | Sedang | Pre-fund vault + deposit dummy dari akun kedua | Shalahuddin | 23 Okt |

### 10.3 Pertanyaan terbuka

| # | Pertanyaan | Keputusan dibutuhkan | Status |
|---|---|---|---|
| Q1 | Nama & branding final (tetap "Lumbung"?) | 20 Okt | ✅ **Lumbung** (working title, dipakai untuk submission) |
| Q2 | Underlying asset: XLM SAC vs USDC testnet | 21 Okt | ✅ **XLM SAC** — tanpa trustline |
| Q3 | Nilai `decimals_offset` (0 / 3 / 6) | 21 Okt | ✅ **3** — share jadi 10 desimal; semua formatter wajib dinamis |
| Q4 | Apakah backend indexer masuk sebelum deadline? | 22 Okt | ✅ **Tidak.** P1, dikerjakan setelah submission |
| Q5 | Domain kustom atau subdomain Vercel? | 22 Okt | ✅ **`*.vercel.app`**; domain kustom hanya bila ada waktu di D3 |
| Q6 | Handle X resmi project | 21 Okt | ✅ Buat akun resmi di D1, posting 1–2 update sebelum submission |
| Q7 | Apakah perlu vault kedua sebagai "demo" untuk pembanding? | 23 Okt | ✅ **Tidak** — menambah permukaan gagal, tidak dinilai checker |

---

## 11. Rencana Eksekusi & Gate

### 11.1 Timeline

> **Rebaseline v0.3 (21 Okt 14.30).** Landing page sudah selesai lebih awal; kontrak
> belum dimulai. Urutan di bawah adalah urutan yang **benar-benar** dieksekusi —
> kontrak dulu, landing belakangan. Detail per blok ada di `TRD.md` §14.

| Hari | Tanggal | Fokus | Exit criteria (gate) |
|---|---|---|---|
| **D0** | Selasa, 20 Okt | PRD, TASKS, LANDING, **landing page dibangun** | ✅ Landing ada & build sukses |
| **D1** | Rabu, 21 Okt | **Kontrak**: toolchain, scaffold, test, deploy testnet, deposit/withdraw via CLI | **Gate A (23.00):** address `C...` aktif, `decimals()=10`, 1 deposit + 1 withdraw sukses |
| **D2** | Kamis, 22 Okt | **Web**: merge repo, baca state nyata, wallet, deposit/withdraw UI | **Gate B (20.00):** E2E deposit & withdraw sukses dari UI |
| **D3** | Jumat, 23 Okt | **Artefak**: jalankan checker, rekam, JSON/MD, brief, post X, perbaikan landing L1–L6, deploy | **Gate C (18.00):** `/app` publik HTTP 200 + 7 artefak lengkap |
| **D4** | Sabtu, 24 Okt | **Freeze 12.00 WIB**, QA final, kirim | Submission terkirim ≤ 20.00 WIB |

### 11.2 Aturan gate

- **Gate A (21 Okt 23.00):** bila kontrak belum bisa deploy → turunkan scope ke "kontrak + halaman baca-saja", lanjutkan submission.
- **Gate B (22 Okt 20.00):** bila deposit/withdraw dari UI belum jalan → prioritaskan kontrak + script CLI sebagai bukti, UI jadi P1.
- **Gate C (23 Okt 18.00):** bila P0 belum hijau → **hentikan semua fitur baru**, hanya perbaikan bug dan artefak submission.
- **Freeze (24 Okt 12.00):** tidak ada perubahan kode kecuali perbaikan yang menghalangi submission.
- **Aturan pemotongan** (dari pertama): `/docs` + `/status` + `/changelog` → polish landing → brief tambahan. **Kontrak, `/app`, artefak tidak boleh dipotong.**

> Prinsip: **submission yang lengkap dengan app sederhana > app keren yang tidak terkirim.**

### 11.3 Checklist submission (traceability ke SOW)

| # | Syarat Aegis | Artefak | Di mana | Status |
|---|---|---|---|---|
| S1 | Vault testnet, address `C...` 56 karakter | Contract ID | README + UI | ⬜ |
| S2 | Screen record proses pengecekan | `.mp4` | `~/lumbung-artifacts/submission/` | ⬜ |
| S3 | Screenshot proses & hasil (success/error) | `.png` | `~/lumbung-artifacts/submission/` | ⬜ |
| S4 | File JSON hasil | `.json` | `~/lumbung-artifacts/submission/` | ⬜ |
| S5 | File Markdown hasil | `.md` | `~/lumbung-artifacts/submission/` | ⬜ |
| S6 | Address vault + brief fungsi/fitur (template) | `.md`/`.pdf` | `~/lumbung-artifacts/submission/` | ⬜ |
| S7 | Post X resmi project | URL | grup challenge | ⬜ |
| S8 | Akun X resmi project | Profil | — | ⬜ |

### 11.4 Definition of Done (P0)

Sebuah requirement dianggap selesai hanya bila:
1. Acceptance criteria tercentang **dan** dibuktikan (screenshot/tx hash/test).
2. Tidak ada bug kritis/tinggi baru yang terbuka.
3. Dapat dijalankan ulang oleh orang lain mengikuti README.

---

## 12. Di Luar Cakupan (Out of Scope) — ringkasan

Mainnet · dana nyata · yield/APY · multi-asset · KYC · mobile native · governance ·
audit pihak ketiga · fitur sosial · wallet selain browser extension · backend skalabel.

---

## 13. Metodologi Penyusunan PRD

PRD ini disusun dengan menggabungkan praktik berikut:

| Praktik | Sumber | Yang diterapkan |
|---|---|---|
| Struktur PRD korporat | Atlassian Confluence PRD template | Basics & roles, objective, assumptions, open questions, out-of-scope |
| PRD ringkas & testable | `ugur10/prd-template` (GitHub) | Executive summary, P0/P1/P2, acceptance criteria, NFR, risk register, changelog |
| Goals vs Non-Goals | `opulo-inc/prd-template` (GitHub) | §3 non-goals eksplisit; asumsi wajib punya cara validasi |
| Spec-driven development | GitHub Spec Kit | Requirement ber-ID, traceability ke artefak submission & gate harian |
| Standar domain | SEP-56 + OpenZeppelin `stellar-contracts` | Batasan teknis di §8 dan acceptance criteria kontrak |

**Referensi:**
- SEP-56 Tokenized Vault Standard — https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0056.md
- OpenZeppelin Stellar Contracts — https://github.com/OpenZeppelin/stellar-contracts
- Contoh vault resmi — `examples/fungible-vault`
- SOW Aegis Vault Reward Challenge (Google Docs, dibagikan via chat)

---

## 14. Glosarium

| Istilah | Arti |
|---|---|
| **Vault** | Kontrak yang mengumpulkan aset dan menerbitkan share |
| **Share** | Token yang mewakili porsi kepemilikan pada vault |
| **SEP-41** | Standar token fungible Soroban |
| **SEP-56** | Standar tokenized vault Soroban (padanan ERC-4626) |
| **SAC** | Stellar Asset Contract — versi kontrak dari aset Stellar |
| **Stroop** | Satuan terkecil; 1 XLM = 10.000.000 stroop |
| **`i128`** | Tipe integer 128-bit di Soroban; semua nominal memakai ini |
| **RPC** | Endpoint untuk membaca/mengirim transaksi Soroban |
| **`decimals_offset`** | Virtual shares/assets untuk mitigasi donation attack |
| **P0/P1/P2** | Prioritas: wajib / sebaiknya / nanti |

---

## 15. Changelog

| Versi | Tanggal | Perubahan | Penulis |
|---|---|---|---|
| 0.1 | 20 Okt 2026 | Draft awal: problem, goals/non-goals, persona, P0–P2, NFR, arsitektur, risiko, timeline, traceability submission | Shalahuddin |
| 0.2 | 20 Okt 2026 | Amendemen landing page: G6, §5.4 LP-01..14, LP-NFR, D3 timeline. Detail di [`LANDING.md`](./LANDING.md) | Shalahuddin |
| 0.3 | 21 Okt 2026 | Penyelarasan implementasi: web jadi React SPA (A1), D2 dikoreksi ke pola `contracttrait` OZ 0.7.2 (A2), D6 diperjelas tanpa backend service (A3), timeline di-rebaseline (A4), acceptance donation-attack ditambah ke FR-03 (A5), Q1–Q7 ditutup (A6), D7–D8 ditambah. Detail teknis di [`TRD.md`](./TRD.md) | Shalahuddin |
