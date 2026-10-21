# DESIGN.md: Lumbung Vault

Arah desain untuk landing page dan dashboard vault. Dokumen ini mencatat **keputusan yang sudah jadi** beserta alasannya, supaya perubahan berikutnya bisa dicek (R-31: setiap keputusan visual harus bisa ditulis alasannya dalam satu baris).

> Diperbarui setelah audit anti-slop (21 Okt 2026). Temuan dan status sebelumnya ada di `~/lumbung-artifacts/anti-slop/audit-001-2026-10-21.md`.

---

## 1. Identitas

**Lumbung** = gudang padi/storage bersama dalam bahasa Indonesia. Metafora produknya: satu gudang, banyak pemilik. Setiap orang menyetor ke gudang yang sama dan memegang bagiannya.

Implikasi desain:
- Nuansa **hangat dan tenang**, bukan "financial terminal yang dingin". Warna aksennya padi matang, bukan biru korporat.
- Bahasa **editorial**: gambar, tipografi, dan ritme halaman seperti majalah teknis, bukan dashboard SaaS.
- **Jujur tanpa merendahkan**. Setiap batas produk (Testnet, belum ada yield, belum diaudit pihak ketiga) ditulis di halaman yang sama dengan kemampuannya.

## 2. Design Read & Dials

> Membaca ini sebagai: *landing page produk developer untuk standar vault yang belum matang*, dengan bahasa visual *editorial gelap dan hangat*, dial **ENERGY 2 / RHYTHM 2 / MOTION 2**.

| Dial | Nilai | Alasan |
|---|---|---|
| **ENERGY** | 2 (Seimbang) | Halaman menyapa dengan tenang: satu blok peringatan faktual (Testnet), satu headline, dan panel state langsung. Tidak ada pill "NEW", tidak ada klaim Euforia, tapi juga tidak dingin seperti dokumen teknis. |
| **RHYTHM** | 2 (Konsisten dengan beberapa jeda) | Bahasa editorial yang konsisten: label bernomor mono, garis rambut, panel bersudut. Jeda muncul di bentuk section: baris bertumpuk (How it works), panel terbelah (Security), grid asimetris (Why a standard vault), tabel (Mechanics). Tidak semua section bentuknya sama. |
| **MOTION** | 2 (Scroll-reveal + transisi) | Reveal saat scroll, hover halus, marquee lambat. Tidak ada parallax, pin, atau koreografi. `prefers-reduced-motion` dihormati di Framer Motion maupun CSS. |

## 3. Palet

Satu aksen, satu family netral hangat, dua warna status. Semua pasangan teks/latar di atas **4.5:1** (dicek dengan `contrast-check.py`).

| Token | Nilai | Alasan |
|---|---|---|
| Base | `#0A0B0D` | Hampir hitam dengan sedikit biru. Film-like, dan membuat emas terasa hangat, bukan seperti kuning menyala. |
| Surface | `#121317` | Satu tingkat lebih terang dari base, supaya panel terbaca tanpa perlu border tebal. |
| Hairline | `#1F2126` | Garis pemisah dan border. Senada dengan base, jadi tidak berebut perhatian. Dipakai untuk garis dekoratif, bukan untuk batas kontrol yang harus dikenali. |
| Batas kontrol | `#626872` | Border field input di dashboard: 3,5:1 terhadap latar, memenuhi WCAG 1.4.11 (3:1 untuk batas komponen yang harus dikenali). Garis rambut `#1F2126` tidak cukup jelas untuk area input. |
| Teks utama | `#E7E9EE` | Putih tulang, bukan `#FFFFFF`: mengurangi silau di layar gelap dan butuh kontras 15,9:1. |
| Teks sekunder | `#A9AEB7` | Untuk paragraf. Masih 8,3:1 di atas surface. |
| Teks tersier / label | `#8A9099` | Untuk label dan angka pelengkap. 5,8:1, tetap terbaca. |
| **Aksen** | `#E8B33A` | Emas padi matang. Satu-satunya warna yang "bercerita", dipakai untuk satu fokus per layar: aksi utama, angka section, atau state aktif. |
| Status bahaya | `#F87171` | Dipakai **hanya** untuk pernyataan "ini bukan uang nyata" dan hal yang belum selesai. Bukan warna dekoratif. |
| Status terverifikasi | `#4ADE80` | Dipakai **hanya** untuk hal yang sudah dibuktikan, misalnya "Admin control over funds: None". |

**Anggaran aksen:** emas boleh muncul **sekali per layar** sebagai titik fokus. Kalau dua elemen emas bersaing di layar yang sama, salah satu harus turun jadi netral.

## 4. Tipografi

| Peran | Font | Alasan |
|---|---|---|
| Teks | **Inter** | Grotesk netral dengan x-height tinggi, tetap terbaca pada 15–16px di atas gelap, dan tidak berebut karakter dengan lapisan mono. Pilihan lain (misal serif display) akan menambah beban yang tidak perlu: produk ini soal angka dan status. |
| Data | **JetBrains Mono** | Alamat kontrak, jumlah, dan angka section butuh perataan tabular supaya kolom sejajar. Mono juga menandai konten "bisa dibaca mesin" secara visual: address, spec, dan angka. |

**Skala:** display 44/56/84px (hero) · judul section 28/40px · body 15/16px · label 11/12px mono.

**Label uppercase dengan tracking lebar** dipakai **hanya** untuk nomor section dan tag kategori (mis. `01: HOW IT WORKS`, `SEP-41`). Tidak pernah untuk kalimat, dan tidak pernah jadi pill.

## 5. Motif

**Label editorial bernomor.** Tiap section diawali label mono uppercase berwarna emas di kolom kiri, dengan judul di kolom kanan. Motif ini muncul di 8 section dengan fungsi yang sama: memberi tahu *"di mana kita sekarang"* tanpa perlu scroll indicator atau tombol.

Di Hero, label yang sama dipakai tanpa background atau border. Bukan badge: bentuknya cuma teks, jadi tidak masuk kategori "AI capsule badge".

## 6. Bentuk & radius

| Nilai | Pemakaian |
|---|---|
| 4px | Label status (TESTNET), chip kolom Roadmap. |
| 6px | Kontrol kecil (tombol copy, toggle bahasa). |
| 8px | Tombol dan input. |
| 10px | Panel, kartu, tabel. |

Pill (radius penuh) **hanya** di tempat bentuknya membawa makna: bar progres di ShareMath. Badge capsule tidak dipakai karena status lebih baik dinyatakan dengan kata.

## 7. Motion

- Reveal saat scroll: opacity + pergeseran 18px (atas) atau 24px (samping). Section berbentuk baris masuk dari kiri, section berbentuk kolom naik dari bawah, panel Security masuk dari dua sisi. Itu yang memberi jeda tanpa membuat halaman terasa acak.
- Hover: border menuju aksen, atau lift 4px pada kartu. Tidak ada bounce, scale besar, atau loop.
- Marquee: 60 detik linear, satu siklus. Isinya spesifikasi yang benar-benar diimplementasikan vault, bukan logo perusahaan.
- Semua motion dimatikan untuk pengguna `prefers-reduced-motion`.

## 8. Yang sengaja tidak dipakai

| Tidak dipakai | Alasan |
|---|---|
| Background grid / blueprint | Identitas datang dari grain film dan satu glow hangat. Grid garis bikin halaman terbaca sebagai template developer, bukan produk. |
| Blur di permukaan | Blur hanya di sticky bar (supaya konten yang lewat di belakang tetap terbaca) dan overlay modal (pola dialog). Tidak ada panel kaca. |
| Capsule badge dengan titik | Status ditulis dengan kata ("TESTNET"), bukan pil berwarna dengan titik berdenyut. |
| Panah di setiap tombol | Ada satu affordance arah: CTA utama di Hero. Panah ShareMath itu penghubung a→b, jadi informatif. |
| Light mode | Produk ini satu tema gelap. Tanpa toggle, berarti tidak ada tema yang belum pernah diuji. Set token shadcn dipaksa gelap lewat `class="dark"`. |
| Grid kartu seragam | Section harus sesuai isinya: baris untuk langkah, panel untuk dua daftar, grid asimetris untuk tiga alasan, tabel untuk parameter. |
| Logo bar "trusted by" | Marquee memuat spec yang benar-benar dipakai vault (SEP-56, SEP-41, i128, offset desimal), bukan logo perusahaan. |
| Angka dekoratif | Semua angka di halaman dibaca dari kontrak. Tidak ada statistik yang tidak punya sumber. |

## 9. Aturan untuk perubahan berikutnya

1. **Warna baru, radius baru, bentuk motion baru, atau komponen baru harus punya alasan satu baris yang ditulis di dokumen ini** sebelum dikirim. Kalau alasannya cuma "default AI", jangan dipakai.
2. Aksen emas maksimal satu fokus per layar.
3. Setiap nilai yang ditampilkan harus bisa ditelusuri ke kontrak, spec, atau test. Kalau belum ada sumbernya, tulis sebagai placeholder yang jujur, bukan angka.
4. Batas produk yang belum tercapai ditulis di halaman yang sama dengan kemampuannya (lihat section "Security & known limitations").
5. Copy yang ditulis agent tidak boleh memakai em dash. Pakai koma, titik, atau titik dua.
