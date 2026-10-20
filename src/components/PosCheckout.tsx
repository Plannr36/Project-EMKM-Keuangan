/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  Produk,
  PersediaanBatch,
  Pelanggan,
  Transaksi,
} from '../types/erp';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { previewFifoAllocation } from '../utils/fifoEngine';

interface CartItem {
  produk: Produk;
  kuantitas: number;
}

interface PosCheckoutProps {
  products: Produk[];
  batches: PersediaanBatch[];
  customers: Pelanggan[];
  onProcessCheckout: (
    customerId: number,
    paymentMethod: 'tunai' | 'kredit',
    cart: CartItem[]
  ) => { success: boolean; error?: string; transaksi?: Transaksi };
  onNavigateToTab: (tabId: string) => void;
}

export const PosCheckout: React.FC<PosCheckoutProps> = ({
  products,
  batches,
  customers,
  onProcessCheckout,
  onNavigateToTab,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.pelanggan_id || 1);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'kredit'>('tunai');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastCheckoutResult, setLastCheckoutResult] = useState<Transaksi | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Available stock per product based on current batches
  const availableStockMap = useMemo(() => {
    const map: Record<number, number> = {};
    batches.forEach(b => {
      map[b.produk_id] = (map[b.produk_id] || 0) + b.kuantitas_sisa;
    });
    return map;
  }, [batches]);

  const handleAddToCart = (product: Produk) => {
    const existing = cart.find(i => i.produk.produk_id === product.produk_id);
    const currentQty = existing ? existing.kuantitas : 0;
    const available = availableStockMap[product.produk_id] || 0;

    if (currentQty + 1 > available) {
      setCheckoutError(`Stok tidak mencukupi untuk ${product.nama_produk}. Tersedia: ${available} unit.`);
      return;
    }

    setCheckoutError(null);
    if (existing) {
      setCart(cart.map(i => i.produk.produk_id === product.produk_id ? { ...i, kuantitas: i.kuantitas + 1 } : i));
    } else {
      setCart([...cart, { produk: product, kuantitas: 1 }]);
    }
  };

  const handleUpdateQty = (productId: number, delta: number) => {
    const existing = cart.find(i => i.produk.produk_id === productId);
    if (!existing) return;

    const newQty = existing.kuantitas + delta;
    const available = availableStockMap[productId] || 0;

    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    if (newQty > available) {
      setCheckoutError(`Maksimal stok tersedia: ${available} unit.`);
      return;
    }

    setCheckoutError(null);
    setCart(cart.map(i => i.produk.produk_id === productId ? { ...i, kuantitas: newQty } : i));
  };

  const handleRemoveItem = (productId: number) => {
    setCart(cart.filter(i => i.produk.produk_id !== productId));
    setCheckoutError(null);
  };

  const handleClearCart = () => {
    setCart([]);
    setCheckoutError(null);
  };

  // Preset demo quick-fill (Example from document: 7 units of Kopi Arabika)
  const handleQuickPreset7Coffee = () => {
    const coffee = products.find(p => p.kode_produk === 'PRD-001');
    if (!coffee) return;
    const available = availableStockMap[coffee.produk_id] || 0;
    if (available < 7) {
      setCheckoutError(`Stok kopi saat ini (${available} unit) kurang untuk pesanan 7 unit.`);
      return;
    }
    setCart([{ produk: coffee, kuantitas: 7 }]);
    setPaymentMethod('tunai');
    setCheckoutError(null);
  };

  // Real-time FIFO Breakdown simulation for all items in the cart
  const fifoPreviews = useMemo(() => {
    return cart.map(item => {
      const productBatches = batches.filter(b => b.produk_id === item.produk.produk_id);
      const preview = previewFifoAllocation(productBatches, item.kuantitas);
      return {
        item,
        preview,
      };
    });
  }, [cart, batches]);

  const totalPenjualan = cart.reduce((sum, item) => sum + item.kuantitas * item.produk.harga_jual, 0);
  const totalEstimasiHpp = fifoPreviews.reduce((sum, p) => sum + (p.preview.success ? p.preview.total_hpp : 0), 0);
  const estimasiLabaKotor = totalPenjualan - totalEstimasiHpp;

  const handleExecuteCheckout = () => {
    if (cart.length === 0) {
      setCheckoutError('Keranjang belanja masih kosong.');
      return;
    }

    const res = onProcessCheckout(selectedCustomerId, paymentMethod, cart);
    if (!res.success) {
      setCheckoutError(res.error || 'Terjadi kesalahan saat checkout.');
    } else {
      setCheckoutError(null);
      setCart([]);
      setLastCheckoutResult(res.transaksi || null);
    }
  };

  const selectedCustomer = customers.find(c => c.pelanggan_id === selectedCustomerId) || customers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title & Context */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Kasir &amp; Pembuatan Pesanan Penjualan
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
              Langkah 1 &amp; 2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Checkout pesanan penjualan dengan kalkulasi persediaan FIFO dan perhitungan HPP otomatis
          </p>
        </div>

        <button
          onClick={handleQuickPreset7Coffee}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Isi Contoh Spesifikasi: 7 Unit Kopi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Katalog Produk &amp; Stok Tersedia
              </h3>
              <span className="text-xs text-slate-500">
                {products.length} Produk Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map(product => {
                const available = availableStockMap[product.produk_id] || 0;
                const inCart = cart.find(i => i.produk.produk_id === product.produk_id)?.kuantitas || 0;
                const isOutOfStock = available <= 0;

                // Batches info for this product
                const productBatches = batches.filter(b => b.produk_id === product.produk_id && b.kuantitas_sisa > 0);

                return (
                  <div
                    key={product.produk_id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-mono text-slate-500">
                          {product.kode_produk}
                        </span>
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-sm ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : available < 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Stok: {available} {product.satuan}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1">
                        {product.nama_produk}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {product.deskripsi}
                      </p>

                      {/* Batches micro-indicator */}
                      <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                        <div className="text-slate-500 text-[10px]">Batch Aktif (FIFO):</div>
                        {productBatches.length > 0 ? (
                          productBatches.map(b => (
                            <div key={b.batch_id} className="flex justify-between font-mono text-[10px] text-slate-600">
                              <span>{b.kode_batch} ({b.tanggal_masuk})</span>
                              <span>{b.kuantitas_sisa} unit @ {formatRupiah(b.harga_pokok_per_unit)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-red-500 text-[10px]">Stok batch kosong</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm font-mono tabular-nums">
                        {formatRupiah(product.harga_jual)}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock || inCart >= available}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          isOutOfStock || inCart >= available
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCart > 0 ? `Tambah (${inCart})` : 'Pilih'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FIFO Live Simulation Box */}
          {cart.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold text-amber-900 tracking-wide uppercase">
                  Simulasi Pengambilan Batch FIFO Real-Time (Langkah 2)
                </h3>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Sistem secara otomatis mengalokasikan batch tertua terlebih dahulu untuk menghitung Harga Pokok Penjualan (HPP) yang akurat:
              </p>

              <div className="space-y-3">
                {fifoPreviews.map(({ item, preview }) => (
                  <div key={item.produk.produk_id} className="bg-white/90 border border-amber-200/80 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900 pb-1.5 border-b border-amber-100">
                      <span>{item.produk.nama_produk} — {item.kuantitas} {item.produk.satuan}</span>
                      <span className="font-mono text-indigo-700">
                        Harga Jual: {formatRupiah(item.kuantitas * item.produk.harga_jual)}
                      </span>
                    </div>

                    {preview.success ? (
                      <div className="mt-2 space-y-1.5">
                        <div className="text-[11px] font-medium text-slate-600">Alokasi Batch:</div>
                        {preview.consumed.map((c, i) => (
                          <div key={i} className="flex items-center justify-between font-mono text-[11px] bg-slate-50 px-2 py-1 rounded">
                            <span className="text-slate-700">
                              Ambil <strong className="text-slate-900">{c.kuantitas_diambil} unit</strong> dari <strong className="text-indigo-700">{c.kode_batch}</strong> (@ {formatRupiah(c.harga_pokok_per_unit)})
                            </span>
                            <span className="text-slate-900 font-semibold">
                              = {formatRupiah(c.subtotal_hpp)}
                            </span>
                          </div>
                        ))}

                        <div className="pt-1.5 flex justify-between items-center text-[11px] font-semibold text-slate-900 border-t border-slate-100">
                          <span>Total HPP Baris Ini:</span>
                          <span className="font-mono text-emerald-700">
                            {formatRupiah(preview.total_hpp)} (Rata-rata {formatRupiah(preview.hpp_satuan_rata)}/unit)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-red-600 flex items-center gap-1.5 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{preview.error}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Checkout & Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Keranjang Penjualan
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-red-600 hover:text-red-700 transition-colors"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Customer & Payment Method Selector */}
            <div className="mt-3.5 space-y-3 pb-3 border-b border-slate-100 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Pelanggan:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {customers.map(c => (
                    <option key={c.pelanggan_id} value={c.pelanggan_id}>
                      {c.nama} ({c.kode_pelanggan})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  Alamat: {selectedCustomer?.alamat}
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tunai')}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium border text-center transition-colors ${
                      paymentMethod === 'tunai'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tunai (Debit Kas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('kredit')}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium border text-center transition-colors ${
                      paymentMethod === 'kredit'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Kredit (Debit Piutang)
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="py-3 divide-y divide-slate-100 min-h-[140px] max-h-[260px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Belum ada item dipilih</span>
                </div>
              ) : (
                cart.map(item => {
                  const subtotal = item.kuantitas * item.produk.harga_jual;
                  return (
                    <div key={item.produk.produk_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="pr-2 flex-1">
                        <div className="font-semibold text-slate-900">
                          {item.produk.nama_produk}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {formatRupiah(item.produk.harga_jual)} / {item.produk.satuan}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                          <button
                            onClick={() => handleUpdateQty(item.produk.produk_id, -1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-l-md transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-semibold text-xs">
                            {item.kuantitas}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.produk.produk_id, 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-r-md transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-20 text-right font-mono font-semibold text-slate-900">
                          {formatRupiah(subtotal)}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.produk.produk_id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="mb-3 p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Financial Impact Projection */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Penjualan:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatRupiah(totalPenjualan)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total HPP (FIFO):</span>
                <span className="font-mono font-semibold text-red-700 tabular-nums">
                  (-) {formatRupiah(totalEstimasiHpp)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-dashed border-slate-200">
                <span>Estimasi Laba Kotor:</span>
                <span className="font-mono text-emerald-700 tabular-nums">
                  {formatRupiah(estimasiLabaKotor)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleExecuteCheckout}
              disabled={cart.length === 0}
              className={`w-full mt-4 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Proses Checkout &amp; Auto Posting Jurnal</span>
            </button>
          </div>

          {/* Quick Info Box on Double-Entry Accounting */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              <span>Otomasi Setelah Checkout:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
              <li>Batch tertua otomatis dikurangi (FIFO)</li>
              <li>Jurnal A: Dr. {paymentMethod === 'tunai' ? 'Kas (1-1000)' : 'Piutang Usaha (1-2000)'} / Cr. Penjualan (4-1000)</li>
              <li>Jurnal B: Dr. HPP (5-1000) / Cr. Persediaan (1-3000)</li>
              <li>Buku Besar langsung terposting &amp; Laporan Keuangan terupdate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invoice / Success Receipt Modal */}
      {lastCheckoutResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">
                  Transaksi Berhasil Diproses!
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                {lastCheckoutResult.nomor_invoice}
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Pelanggan:</span>
                  <span className="font-semibold text-slate-900">{lastCheckoutResult.nama_pelanggan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Metode Bayar:</span>
                  <span className="font-semibold text-slate-900 capitalize">{lastCheckoutResult.metode_pembayaran}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Penjualan:</span>
                  <span className="font-mono font-semibold text-indigo-700">{formatRupiah(lastCheckoutResult.total_penjualan)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Total HPP (FIFO):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatRupiah(lastCheckoutResult.total_hpp)}</span>
                </div>
              </div>

              {/* FIFO Allocation Log */}
              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  Log Konsumsi Batch FIFO:
                </span>
                <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px]">
                  {lastCheckoutResult.items.flatMap(item =>
                    item.konsumsi_batch.map((k, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{item.nama_produk} ({k.kode_batch}): {k.kuantitas_diambil} unit @ {formatRupiah(k.harga_pokok_per_unit)}</span>
                        <span className="font-semibold">{formatRupiah(k.subtotal_hpp)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Created Journals preview */}
              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  Ayat Jurnal Otomatis yang Terbentuk:
                </span>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-700">
                    <div className="font-medium text-slate-900">Jurnal A (Pendapatan):</div>
                    <div className="flex justify-between pl-2">
                      <span>(Dr) {lastCheckoutResult.metode_pembayaran === 'tunai' ? 'Kas 1-1000' : 'Piutang 1-2000'}</span>
                      <span>{formatRupiah(lastCheckoutResult.total_penjualan)}</span>
                    </div>
                    <div className="flex justify-between pl-4 text-slate-500">
                      <span>(Cr) Penjualan 4-1000</span>
                      <span>{formatRupiah(lastCheckoutResult.total_penjualan)}</span>
                    </div>
                  </div>

                  <div className="text-slate-700 pt-1 border-t border-slate-200">
                    <div className="font-medium text-slate-900">Jurnal B (HPP &amp; Persediaan):</div>
                    <div className="flex justify-between pl-2">
                      <span>(Dr) Harga Pokok Penjualan 5-1000</span>
                      <span>{formatRupiah(lastCheckoutResult.total_hpp)}</span>
                    </div>
                    <div className="flex justify-between pl-4 text-slate-500">
                      <span>(Cr) Persediaan Barang Dagang 1-3000</span>
                      <span>{formatRupiah(lastCheckoutResult.total_hpp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setLastCheckoutResult(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setLastCheckoutResult(null);
                  onNavigateToTab('jurnal');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Lihat di Jurnal Umum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setLastCheckoutResult(null);
                  onNavigateToTab('laporan');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Lihat Laporan Keuangan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
