/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Pelanggan,
  Produk,
  PersediaanBatch,
  ChartOfAccounts,
  JurnalUmum,
  Transaksi,
} from '../types/erp';

export const INITIAL_CUSTOMERS: Pelanggan[] = [
  {
    pelanggan_id: 1,
    kode_pelanggan: 'CUST-001',
    nama: 'Ibu Siti Rahma',
    telepon: '0812-3456-7890',
    alamat: 'Warung Bu Siti, Jl. Melati No. 14, Bandung',
    created_at: '2026-01-05',
  },
  {
    pelanggan_id: 2,
    kode_pelanggan: 'CUST-002',
    nama: 'Toko Berkah Sejahtera',
    telepon: '0819-8765-4321',
    alamat: 'Pasar Sentral Kios B/08, Cimahi',
    created_at: '2026-01-12',
  },
  {
    pelanggan_id: 3,
    kode_pelanggan: 'CUST-003',
    nama: 'Pak Budi Hartono',
    telepon: '0856-1122-3344',
    alamat: 'Kedai Kopi Sudut Temu, Jl. Dago No. 102',
    created_at: '2026-01-20',
  },
  {
    pelanggan_id: 4,
    kode_pelanggan: 'CUST-004',
    nama: 'Pelanggan Umum (Walk-in)',
    telepon: '-',
    alamat: 'Transaksi Langsung di Toko',
    created_at: '2026-01-01',
  },
];

export const INITIAL_PRODUCTS: Produk[] = [
  {
    produk_id: 101,
    kode_produk: 'PRD-001',
    nama_produk: 'Kopi Arabika Gayo 250g',
    kategori: 'Bahan Minuman',
    harga_jual: 15000,
    satuan: 'pack',
    stok_total: 15,
    deskripsi: 'Biji kopi pilihan roasted medium, aroma floral & citrus khas dataran tinggi Gayo.',
    gambar: '/src/assets/images/kopi_gayo_craft_1792472425395.jpg',
  },
  {
    produk_id: 102,
    kode_produk: 'PRD-002',
    nama_produk: 'Beras Pandan Wangi 5kg',
    kategori: 'Sembako Pokok',
    harga_jual: 82000,
    satuan: 'karung',
    stok_total: 20,
    deskripsi: 'Beras pulen alami tanpa pemutih & pewangi kimia, aroma pandan alami.',
    gambar: '/src/assets/images/beras_pandan_craft_1792472425262.jpg',
  },
  {
    produk_id: 103,
    kode_produk: 'PRD-003',
    nama_produk: 'Minyak Goreng Sawit 2L',
    kategori: 'Minyak & Lemak',
    harga_jual: 38500,
    satuan: 'pouch',
    stok_total: 25,
    deskripsi: 'Minyak goreng kelapa sawit murni 2x penyaringan, jernih & tahan panas.',
    gambar: '/src/assets/images/minyak_sawit_craft_1792472426395.jpg',
  },
  {
    produk_id: 104,
    kode_produk: 'PRD-004',
    nama_produk: 'Gula Pasir Kristal Putih 1kg',
    kategori: 'Pemanis',
    harga_jual: 17500,
    satuan: 'kg',
    stok_total: 30,
    deskripsi: 'Gula tebu kristal bersih manis alami berstandar SNI.',
    gambar: '/src/assets/images/gula_pasir_craft_1792472426698.jpg',
  },
];

/**
 * Batch persediaan awal yang memuat contoh persis dari dokumen:
 * B-001 (2026-01-10, 5 unit @ 8.000)
 * B-002 (2026-02-15, 10 unit @ 9.000)
 * Total stok PRD-001 = 15 unit
 */
export const INITIAL_BATCHES: PersediaanBatch[] = [
  {
    batch_id: 1,
    kode_batch: 'B-001',
    produk_id: 101,
    tanggal_masuk: '2026-01-10',
    kuantitas_awal: 5,
    kuantitas_sisa: 5,
    harga_pokok_per_unit: 8000,
    keterangan: 'Penerimaan Supplier Gayo Lot A-10',
  },
  {
    batch_id: 2,
    kode_batch: 'B-002',
    produk_id: 101,
    tanggal_masuk: '2026-02-15',
    kuantitas_awal: 10,
    kuantitas_sisa: 10,
    harga_pokok_per_unit: 9000,
    keterangan: 'Penerimaan Supplier Gayo Lot B-02',
  },
  {
    batch_id: 3,
    kode_batch: 'B-003',
    produk_id: 102,
    tanggal_masuk: '2026-02-01',
    kuantitas_awal: 20,
    kuantitas_sisa: 20,
    harga_pokok_per_unit: 68000,
    keterangan: 'Panen Cianjur Februari',
  },
  {
    batch_id: 4,
    kode_batch: 'B-004',
    produk_id: 103,
    tanggal_masuk: '2026-02-10',
    kuantitas_awal: 25,
    kuantitas_sisa: 25,
    harga_pokok_per_unit: 32000,
    keterangan: 'Distributor Sawit Utama',
  },
  {
    batch_id: 5,
    kode_batch: 'B-005',
    produk_id: 104,
    tanggal_masuk: '2026-02-12',
    kuantitas_awal: 30,
    kuantitas_sisa: 30,
    harga_pokok_per_unit: 14500,
    keterangan: 'Pabrik Gula Madukismo',
  },
];

/**
 * Bagan Akun Standar UMKM sesuai Bagian 4 Spesifikasi:
 * 1-1000 Kas
 * 1-2000 Piutang Usaha
 * 1-3000 Persediaan Barang Dagang
 * 2-1000 Utang Usaha
 * 3-1000 Modal Pemilik
 * 3-2000 Laba Ditahan
 * 3-3000 Prive
 * 4-1000 Penjualan
 * 4-2000 Retur Penjualan
 * 5-1000 Harga Pokok Penjualan
 * 6-1000 Beban Gaji
 * 6-2000 Beban Sewa
 * 6-3000 Beban Utilitas
 * 6-9000 Beban Lain-Lain
 */
export const INITIAL_ACCOUNTS: ChartOfAccounts[] = [
  {
    akun_id: 1,
    kode_akun: '1-1000',
    nama_akun: 'Kas',
    kategori: 'aset',
    saldo_normal: 'debit',
    saldo_awal: 15000000, // Rp 15.000.000
    saldo_berjalan: 15000000,
  },
  {
    akun_id: 2,
    kode_akun: '1-2000',
    nama_akun: 'Piutang Usaha',
    kategori: 'aset',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 3,
    kode_akun: '1-3000',
    nama_akun: 'Persediaan Barang Dagang',
    kategori: 'aset',
    saldo_normal: 'debit',
    // Nilai awal persediaan dari batch:
    // 5*8.000 + 10*9.000 + 20*68.000 + 25*32.000 + 30*14.500
    // = 40.000 + 90.000 + 1.360.000 + 800.000 + 435.000 = 2.725.000
    saldo_awal: 2725000,
    saldo_berjalan: 2725000,
  },
  {
    akun_id: 4,
    kode_akun: '2-1000',
    nama_akun: 'Utang Usaha',
    kategori: 'liabilitas',
    saldo_normal: 'kredit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 5,
    kode_akun: '3-1000',
    nama_akun: 'Modal Pemilik',
    kategori: 'ekuitas',
    saldo_normal: 'kredit',
    // Modal Awal menyeimbangkan Aset awal: 15.000.000 + 2.725.000 = 17.725.000
    saldo_awal: 17725000,
    saldo_berjalan: 17725000,
  },
  {
    akun_id: 6,
    kode_akun: '3-2000',
    nama_akun: 'Laba Ditahan',
    kategori: 'ekuitas',
    saldo_normal: 'kredit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 7,
    kode_akun: '3-3000',
    nama_akun: 'Prive',
    kategori: 'ekuitas',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 8,
    kode_akun: '4-1000',
    nama_akun: 'Penjualan',
    kategori: 'pendapatan',
    saldo_normal: 'kredit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 9,
    kode_akun: '4-2000',
    nama_akun: 'Retur Penjualan',
    kategori: 'pendapatan',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 10,
    kode_akun: '5-1000',
    nama_akun: 'Harga Pokok Penjualan',
    kategori: 'beban',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 11,
    kode_akun: '6-1000',
    nama_akun: 'Beban Gaji',
    kategori: 'beban',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 12,
    kode_akun: '6-2000',
    nama_akun: 'Beban Sewa',
    kategori: 'beban',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 13,
    kode_akun: '6-3000',
    nama_akun: 'Beban Utilitas',
    kategori: 'beban',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
  {
    akun_id: 14,
    kode_akun: '6-9000',
    nama_akun: 'Beban Lain-Lain',
    kategori: 'beban',
    saldo_normal: 'debit',
    saldo_awal: 0,
    saldo_berjalan: 0,
  },
];

export const INITIAL_TRANSACTIONS: Transaksi[] = [];
export const INITIAL_JOURNALS: JurnalUmum[] = [];
