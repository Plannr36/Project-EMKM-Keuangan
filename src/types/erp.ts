/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pelanggan {
  pelanggan_id: number;
  kode_pelanggan: string;
  nama: string;
  telepon: string;
  alamat: string;
  created_at: string;
}

export interface Produk {
  produk_id: number;
  kode_produk: string;
  nama_produk: string;
  kategori: string;
  harga_jual: number;
  satuan: string;
  stok_total: number;
  deskripsi?: string;
}

export interface PersediaanBatch {
  batch_id: number;
  kode_batch: string;
  produk_id: number;
  tanggal_masuk: string;
  kuantitas_awal: number;
  kuantitas_sisa: number;
  harga_pokok_per_unit: number;
  keterangan?: string;
}

export interface KonsumsiBatch {
  konsumsi_id: number;
  detail_id: number;
  batch_id: number;
  kode_batch: string;
  kuantitas_diambil: number;
  harga_pokok_per_unit: number;
  subtotal_hpp: number;
}

export interface TransaksiDetail {
  detail_id: number;
  transaksi_id: number;
  produk_id: number;
  kode_produk: string;
  nama_produk: string;
  kuantitas: number;
  harga_jual_satuan: number;
  subtotal_jual: number;
  hpp_satuan_rata: number;
  subtotal_hpp: number;
  konsumsi_batch: KonsumsiBatch[];
}

export interface Transaksi {
  transaksi_id: number;
  nomor_invoice: string;
  pelanggan_id: number;
  nama_pelanggan: string;
  tanggal_transaksi: string;
  metode_pembayaran: 'tunai' | 'kredit';
  total_penjualan: number;
  total_hpp: number;
  laba_kotor: number;
  status: 'selesai' | 'batal';
  items: TransaksiDetail[];
  catatan?: string;
}

export type KategoriAkun = 'aset' | 'liabilitas' | 'ekuitas' | 'pendapatan' | 'beban';
export type SaldoNormal = 'debit' | 'kredit';

export interface ChartOfAccounts {
  akun_id: number;
  kode_akun: string;
  nama_akun: string;
  kategori: KategoriAkun;
  saldo_normal: SaldoNormal;
  saldo_awal: number;
  saldo_berjalan: number;
}

export interface JurnalDetail {
  jurnal_detail_id: number;
  jurnal_id: number;
  akun_id: number;
  kode_akun: string;
  nama_akun: string;
  debit: number;
  kredit: number;
}

export type TipeJurnal = 'penjualan' | 'hpp' | 'pembelian' | 'penyesuaian' | 'beban' | 'umum';

export interface JurnalUmum {
  jurnal_id: number;
  nomor_jurnal: string;
  tanggal_jurnal: string;
  keterangan: string;
  transaksi_id?: number;
  nomor_invoice?: string;
  tipe_jurnal: TipeJurnal;
  details: JurnalDetail[];
}

export interface BukuBesarEntry {
  buku_besar_id: number;
  akun_id: number;
  kode_akun: string;
  nama_akun: string;
  jurnal_detail_id: number;
  nomor_jurnal: string;
  tanggal_posting: string;
  keterangan: string;
  debit: number;
  kredit: number;
  saldo_kumulatif: number;
}

export interface FifoConsumptionResult {
  success: boolean;
  consumed: Array<{
    batch_id: number;
    kode_batch: string;
    kuantitas_diambil: number;
    harga_pokok_per_unit: number;
    subtotal_hpp: number;
  }>;
  total_hpp: number;
  hpp_satuan_rata: number;
  updated_batches: PersediaanBatch[];
  error?: string;
}

export interface FinancialStatementsData {
  laba_rugi: {
    pendapatan_penjualan: number;
    retur_penjualan: number;
    penjualan_bersih: number;
    harga_pokok_penjualan: number;
    laba_kotor: number;
    beban_operasional: Array<{
      kode_akun: string;
      nama_akun: string;
      jumlah: number;
    }>;
    total_beban_operasional: number;
    laba_bersih: number;
  };
  perubahan_ekuitas: {
    modal_awal: number;
    laba_bersih: number;
    prive: number;
    modal_akhir: number;
  };
  neraca: {
    aset_lancar: {
      kas: number;
      piutang_usaha: number;
      persediaan_barang_dagang: number;
      total_aset_lancar: number;
    };
    total_aset: number;
    liabilitas_jangka_pendek: {
      utang_usaha: number;
      total_liabilitas: number;
    };
    ekuitas: {
      modal_pemilik: number;
      laba_ditahan: number;
      total_ekuitas: number;
    };
    total_liabilitas_dan_ekuitas: number;
    is_balanced: boolean;
    selisih: number;
  };
}
