/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  Database,
  ArrowDown,
  ShoppingCart,
  Boxes,
  FileSpreadsheet,
  BookOpen,
  PieChart,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Transaksi, JurnalUmum } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';

interface ProcessVisualizerProps {
  transactions: Transaksi[];
  journals: JurnalUmum[];
  onSelectTab: (tabId: string) => void;
}

export const ProcessVisualizer: React.FC<ProcessVisualizerProps> = ({
  transactions,
  journals,
  onSelectTab,
}) => {
  const [selectedTxId, setSelectedTxId] = useState<number | null>(
    transactions[0]?.transaksi_id || null
  );
  const [activeView, setActiveView] = useState<'flow' | 'erd'>('flow');

  const activeTx = transactions.find(t => t.transaksi_id === selectedTxId) || transactions[0];
  const txJournals = activeTx ? journals.filter(j => j.transaksi_id === activeTx.transaksi_id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Visualisasi Alur Logika Bisnis &amp; Arsitektur Sistem
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
              5 Langkah Terpadu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelajari bagaimana setiap checkout kasir mengalir melalui metode FIFO, jurnal otomatis, buku besar, hingga neraca
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs">
            <button
              onClick={() => setActiveView('flow')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeView === 'flow'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alur 5 Langkah (Flowchart)
            </button>
            <button
              onClick={() => setActiveView('erd')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeView === 'erd'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Struktur Database (ERD)
            </button>
          </div>
        </div>
      </div>

      {activeView === 'flow' ? (
        <div className="space-y-6">
          {/* Interactive Transaction Inspector */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pilih Transaksi untuk Melihat Jejak Alur Nyata:
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {transactions.length} Transaksi Tercatat
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {transactions.map(tx => (
                  <button
                    key={tx.transaksi_id}
                    onClick={() => setSelectedTxId(tx.transaksi_id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                      selectedTxId === tx.transaksi_id
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tx.nomor_invoice}</span>
                    <span className="opacity-80">({formatRupiah(tx.total_penjualan)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5-Step Process Visualizer Cards */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Langkah 1 — Pembuatan Pesanan Penjualan (Sales Order Checkout)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pembeli memilih barang, sistem memvalidasi stok dan menerbitkan faktur penjualan unik.
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectTab('pos')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Buka Kasir <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activeTx && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs font-mono space-y-1">
                      <div className="text-slate-500 text-[11px] font-sans">Data Terproses pada Transaksi {activeTx.nomor_invoice}:</div>
                      <div className="text-slate-800">
                        Pelanggan: <strong className="text-slate-900">{activeTx.nama_pelanggan}</strong> | Pembayaran: <strong className="text-slate-900 uppercase">{activeTx.metode_pembayaran}</strong>
                      </div>
                      <div className="text-slate-800">
                        Total Penjualan: <strong className="text-indigo-700">{formatRupiah(activeTx.total_penjualan)}</strong> ({activeTx.items.length} jenis produk)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Down Arrow connector */}
            <div className="flex justify-center -my-2 text-slate-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Langkah 2 — Pengurangan Persediaan dengan Metode FIFO (First-In, First-Out)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Batch persediaan paling lama (tanggal masuk paling awal) dikurangi terlebih dahulu untuk menghitung HPP secara eksak.
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectTab('fifo')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Lihat Batch FIFO <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activeTx ? (
                    <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-200 text-xs font-mono space-y-2">
                      <div className="text-purple-900 font-semibold text-[11px] font-sans">
                        Alokasi Batch Nyata untuk {activeTx.nomor_invoice}:
                      </div>
                      {activeTx.items.map(item => (
                        <div key={item.detail_id} className="space-y-1">
                          <div className="text-slate-800 font-bold">
                            {item.nama_produk} ({item.kuantitas} unit)
                          </div>
                          <div className="pl-3 space-y-0.5">
                            {item.konsumsi_batch.map((k, i) => (
                              <div key={i} className="flex justify-between text-slate-700 text-[11px]">
                                <span>Batch {k.kode_batch} → Ambil {k.kuantitas_diambil} unit @ {formatRupiah(k.harga_pokok_per_unit)}</span>
                                <span className="font-semibold">{formatRupiah(k.subtotal_hpp)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="pt-1.5 border-t border-purple-200 flex justify-between font-bold text-purple-900">
                        <span>Grand Total HPP Transaksi:</span>
                        <span>{formatRupiah(activeTx.total_hpp)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 italic">
                      Lakukan transaksi checkout di menu Kasir untuk mengamati simulasi batch FIFO.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Down Arrow connector */}
            <div className="flex justify-center -my-2 text-slate-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Langkah 3 — Pembuatan Jurnal Umum Otomatis (Auto Double-Entry)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sistem membuat 2 ayat jurnal simultan: Jurnal A (Pengakuan Pendapatan) dan Jurnal B (Pengakuan HPP &amp; Penurunan Persediaan).
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectTab('jurnal')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Buka Jurnal Umum <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-xs font-mono space-y-1">
                      <div className="font-bold text-blue-900 font-sans">Jurnal A — Pengakuan Pendapatan:</div>
                      <div className="text-slate-700">
                        (Dr) {activeTx ? (activeTx.metode_pembayaran === 'tunai' ? '1-1000 Kas' : '1-2000 Piutang Usaha') : '1-1000 Kas'}{' '}
                        <span className="float-right font-semibold">{formatRupiah(activeTx ? activeTx.total_penjualan : 0)}</span>
                      </div>
                      <div className="text-slate-700 pl-4">
                        (Cr) 4-1000 Penjualan{' '}
                        <span className="float-right font-semibold">{formatRupiah(activeTx ? activeTx.total_penjualan : 0)}</span>
                      </div>
                    </div>

                    <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-200 text-xs font-mono space-y-1">
                      <div className="font-bold text-purple-900 font-sans">Jurnal B — Pengakuan HPP &amp; Persediaan:</div>
                      <div className="text-slate-700">
                        (Dr) 5-1000 Harga Pokok Penjualan{' '}
                        <span className="float-right font-semibold">{formatRupiah(activeTx ? activeTx.total_hpp : 0)}</span>
                      </div>
                      <div className="text-slate-700 pl-4">
                        (Cr) 1-3000 Persediaan Barang Dagang{' '}
                        <span className="float-right font-semibold">{formatRupiah(activeTx ? activeTx.total_hpp : 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Down Arrow connector */}
            <div className="flex justify-center -my-2 text-slate-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Langkah 4 — Posting ke Buku Besar (General Ledger Posting)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Setiap baris jurnal didelegasikan ke Buku Besar masing-masing akun, memperbarui saldo berjalan secara real-time.
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectTab('bukubesar')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Buka Buku Besar <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                    <div className="p-2 rounded border border-slate-200 bg-slate-50">
                      <span className="text-[10px] text-slate-500 font-sans block">1-1000 Kas</span>
                      <span className="font-bold text-emerald-700">↑ Bertambah (Debit)</span>
                    </div>
                    <div className="p-2 rounded border border-slate-200 bg-slate-50">
                      <span className="text-[10px] text-slate-500 font-sans block">1-3000 Persediaan</span>
                      <span className="font-bold text-amber-700">↓ Berkurang (Kredit)</span>
                    </div>
                    <div className="p-2 rounded border border-slate-200 bg-slate-50">
                      <span className="text-[10px] text-slate-500 font-sans block">4-1000 Penjualan</span>
                      <span className="font-bold text-indigo-700">↑ Bertambah (Kredit)</span>
                    </div>
                    <div className="p-2 rounded border border-slate-200 bg-slate-50">
                      <span className="text-[10px] text-slate-500 font-sans block">5-1000 HPP</span>
                      <span className="font-bold text-purple-700">↑ Bertambah (Debit)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Down Arrow connector */}
            <div className="flex justify-center -my-2 text-slate-300">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                  5
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Langkah 5 — Dampak pada 3 Laporan Keuangan Real-Time
                      </h3>
                      <p className="text-xs text-slate-500">
                        Laba Rugi, Perubahan Ekuitas, dan Neraca selalu sinkron. Persamaan Akuntansi (Aset = Liabilitas + Ekuitas) terjamin seimbang.
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectTab('laporan')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      Buka Laporan Keuangan <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">A. Laba Rugi</div>
                      <p className="text-slate-600 text-[11px]">
                        Pendapatan ↑, HPP ↑ → Laba kotor dihitung secara instan per transaksi.
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">B. Perubahan Ekuitas</div>
                      <p className="text-slate-600 text-[11px]">
                        Laba bersih mengalir langsung menambah modal akhir pemilik.
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">C. Neraca (Posisi Keuangan)</div>
                      <p className="text-slate-600 text-[11px]">
                        Kas bertambah, Persediaan berkurang, selisihnya menambah ekuitas → Aset = L + E.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ERD & Database Design View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Desain Skema Database &amp; Relasi Entitas (Bagian 2)
              </h3>
              <p className="text-xs text-slate-500">
                10 Tabel Relasional Terhubung Sesuai Diagram UML Spesifikasi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* Table Pelanggan */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-indigo-700 pb-1 border-b border-slate-200">
                pelanggan
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> pelanggan_id</li>
                <li>nama (VARCHAR)</li>
                <li>telepon (VARCHAR)</li>
                <li>alamat (TEXT)</li>
              </ul>
            </div>

            {/* Table Produk */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-indigo-700 pb-1 border-b border-slate-200">
                produk
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> produk_id</li>
                <li><span className="text-blue-600 font-bold">UK</span> kode_produk</li>
                <li>nama_produk</li>
                <li>harga_jual (DECIMAL)</li>
                <li>satuan</li>
              </ul>
            </div>

            {/* Table PersediaanBatch */}
            <div className="p-3 rounded-lg border border-slate-200 bg-indigo-50/50 border-indigo-200">
              <div className="font-bold text-indigo-800 pb-1 border-b border-indigo-200">
                persediaan_batch (FIFO)
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> batch_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> produk_id</li>
                <li>tanggal_masuk (DATE)</li>
                <li>kuantitas_awal</li>
                <li>kuantitas_sisa</li>
                <li>harga_pokok_per_unit</li>
              </ul>
            </div>

            {/* Table Transaksi */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-indigo-700 pb-1 border-b border-slate-200">
                transaksi (Header)
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> transaksi_id</li>
                <li><span className="text-blue-600 font-bold">UK</span> nomor_invoice</li>
                <li><span className="text-purple-600 font-bold">FK</span> pelanggan_id</li>
                <li>tanggal_transaksi</li>
                <li>metode_pembayaran</li>
                <li>total_penjualan</li>
                <li>total_hpp</li>
              </ul>
            </div>

            {/* Table TransaksiDetail */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-indigo-700 pb-1 border-b border-slate-200">
                transaksi_detail (Lines)
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> detail_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> transaksi_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> produk_id</li>
                <li>kuantitas</li>
                <li>harga_jual_satuan</li>
                <li>subtotal_hpp</li>
              </ul>
            </div>

            {/* Table KonsumsiBatch */}
            <div className="p-3 rounded-lg border border-slate-200 bg-indigo-50/50 border-indigo-200">
              <div className="font-bold text-indigo-800 pb-1 border-b border-indigo-200">
                konsumsi_batch
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> konsumsi_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> detail_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> batch_id</li>
                <li>kuantitas_diambil</li>
                <li>harga_pokok_per_unit</li>
              </ul>
            </div>

            {/* Table ChartOfAccounts */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-800 pb-1 border-b border-slate-200">
                chart_of_accounts
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> akun_id</li>
                <li><span className="text-blue-600 font-bold">UK</span> kode_akun</li>
                <li>nama_akun</li>
                <li>kategori</li>
                <li>saldo_normal</li>
                <li>saldo_berjalan</li>
              </ul>
            </div>

            {/* Table JurnalUmum */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-800 pb-1 border-b border-slate-200">
                jurnal_umum
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> jurnal_id</li>
                <li><span className="text-blue-600 font-bold">UK</span> nomor_jurnal</li>
                <li>tanggal_jurnal</li>
                <li><span className="text-purple-600 font-bold">FK</span> transaksi_id</li>
                <li>tipe_jurnal</li>
              </ul>
            </div>

            {/* Table JurnalDetail */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-emerald-800 pb-1 border-b border-slate-200">
                jurnal_detail
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li><span className="text-amber-600 font-bold">PK</span> jurnal_detail_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> jurnal_id</li>
                <li><span className="text-purple-600 font-bold">FK</span> akun_id</li>
                <li>debit</li>
                <li>kredit</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
