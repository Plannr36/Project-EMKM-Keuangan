/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFifoConsumption } from './fifoEngine.ts';
import {
  generateSaleJournals,
  postJournalsToLedger,
  calculateFinancialStatements,
} from './accountingEngine.ts';
import { ChartOfAccounts, PersediaanBatch, Transaksi } from '../types/erp.ts';

test('FIFO Engine - 7 unit order consumes 5 from B-001 and 2 from B-002', () => {
  const batches: PersediaanBatch[] = [
    {
      batch_id: 1,
      kode_batch: 'B-001',
      produk_id: 101,
      tanggal_masuk: '2026-01-10',
      kuantitas_awal: 5,
      kuantitas_sisa: 5,
      harga_pokok_per_unit: 8000,
    },
    {
      batch_id: 2,
      kode_batch: 'B-002',
      produk_id: 101,
      tanggal_masuk: '2026-02-15',
      kuantitas_awal: 10,
      kuantitas_sisa: 10,
      harga_pokok_per_unit: 9000,
    },
  ];

  const result = calculateFifoConsumption(batches, 7);

  assert.equal(result.success, true);
  assert.equal(result.consumed.length, 2);

  // First batch: 5 units @ 8,000 = 40,000
  assert.equal(result.consumed[0].kode_batch, 'B-001');
  assert.equal(result.consumed[0].kuantitas_diambil, 5);
  assert.equal(result.consumed[0].subtotal_hpp, 40000);

  // Second batch: 2 units @ 9,000 = 18,000
  assert.equal(result.consumed[1].kode_batch, 'B-002');
  assert.equal(result.consumed[1].kuantitas_diambil, 2);
  assert.equal(result.consumed[1].subtotal_hpp, 18000);

  // Total HPP must be 58,000
  assert.equal(result.total_hpp, 58000);

  // Check remaining stock in updated batches
  assert.equal(result.updated_batches[0].kuantitas_sisa, 0);
  assert.equal(result.updated_batches[1].kuantitas_sisa, 8);
});

test('FIFO Engine - handles insufficient stock error', () => {
  const batches: PersediaanBatch[] = [
    {
      batch_id: 1,
      kode_batch: 'B-001',
      produk_id: 101,
      tanggal_masuk: '2026-01-10',
      kuantitas_awal: 5,
      kuantitas_sisa: 5,
      harga_pokok_per_unit: 8000,
    },
  ];

  const result = calculateFifoConsumption(batches, 10);
  assert.equal(result.success, false);
  assert.ok(result.error?.includes('Stok tidak mencukupi'));
});

test('Accounting Engine - Auto Journal & Balance Sheet Equilibrium', () => {
  const accounts: ChartOfAccounts[] = [
    { akun_id: 1, kode_akun: '1-1000', nama_akun: 'Kas', kategori: 'aset', saldo_normal: 'debit', saldo_awal: 1000000, saldo_berjalan: 1000000 },
    { akun_id: 2, kode_akun: '1-2000', nama_akun: 'Piutang Usaha', kategori: 'aset', saldo_normal: 'debit', saldo_awal: 0, saldo_berjalan: 0 },
    { akun_id: 3, kode_akun: '1-3000', nama_akun: 'Persediaan Barang Dagang', kategori: 'aset', saldo_normal: 'debit', saldo_awal: 130000, saldo_berjalan: 130000 },
    { akun_id: 4, kode_akun: '2-1000', nama_akun: 'Utang Usaha', kategori: 'liabilitas', saldo_normal: 'kredit', saldo_awal: 0, saldo_berjalan: 0 },
    { akun_id: 5, kode_akun: '3-1000', nama_akun: 'Modal Pemilik', kategori: 'ekuitas', saldo_normal: 'kredit', saldo_awal: 1130000, saldo_berjalan: 1130000 },
    { akun_id: 6, kode_akun: '3-2000', nama_akun: 'Laba Ditahan', kategori: 'ekuitas', saldo_normal: 'kredit', saldo_awal: 0, saldo_berjalan: 0 },
    { akun_id: 7, kode_akun: '3-3000', nama_akun: 'Prive', kategori: 'ekuitas', saldo_normal: 'debit', saldo_awal: 0, saldo_berjalan: 0 },
    { akun_id: 8, kode_akun: '4-1000', nama_akun: 'Penjualan', kategori: 'pendapatan', saldo_normal: 'kredit', saldo_awal: 0, saldo_berjalan: 0 },
    { akun_id: 9, kode_akun: '4-2000', nama_akun: 'Retur Penjualan', kategori: 'pendapatan', saldo_normal: 'debit', saldo_awal: 0, saldo_berjalan: 0 },
    { akun_id: 10, kode_akun: '5-1000', nama_akun: 'Harga Pokok Penjualan', kategori: 'beban', saldo_normal: 'debit', saldo_awal: 0, saldo_berjalan: 0 },
  ];

  const mockTransaksi: Transaksi = {
    transaksi_id: 1,
    nomor_invoice: 'INV-2026-0001',
    pelanggan_id: 1,
    nama_pelanggan: 'Ibu Siti',
    tanggal_transaksi: '2026-02-16',
    metode_pembayaran: 'tunai',
    total_penjualan: 105000, // 7 unit @ 15.000
    total_hpp: 58000,       // FIFO: 5*8k + 2*9k
    laba_kotor: 47000,
    status: 'selesai',
    items: [],
  };

  const { journals } = generateSaleJournals(mockTransaksi, accounts, 1);
  assert.equal(journals.length, 2);

  // Journal A (Penjualan): Dr Kas 105.000, Cr Penjualan 105.000
  const jA = journals[0];
  assert.equal(jA.tipe_jurnal, 'penjualan');
  assert.equal(jA.details[0].kode_akun, '1-1000');
  assert.equal(jA.details[0].debit, 105000);
  assert.equal(jA.details[1].kode_akun, '4-1000');
  assert.equal(jA.details[1].kredit, 105000);

  // Journal B (HPP): Dr HPP 58.000, Cr Persediaan 58.000
  const jB = journals[1];
  assert.equal(jB.tipe_jurnal, 'hpp');
  assert.equal(jB.details[0].kode_akun, '5-1000');
  assert.equal(jB.details[0].debit, 58000);
  assert.equal(jB.details[1].kode_akun, '1-3000');
  assert.equal(jB.details[1].kredit, 58000);

  // Post to General Ledger
  const { ledgerEntries, updatedAccounts } = postJournalsToLedger(journals, accounts);
  assert.equal(ledgerEntries.length, 4);

  // Check updated balances
  const kas = updatedAccounts.find(a => a.kode_akun === '1-1000')!;
  assert.equal(kas.saldo_berjalan, 1000000 + 105000); // 1.105.000

  const persediaan = updatedAccounts.find(a => a.kode_akun === '1-3000')!;
  assert.equal(persediaan.saldo_berjalan, 130000 - 58000); // 72.000

  // Calculate Financial Statements
  const statements = calculateFinancialStatements(updatedAccounts);

  assert.equal(statements.laba_rugi.laba_kotor, 47000);
  assert.equal(statements.laba_rugi.laba_bersih, 47000);

  // Neraca
  assert.equal(statements.neraca.aset_lancar.kas, 1105000);
  assert.equal(statements.neraca.aset_lancar.persediaan_barang_dagang, 72000);
  assert.equal(statements.neraca.total_aset, 1177000);

  // Liabilitas + Ekuitas
  // Ekuitas: Modal Awal 1.130.000 + Laba Bersih 47.000 = 1.177.000
  assert.equal(statements.neraca.total_liabilitas_dan_ekuitas, 1177000);
  assert.equal(statements.neraca.is_balanced, true);
  assert.equal(statements.neraca.selisih, 0);
});
