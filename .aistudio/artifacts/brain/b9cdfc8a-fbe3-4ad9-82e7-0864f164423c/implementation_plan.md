# Rencana Peningkatan Sistem ERP Mini UMKM

Rencana ini melengkapi sistem ERP Mini UMKM dengan fitur-fitur operasional kasir harian, manajemen transaksi ekuitas (Prive & Modal), struk kasir siap cetak, riwayat faktur, serta grafik analisis performa bisnis yang membuat aplikasi semakin fungsional dan mendekati sistem ERP produksi UMKM sesungguhnya.

---

### User Review & Keputusan Kunci

> [!IMPORTANT]
> Berdasarkan evaluasi alur penggunaan aplikasi yang sudah berjalan, beberapa elemen operasional kasir dan keuangan UMKM penting untuk ditambahkan agar alur bisnis terasa utuh:

- **1. Struk Kasir Siap Cetak & Faktur Transaksi**: Menambahkan cetak struk format printer thermal (58mm/80mm) yang umum di toko fisik/kafe, lengkap dengan rincian barang, total, tunai, dan kembalian.
- **2. Kalkulator Pembayaran & Kembalian Kasir di POS**: Input jumlah uang tunai yang diterima dari pelanggan dengan penghitungan uang kembalian secara instan.
- **3. Transaksi Ekuitas (Prive & Setor Modal Pemilik)**: Memungkinkan pemilik UMKM mencatat penarikan prive pribadi (`3-3000`) dan penyetoran modal tambahan (`3-1000`) dengan ayat jurnal otomatis yang langsung memperbarui Laporan Perubahan Ekuitas dan Kas.
- **4. Tab Riwayat Penjualan & Cetak Ulang Faktur**: Daftar seluruh faktur penjualan masa lalu dengan kemampuan filter tanggal, pencarian nama pelanggan, dan tombol cetak ulang faktur.
- **5. Grafik Visual Kinerja Bisnis**: Diagram batang penjualan per produk dan diagram perbandingan Omzet vs HPP vs Beban vs Laba Bersih.

---

## 1. Ikhtisar & Nilai Tambah

- **Target Pengguna**: Pemilik usaha UMKM, kasir toko kelontong, kedai kopi/roastery, distro, dan distributor ritel.
- **Tujuan Utama**: Menghubungkan seluruh siklus operasional kasir fisik (terima uang, hitung kembalian, cetak struk) dengan pembukuan akuntansi ganda dan laporan keuangan real-time yang akurat.

---

## 2. Pengalaman Pengguna & Desain Antarmuka

### A. Alur Kasir Baru (Enhanced POS Experience)
1. Kasir memilih barang dan kuantitas seperti biasa.
2. Preview alokasi FIFO dan HPP otomatis tampil.
3. Kasir memilih metode:
   - Jika **Tunai**: Muncul input nominal uang diterima (dengan tombol cepat pecahan Rp 20.000, Rp 50.000, Rp 100.000, Rp 200.000, atau Uang Pas) serta kalkulasi kembalian real-time.
   - Jika **Kredit**: Otomatis dialokasikan ke Piutang Usaha.
4. Klik **"Selesaikan Pembayaran"** → Modal faktur memunculkan opsi **"Cetak Struk Thermal"** dan **"Cetak Invoice A4"**.

### B. Transaksi Modal & Prive Pemilik (Equity Manager)
- Tombol aksi cepat di header atau tab Jurnal: **"+ Transaksi Pemilik"**
- Pilihan:
  - **Penarikan Prive Pemilik**: `Dr. Prive (3-3000)` vs `Cr. Kas (1-1000)`
  - **Setoran Modal Tambahan**: `Dr. Kas (1-1000)` vs `Cr. Modal Pemilik (3-1000)`
- Langsung tercermin di Laporan Perubahan Ekuitas dan Neraca tanpa mengubah Laba Bersih operasional.

### C. Visualisasi Analisis Keuangan (Analytics Dashboard)
- Bar chart perbandingan Omzet vs HPP vs Laba Bersih
- Status stok menipis (buffer warning alert) per batch persediaan

---

## 3. Keputusan Produk & Trade-Offs

- **Format Struk**: Menggunakan layout CSS `@media print` murni dengan lebar standar 58mm/80mm agar kompatibel dengan printer thermal USB/Bluetooth maupun cetak PDF standar tanpa perlu dependensi library berat eksternal.
- **Prive vs Beban Operasional**: Memisahkan secara tegas antara Beban Usaha (yang masuk Laporan Laba Rugi) dan Prive Pemilik (yang hanya memotong Ekuitas di Neraca & Laporan Perubahan Ekuitas), sesuai standar SAK EMKM.

---

## 4. Diagram Arsitektur Sistem

```
┌───────────────────────────────────────────────────────────────────┐
│                          ANTARMUKA PENGGUNA                       │
│                                                                   │
│  [ Kasir / POS ]     [ Stok & FIFO ]     [ Jurnal & Buku Besar ] │
│  - Input Tunai/Pas   - Monitor Batch     - Auto Double-Entry      │
│  - Hitung Kembalian  - Stok Masuk Beli   - Beban & Prive/Modal    │
│  - Struk Thermal     - Buffer Warning                             │
│                                                                   │
│  [ Riwayat Faktur ]  [ Laporan Keuangan ]  [ Grafik Analisis ]    │
│  - Filter & Cetak    - Laba Rugi / Neraca  - Omzet, HPP & Margin  │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                        LOGIKA BISNIS & MESIN                      │
│                                                                   │
│   ┌─────────────────────┐               ┌─────────────────────┐   │
│   │    FIFO Engine      │               │  Accounting Engine  │   │
│   │ - Konsumsi batch    │──────────────▶│ - Jurnal A (Omzet)  │   │
│   │ - Alokasi HPP       │               │ - Jurnal B (HPP)    │   │
│   └─────────────────────┘               │ - Jurnal Prive/Modal│   │
│                                         │ - General Ledger    │   │
│                                         │ - Laporan Keuangan  │   │
│                                         └─────────────────────┘   │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                      STATE & LOCAL STORAGE                        │
│   Produk · PersediaanBatch · Pelanggan · Transaksi · Jurnal · COA │
└───────────────────────────────────────────────────────────────────┘
```

---

## 5. Rincian Langkah Pengerjaan

1. **POS Enhancements**:
   - Menambahkan input Uang Diterima, tombol cepat nominal uang pas, dan kalkulasi kembalian.
   - Komponen Struk Kasir Thermal (58mm/80mm) yang siap cetak dan mudah dipindai.
2. **Transaksi Modal & Prive**:
   - Modal pencatatan penarikan Prive dan penyetoran Modal Pemilik pada menu Jurnal/Header.
   - Sinkronisasi dengan Laporan Perubahan Ekuitas dan Persamaan Akuntansi `A = L + E`.
3. **Tab Riwayat Faktur Penjualan**:
   - Tab navigasi untuk meninjau seluruh transaksi lampau, rincian produk, HPP, serta tombol cetak ulang faktur.
4. **Widget Analisis & Grafik Tren**:
   - Visual bar chart perbandingan Pendapatan, HPP, dan Laba Bersih yang interaktif dan responsif.
5. **Verifikasi & Pengujian**:
   - Eksekusi unit test `node --test` untuk memastikan keseimbangan akuntansi tetap 100% terjaga.
   - Pengujian tampilan cetak dan antarmuka desktop/mobile dengan browser.
