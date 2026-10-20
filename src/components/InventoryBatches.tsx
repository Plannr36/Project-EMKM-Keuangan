import React, { useState, useMemo } from 'react';
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
  Flame,
  ArrowRight,
  TrendingDown,
  Boxes,
} from 'lucide-react';
import { Produk, PersediaanBatch } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';
import { previewFifoAllocation } from '../utils/fifoEngine';
import { playTapSound } from '../utils/soundEffects';

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

  // Interactive FIFO Simulator state
  const [simProduct, setSimProduct] = useState<number>(101); // Kopi Arabika
  const [simQty, setSimQty] = useState<number>(7);

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

  // Simulation calculation for selected product
  const simProductObj = products.find(p => p.produk_id === simProduct) || products[0];
  const simProductBatches = useMemo(() => {
    return batches.filter(b => b.produk_id === simProduct);
  }, [batches, simProduct]);

  const simResult = useMemo(() => {
    return previewFifoAllocation(simProductBatches, simQty);
  }, [simProductBatches, simQty]);

  const handleOpenAddBatch = () => {
    playTapSound();
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
            <h2 className="text-2xl font-serif-brand font-bold text-stone-900 tracking-tight">
              Gudang &amp; Antrean Batch FIFO
            </h2>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-[11px] font-mono text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              Prinsip Tanggal Tertua (Earliest Batch First)
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Pelacakan lot penerimaan barang dagangan, kartu stok per layer, dan kalkulasi HPP otomatis berstandar SAK EMKM
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              playTapSound();
              setIsAddProductModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-stone-500" />
            <span>Tambah Master SKU</span>
          </button>

          <button
            onClick={handleOpenAddBatch}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-200 bg-[#181512] hover:bg-stone-800 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Penerimaan Stok (Beli Batch)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards with Artisan Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fffdfa] p-4.5 rounded-2xl border border-[#e8e2d8] shadow-xs">
          <span className="text-xs text-stone-500 block font-mono uppercase tracking-wider">Total Nilai Persediaan Aktual (HPP)</span>
          <span className="text-xl font-bold text-stone-900 font-mono tabular-nums mt-1 block">
            {formatRupiah(totalValuation)}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block font-sans">
            Sinkron otomatis dengan Akun 1-3000 di Neraca Saldo
          </span>
        </div>

        <div className="bg-[#fffdfa] p-4.5 rounded-2xl border border-[#e8e2d8] shadow-xs">
          <span className="text-xs text-stone-500 block font-mono uppercase tracking-wider">Jumlah Batch Aktif Tersedia</span>
          <span className="text-xl font-bold text-amber-900 font-mono tabular-nums mt-1 block">
            {batches.filter(b => b.kuantitas_sisa > 0).length} / {batches.length} Batch
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block font-sans">
            {batches.filter(b => b.kuantitas_sisa === 0).length} Batch telah habis dikonsumsi
          </span>
        </div>

        <div className="bg-[#fffdfa] p-4.5 rounded-2xl border border-[#e8e2d8] shadow-xs">
          <span className="text-xs text-stone-500 block font-mono uppercase tracking-wider">Metode Penilaian Persediaan</span>
          <span className="text-xl font-bold text-emerald-800 font-serif-brand mt-1 block">
            FIFO (First-In, First-Out)
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block font-sans">
            Biaya tertua dibebankan ke HPP lebih awal
          </span>
        </div>
      </div>

      {/* Distinctive Feature: Interactive Physical Rack & FIFO Allocator Simulator */}
      <div className="bg-[#fffdfa] border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif-brand">
                Simulasi Alur Rak Gudang &amp; Antrean Batch Keluar
              </h3>
              <p className="text-xs text-stone-600">
                Uji coba langsung bagaimana algoritma FIFO menyedot kuantitas dari batch tertua secara hierarkis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-stone-700">Pilih Produk:</span>
            <select
              value={simProduct}
              onChange={e => {
                playTapSound();
                setSimProduct(Number(e.target.value));
              }}
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {products.map(p => (
                <option key={p.produk_id} value={p.produk_id}>
                  {p.nama_produk}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Pallet Rack */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 font-mono">
              Rak Penyimpanan Lot Batch: {simProductObj?.nama_produk}
            </span>
            <span className="text-stone-500">
              Urutan Pallet: Kiri (Tertua) → Kanan (Terbaru)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {simProductBatches.map((batch, index) => {
              const isFirstOut = index === 0 && batch.kuantitas_sisa > 0;
              const isExhausted = batch.kuantitas_sisa === 0;

              return (
                <div
                  key={batch.batch_id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    isFirstOut
                      ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-2 ring-amber-400/40'
                      : isExhausted
                      ? 'bg-stone-100/60 border-stone-200 opacity-60'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  {isFirstOut && (
                    <div className="absolute top-0 right-0 bg-amber-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg font-mono flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-200" />
                      <span>ANTREAN KELUAR #1</span>
                    </div>
                  )}

                  {isExhausted && (
                    <div className="absolute top-2 right-2 bg-stone-200 text-stone-600 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                      HABIS
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-stone-900">
                      {batch.kode_batch}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {batch.tanggal_masuk}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Harga Pokok Beli:</span>
                      <strong className="font-mono text-stone-900">{formatRupiah(batch.harga_pokok_per_unit)} / unit</strong>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>Kuantitas Tersisa:</span>
                      <strong className="font-mono text-stone-900">{batch.kuantitas_sisa} dari {batch.kuantitas_awal} {simProductObj?.satuan}</strong>
                    </div>

                    {/* Capacity Visual Bar */}
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isExhausted
                            ? 'bg-stone-300'
                            : isFirstOut
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.round((batch.kuantitas_sisa / batch.kuantitas_awal) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="pt-2 flex justify-between text-[11px] text-stone-500 border-t border-stone-100 font-mono">
                      <span>Subtotal Nilai:</span>
                      <span className="font-bold text-stone-800">
                        {formatRupiah(batch.kuantitas_sisa * batch.harga_pokok_per_unit)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Stress-Test Slider */}
        <div className="bg-[#f7f3ec] p-4 rounded-2xl border border-[#e3dcd1] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 font-sans">
                Simulasi: Pengambilan {simQty} {simProductObj?.satuan}
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono">
                Formula SAK EMKM
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max={Math.max(1, simProductBatches.reduce((s, b) => s + b.kuantitas_sisa, 0))}
                value={simQty}
                onChange={e => {
                  playTapSound();
                  setSimQty(Number(e.target.value));
                }}
                className="w-36 accent-amber-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-sm text-stone-900 w-8 text-center">
                {simQty}
              </span>
            </div>
          </div>

          {/* Result of Simulation */}
          {simResult.success ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200/80 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px] uppercase">Rincian Konsumsi Batch</span>
                <div className="mt-1 space-y-0.5 font-bold text-stone-900">
                  {simResult.consumed.map((c, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span>{c.kode_batch}: {c.kuantitas_diambil} unit</span>
                      <span>@ {formatRupiah(c.harga_pokok_per_unit)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px] uppercase">Total HPP Dihasilkan</span>
                <div className="mt-1 text-base font-bold text-amber-900">
                  {formatRupiah(simResult.total_hpp)}
                </div>
                <span className="text-[10px] text-stone-400">
                  Rata-rata: {formatRupiah(simResult.hpp_satuan_rata)}/unit
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px] uppercase">Dampak Laba Kotor</span>
                <div className="mt-1 text-base font-bold text-emerald-800">
                  {formatRupiah(simQty * simProductObj.harga_jual - simResult.total_hpp)}
                </div>
                <span className="text-[10px] text-stone-400">
                  Omzet: {formatRupiah(simQty * simProductObj.harga_jual)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>{simResult.error}</span>
            </div>
          )}
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
              onClick={() => {
                playTapSound();
                setSelectedProductFilter('all');
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer ${
                selectedProductFilter === 'all'
                  ? 'bg-stone-900 text-amber-200 font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
                  onClick={() => {
                    playTapSound();
                    setSelectedProductFilter(p.produk_id);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedProductFilter === p.produk_id
                      ? 'bg-stone-900 text-amber-200 font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
