/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Archive,
  ArrowDownToLine,
  Filter,
} from 'lucide-react';
import { Produk, PersediaanBatch } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';

interface InventoryBatchesProps {
  products: Produk[];
  batches: PersediaanBatch[];
  onAddBatch: (
    productId: number,
    kodeBatch: string,
    tanggalMasuk: string,
    qty: number,
    costPerUnit: number,
    paymentMethod: 'tunai' | 'kredit',
    keterangan?: string
  ) => void;
  onAddProduct: (
    kodeProduk: string,
    namaProduk: string,
    kategori: string,
    hargaJual: number,
    satuan: string,
    deskripsi?: string
  ) => void;
}

export const InventoryBatches: React.FC<InventoryBatchesProps> = ({
  products,
  batches,
  onAddBatch,
  onAddProduct,
}) => {
  const [selectedProductFilter, setSelectedProductFilter] = useState<number | 'all'>('all');
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // New batch form state
  const [batchProductId, setBatchProductId] = useState<number>(products[0]?.produk_id || 101);
  const [batchKode, setBatchKode] = useState<string>(`B-00${batches.length + 1}`);
  const [batchDate, setBatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchQty, setBatchQty] = useState<number>(10);
  const [batchCost, setBatchCost] = useState<number>(10000);
  const [batchPayment, setBatchPayment] = useState<'tunai' | 'kredit'>('tunai');
  const [batchKeterangan, setBatchKeterangan] = useState<string>('Pembelian dari Supplier');

  // New product form state
  const [prodCode, setProdCode] = useState<string>(`PRD-00${products.length + 1}`);
  const [prodName, setProdName] = useState<string>('');
  const [prodCategory, setProdCategory] = useState<string>('Sembako Pokok');
  const [prodPrice, setProdPrice] = useState<number>(20000);
  const [prodUnit, setProdUnit] = useState<string>('pcs');
  const [prodDesc, setProdDesc] = useState<string>('');

  const filteredBatches = batches.filter(b => {
    if (selectedProductFilter === 'all') return true;
    return b.produk_id === selectedProductFilter;
  });

  // Calculate total inventory valuation
  const totalValuation = batches.reduce(
    (sum, b) => sum + b.kuantitas_sisa * b.harga_pokok_per_unit,
    0
  );

  const handleOpenAddBatch = () => {
    setBatchKode(`B-00${batches.length + 1}`);
    setBatchDate(new Date().toISOString().split('T')[0]);
    setIsAddBatchModalOpen(true);
  };

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchQty <= 0 || batchCost <= 0) return;
    onAddBatch(
      batchProductId,
      batchKode.trim() || `B-${Date.now().toString().slice(-4)}`,
      batchDate,
      batchQty,
      batchCost,
      batchPayment,
      batchKeterangan
    );
    setIsAddBatchModalOpen(false);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0) return;
    onAddProduct(prodCode, prodName, prodCategory, prodPrice, prodUnit, prodDesc);
    setIsAddProductModalOpen(false);
    setProdName('');
    setProdDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Persediaan &amp; Batch FIFO
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
              Basis Tanggal Masuk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan batch barang masuk, sisa stok per layer, dan auto-journal pembelian persediaan
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Tambah Master Produk</span>
          </button>

          <button
            onClick={handleOpenAddBatch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>+ Penerimaan Stok (Beli Batch)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Nilai Persediaan Aktual (HPP)</span>
          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1 block">
            {formatRupiah(totalValuation)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Sinkron dengan Akun Persediaan (1-3000)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Jumlah Batch Aktif</span>
          <span className="text-lg font-bold text-indigo-700 font-mono tabular-nums mt-1 block">
            {batches.filter(b => b.kuantitas_sisa > 0).length} / {batches.length} Batch
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {batches.filter(b => b.kuantitas_sisa === 0).length} Batch telah habis terkonsumsi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Metode Penilaian Persediaan</span>
          <span className="text-lg font-bold text-emerald-700 mt-1 block">
            FIFO (First-In, First-Out)
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Batch tanggal tertua dikeluarkan lebih awal
          </span>
        </div>
      </div>

      {/* Filter Tabs by Product */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Filter Berdasarkan Produk:
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedProductFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedProductFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({batches.length} Batch)
            </button>
            {products.map(p => {
              const productBatches = batches.filter(b => b.produk_id === p.produk_id);
              const remainingStock = productBatches.reduce((sum, b) => sum + b.kuantitas_sisa, 0);
              return (
                <button
                  key={p.produk_id}
                  onClick={() => setSelectedProductFilter(p.produk_id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    selectedProductFilter === p.produk_id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{p.nama_produk}</span>
                  <span className="text-[10px] font-mono opacity-80">({remainingStock})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batches Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Kode Batch</th>
                <th className="py-2.5 px-3">Produk</th>
                <th className="py-2.5 px-3">Tanggal Masuk</th>
                <th className="py-2.5 px-3 text-right">Harga Pokok/Unit</th>
                <th className="py-2.5 px-3">Kapasitas Stok Batch</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok</th>
                <th className="py-2.5 px-3 text-right">Subtotal Nilai</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map(batch => {
                const product = products.find(p => p.produk_id === batch.produk_id);
                const percentLeft = Math.round((batch.kuantitas_sisa / batch.kuantitas_awal) * 100);
                const isExhausted = batch.kuantitas_sisa === 0;
                const isDepleting = percentLeft > 0 && percentLeft <= 30;

                return (
                  <tr
                    key={batch.batch_id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isExhausted ? 'opacity-60 bg-slate-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      {batch.kode_batch}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {product?.nama_produk || 'Produk Tidak Ditemukan'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {product?.kode_produk} · {batch.keterangan || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {formatTanggal(batch.tanggal_masuk)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatRupiah(batch.harga_pokok_per_unit)}
                    </td>
                    <td className="py-3 px-3 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>{batch.kuantitas_sisa} dari {batch.kuantitas_awal} {product?.satuan}</span>
                          <span className="font-mono">{percentLeft}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isExhausted
                                ? 'bg-slate-300'
                                : isDepleting
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentLeft}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {batch.kuantitas_sisa} {product?.satuan}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-700 tabular-nums">
                      {formatRupiah(batch.kuantitas_sisa * batch.harga_pokok_per_unit)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isExhausted ? (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                          Habis
                        </span>
                      ) : isDepleting ? (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                          Menipis
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Batch Modal */}
      {isAddBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Penerimaan Stok Baru (Beli Batch)
                </h3>
              </div>
              <button
                onClick={() => setIsAddBatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBatch} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Produk:
                </label>
                <select
                  value={batchProductId}
                  onChange={e => setBatchProductId(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                >
                  {products.map(p => (
                    <option key={p.produk_id} value={p.produk_id}>
                      {p.nama_produk} ({p.kode_produk})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kode Batch:
                  </label>
                  <input
                    type="text"
                    value={batchKode}
                    onChange={e => setBatchKode(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Masuk:
                  </label>
                  <input
                    type="date"
                    value={batchDate}
                    onChange={e => setBatchDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kuantitas Masuk:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchQty}
                    onChange={e => setBatchQty(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Harga Pokok / Beli (Rp):
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={batchCost}
                    onChange={e => setBatchCost(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Metode Pembayaran Pembelian:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchPayment('tunai')}
                    className={`py-1.5 px-3 rounded-md border text-center transition-colors ${
                      batchPayment === 'tunai'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Tunai (Kredit Kas 1-1000)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchPayment('kredit')}
                    className={`py-1.5 px-3 rounded-md border text-center transition-colors ${
                      batchPayment === 'kredit'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Kredit (Kredit Utang 2-1000)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan Supplier / No. DO:
                </label>
                <input
                  type="text"
                  value={batchKeterangan}
                  onChange={e => setBatchKeterangan(e.target.value)}
                  placeholder="Contoh: Panen Supplier Lot C-05"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="p-2.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-800 font-mono">
                Total Pembelian: {formatRupiah(batchQty * batchCost)}
                <div className="text-indigo-600 mt-0.5">
                  Ayat Jurnal: Dr. Persediaan (1-3000) Rp {formatRupiah(batchQty * batchCost)} / Cr. {batchPayment === 'tunai' ? 'Kas (1-1000)' : 'Utang Usaha (2-1000)'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBatchModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Simpan &amp; Posting Jurnal Pembelian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Master Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Tambah Master Produk Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kode Produk (SKU):
                  </label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={e => setProdCode(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kategori:
                  </label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Produk:
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="Contoh: Teh Celup Melati 25s"
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Harga Jual Standar (Rp):
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Satuan:
                  </label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={e => setProdUnit(e.target.value)}
                    placeholder="pcs, pack, kg, box"
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Deskripsi Produk:
                </label>
                <textarea
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi singkat produk"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
