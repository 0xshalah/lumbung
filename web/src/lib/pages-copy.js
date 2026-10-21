export const pagesCopy = {
  en: {
    docs: {
      label: "/docs — Vault mechanics",
      title: "How the vault works, in plain language.",
      sub: "No jargon required. If something here is unclear, that's a bug in the docs — open an issue.",
      toc: "On this page",
      sections: [
        { id: "share", t: "What is a share?", p: ["When you deposit XLM, the vault gives you shares — a receipt that says what slice of the pool is yours.", "Shares are not the same as XLM. At the time of writing the pool holds 11 XLM and 11 shares are issued, so one share is worth about 1 XLM. Your slice only grows if the pool's assets grow relative to the number of shares."], ex: { k: "Example", rows: [["Pool assets", "11.0000000 XLM"], ["Shares issued", "11.0000000000"], ["Share price", "1.0000000 XLM"], ["You deposit 5 XLM", "≈ 5.0000000000 shares"]] } },
        { id: "decimals", t: "Two decimals, on purpose", p: ["XLM uses 7 decimal places: 1 XLM = 10,000,000 stroops. Vault shares use 10 decimal places, three more than the asset. This is the SEP-56 decimals offset.", "The offset makes a fresh vault expensive to manipulate. An attacker who donates assets to inflate the share price must put in roughly 1000× the victim's deposit before the victim's shares round to zero — and by then the attack always costs the attacker money. The trade-off is that share amounts show three extra digits."], ex: { k: "Conversion", rows: [["1 XLM", "10,000,000 stroops"], ["0.0000001 XLM", "1 stroop (smallest)"], ["1 share", "10,000,000,000 raw units"], ["Decimals offset", "3"]] } },
        { id: "rounding", t: "Rounding policy", p: ["Integer math can't split the last unit, so someone has to absorb the remainder. The vault always rounds in its own favour — by at most 1 unit per action.", "This protects everyone else in the pool from being slowly drained by rounding tricks."], ex: { k: "Who absorbs the remainder", rows: [["Deposit → shares", "rounded down"], ["Mint → assets needed", "rounded up"], ["Withdraw → shares burned", "rounded up"], ["Redeem → assets received", "rounded down"]] } },
        { id: "preview", t: "Previews before every action", p: ["The app computes the exact share or asset amount with the same integer formula the contract uses, and disables the button when an action would produce zero shares.", "When you submit, the transaction is simulated against the live ledger before Freighter asks for a signature. If the simulation fails, nothing is sent."] },
        { id: "limits", t: "Limitations — read this", list: ["Testnet only. Funds have no real value and the network can be reset.", "No yield strategy. Share price only moves if assets are sent to the vault directly.", "Not audited. The code is open-source but has had no independent security review.", "No admin rescue. If you lose your wallet keys, nobody can recover your shares.", "Single asset (XLM via SAC). No other tokens are accepted."] },
      ],
    },
    status: {
      label: "/status — Updated manually",
      title: "System status",
      sub: "A hand-maintained snapshot. No automated uptime claims — we only state what we have verified.",
      updated: "Last updated",
      items: [
        { k: "Vault contract", v: "Live on Testnet", tone: "ok", d: "CDHICU2W…T55GI · deployed wasm hash matches the local artifact · 20/20 unit tests." },
        { k: "Soroban Testnet RPC", v: "Operational", tone: "ok", d: "Reads and writes go directly to soroban-testnet.stellar.org. No backend or indexer in between." },
        { k: "Web app /app", v: "Live", tone: "ok", d: "Deposit, withdraw and redeem with Freighter on Testnet." },
        { k: "Landing & docs", v: "Live", tone: "ok", d: "Static pages served from the web host." },
        { k: "Indexer", v: "Not planned yet", tone: "idle", d: "Transaction history depends on the P1 indexer." },
      ],
      incidents: "Incidents",
      none: "No incidents recorded.",
    },
    changelog: {
      label: "/changelog — Version history",
      title: "What changed, and when.",
      sub: "Every release, written by hand. Newest first.",
      entries: [
        { v: "1.0.0", d: "2026-10", tag: "Protocol", items: ["SEP-56 vault deployed to Stellar Testnet (Protocol 29)", "Verified wasm hash, live deposit/withdraw/redeem via Freighter", "20/20 contract tests, including donation-attack and allowance cases"] },
        { v: "0.3.0", d: "2026-10", tag: "Docs", items: ["Added /docs: shares, decimal offset, rounding policy, limitations", "Added /status and /changelog"] },
        { v: "0.2.0", d: "2026-10", tag: "App", items: ["Vault dashboard at /app with wallet header, stats, position summary", "Deposit, withdraw by assets, redeem by shares, Redeem all", "Step-by-step transaction status and human-readable error cases"] },
        { v: "0.1.0", d: "2026-10", tag: "Landing", items: ["Landing page in EN/ID with live stats panel", "How it works, share math, security, roadmap, FAQ"] },
      ],
    },
  },
  id: {
    docs: {
      label: "/docs — Mekanisme vault",
      title: "Cara kerja vault, dalam bahasa sederhana.",
      sub: "Tanpa jargon. Kalau ada yang membingungkan, itu bug di dokumentasi — buka issue.",
      toc: "Di halaman ini",
      sections: [
        { id: "share", t: "Apa itu share?", p: ["Saat kamu menyetor XLM, vault memberimu share — tanda terima yang menunjukkan bagian pool milikmu.", "Share tidak sama dengan XLM. Saat ini pool berisi 11 XLM dan 11 share beredar, jadi satu share bernilai sekitar 1 XLM. Bagianmu hanya bertambah kalau aset pool bertambah relatif terhadap jumlah share."], ex: { k: "Contoh", rows: [["Aset pool", "11.0000000 XLM"], ["Share diterbitkan", "11.0000000000"], ["Harga share", "1.0000000 XLM"], ["Kamu setor 5 XLM", "≈ 5.0000000000 share"]] } },
        { id: "decimals", t: "Dua desimal, memang disengaja", p: ["XLM memakai 7 angka desimal: 1 XLM = 10.000.000 stroop. Share vault memakai 10 angka desimal, tiga lebih banyak dari asetnya. Inilah decimals offset SEP-56.", "Offset membuat vault baru mahal untuk dimanipulasi. Penyerang yang menyumbang aset untuk menaikkan harga share harus menaruh sekitar 1000× deposit korban sebelum share korban membulat ke nol — dan pada titik itu serangan selalu merugikan penyerang. Konsekuensinya, jumlah share tampil dengan tiga digit tambahan."], ex: { k: "Konversi", rows: [["1 XLM", "10.000.000 stroop"], ["0.0000001 XLM", "1 stroop (terkecil)"], ["1 share", "10.000.000.000 unit mentah"], ["Decimals offset", "3"]] } },
        { id: "rounding", t: "Kebijakan pembulatan", p: ["Matematika bilangan bulat tidak bisa membagi unit terakhir, jadi harus ada yang menanggung sisanya. Vault selalu membulatkan demi keuntungan vault — paling banyak 1 unit per aksi.", "Ini melindungi pengguna lain di pool dari pengurasan pelan-pelan lewat trik pembulatan."], ex: { k: "Siapa yang menanggung sisa", rows: [["Deposit → share", "dibulatkan ke bawah"], ["Mint → aset dibutuhkan", "dibulatkan ke atas"], ["Withdraw → share dibakar", "dibulatkan ke atas"], ["Redeem → aset diterima", "dibulatkan ke bawah"]] } },
        { id: "preview", t: "Pratinjau sebelum setiap aksi", p: ["Aplikasi menghitung jumlah share atau aset persis dengan rumus bilangan bulat yang sama seperti kontrak, dan menonaktifkan tombol bila aksi menghasilkan nol share.", "Saat kamu mengirim, transaksi disimulasikan terhadap ledger langsung sebelum Freighter meminta tanda tangan. Kalau simulasi gagal, tidak ada yang dikirim."] },
        { id: "limits", t: "Keterbatasan — baca ini", list: ["Hanya Testnet. Dana tidak bernilai nyata dan jaringan bisa di-reset.", "Tidak ada strategi yield. Harga share hanya bergerak kalau aset dikirim langsung ke vault.", "Belum diaudit. Kode open-source tetapi belum ada tinjauan keamanan independen.", "Tidak ada penyelamatan admin. Kalau kunci dompetmu hilang, tidak ada yang bisa memulihkan share-mu.", "Satu aset (XLM via SAC). Token lain tidak diterima."] },
      ],
    },
    status: {
      label: "/status — Diperbarui manual",
      title: "Status sistem",
      sub: "Cuplikan yang dirawat manual. Tanpa klaim uptime otomatis — kami hanya menyatakan yang sudah kami verifikasi.",
      updated: "Terakhir diperbarui",
      items: [
        { k: "Kontrak vault", v: "Aktif di Testnet", tone: "ok", d: "CDHICU2W…T55GI · hash wasm on-chain sama dengan artefak lokal · 20/20 unit test." },
        { k: "Soroban Testnet RPC", v: "Operasional", tone: "ok", d: "Baca dan tulis langsung ke soroban-testnet.stellar.org. Tanpa backend atau indexer di tengah." },
        { k: "Web app /app", v: "Aktif", tone: "ok", d: "Deposit, withdraw, dan redeem dengan Freighter di Testnet." },
        { k: "Landing & docs", v: "Aktif", tone: "ok", d: "Halaman statis dari web host." },
        { k: "Indexer", v: "Belum direncanakan", tone: "idle", d: "Riwayat transaksi bergantung pada indexer P1." },
      ],
      incidents: "Insiden",
      none: "Tidak ada insiden tercatat.",
    },
    changelog: {
      label: "/changelog — Riwayat versi",
      title: "Apa yang berubah, dan kapan.",
      sub: "Setiap rilis, ditulis manual. Terbaru di atas.",
      entries: [
        { v: "1.0.0", d: "2026-10", tag: "Protokol", items: ["Vault SEP-56 di-deploy ke Stellar Testnet (Protocol 29)", "Hash wasm terverifikasi, deposit/withdraw/redeem nyata via Freighter", "20/20 test kontrak, termasuk donation attack dan allowance"] },
        { v: "0.3.0", d: "2026-10", tag: "Dokumentasi", items: ["Menambah /docs: share, decimal offset, kebijakan pembulatan, keterbatasan", "Menambah /status dan /changelog"] },
        { v: "0.2.0", d: "2026-10", tag: "Aplikasi", items: ["Dashboard vault di /app dengan header dompet, statistik, ringkasan posisi", "Deposit, withdraw berdasarkan aset, redeem berdasarkan share, Redeem semua", "Status transaksi bertahap dan pesan error yang mudah dipahami"] },
        { v: "0.1.0", d: "2026-10", tag: "Landing", items: ["Landing page EN/ID dengan panel statistik langsung", "Cara kerja, matematika share, keamanan, roadmap, FAQ"] },
      ],
    },
  },
};

export const STATUS_UPDATED = "2026-10-21";
