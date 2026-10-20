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
  Sparkles,
  Layers,
  Printer,
  Receipt,
  FileText,
  Coins,
  ArrowRight,
  Search,
  Tag,
  CreditCard,
  Banknote,
  QrCode,
} from 'lucide-react';
import {
  Produk,
  PersediaanBatch,
  Pelanggan,
  Transaksi,
} from '../types/erp';
import { formatRupiah, formatNumber, formatTanggal } from '../utils/formatters';
import { previewFifoAllocation } from '../utils/fifoEngine';
import { playTapSound, playCashRegisterSound, playWarningSound } from '../utils/soundEffects';

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
    cart: CartItem[],
    cashTendered?: number
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
  const [receiptViewType, setReceiptViewType] = useState<'thermal' | 'faktur'>('thermal');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cash calculation
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Available stock per product based on current batches
  const availableStockMap = useMemo(() => {
    const map: Record<number, number> = {};
    batches.forEach(b => {
      map[b.produk_id] = (map[b.produk_id] || 0) + b.kuantitas_sisa;
    });
    return map;
  }, [batches]);

  const totalPenjualan = cart.reduce((sum, item) => sum + item.kuantitas * item.produk.harga_jual, 0);

  // Auto update cash tendered when payment is cash and user hasn't typed a custom amount
  const kembalian = paymentMethod === 'tunai' ? Math.max(0, cashTendered - totalPenjualan) : 0;
  const isCashInsufficient = paymentMethod === 'tunai' && cashTendered > 0 && cashTendered < totalPenjualan;

  // Filtered products by category and search
  const categories = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'Bahan Minuman', label: '☕ Kopi Specialty' },
    { id: 'Sembako Pokok', label: '🌾 Beras & Pangan' },
    { id: 'Minyak & Lemak', label: '🫒 Minyak Goreng' },
    { id: 'Pemanis', label: '🧂 Gula Kristal' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.kategori === selectedCategory;
      const matchSearch = searchQuery.trim() === '' ||
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kode_produk.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = (product: Produk) => {
    const existing = cart.find(i => i.produk.produk_id === product.produk_id);
    const currentQty = existing ? existing.kuantitas : 0;
    const available = availableStockMap[product.produk_id] || 0;

    if (currentQty + 1 > available) {
      playWarningSound();
      setCheckoutError(`Stok tidak mencukupi untuk ${product.nama_produk}. Tersedia: ${available} ${product.satuan}.`);
      return;
    }

    playTapSound();
    setCheckoutError(null);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map(i => i.produk.produk_id === product.produk_id ? { ...i, kuantitas: i.kuantitas + 1 } : i);
    } else {
      updatedCart = [...cart, { produk: product, kuantitas: 1 }];
    }
    setCart(updatedCart);

    // Auto set cash tendered to exact total if it was equal to old total
    const newTotal = updatedCart.reduce((sum, i) => sum + i.kuantitas * i.produk.harga_jual, 0);
    if (cashTendered === totalPenjualan || cashTendered === 0) {
      setCashTendered(newTotal);
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
      playWarningSound();
      setCheckoutError(`Maksimal stok tersedia untuk produk ini: ${available} unit.`);
      return;
    }

    playTapSound();
    setCheckoutError(null);
    const updated = cart.map(i => i.produk.produk_id === productId ? { ...i, kuantitas: newQty } : i);
    setCart(updated);
    const newTotal = updated.reduce((sum, i) => sum + i.kuantitas * i.produk.harga_jual, 0);
    if (cashTendered <= totalPenjualan) {
      setCashTendered(newTotal);
    }
  };

  const handleRemoveItem = (productId: number) => {
    playTapSound();
    const updated = cart.filter(i => i.produk.produk_id !== productId);
    setCart(updated);
    setCheckoutError(null);
    const newTotal = updated.reduce((sum, i) => sum + i.kuantitas * i.produk.harga_jual, 0);
    setCashTendered(newTotal);
  };

  const handleClearCart = () => {
    playTapSound();
    setCart([]);
    setCashTendered(0);
    setCheckoutError(null);
  };

  // Quick Preset 7 Kopi Arabika
  const handleQuickPreset7Coffee = () => {
    playTapSound();
    const coffee = products.find(p => p.kode_produk === 'PRD-001');
    if (!coffee) return;
    const available = availableStockMap[coffee.produk_id] || 0;
    if (available < 7) {
      playWarningSound();
      setCheckoutError(`Stok kopi saat ini (${available} unit) kurang untuk pesanan 7 unit.`);
      return;
    }
    setCart([{ produk: coffee, kuantitas: 7 }]);
    setPaymentMethod('tunai');
    setCashTendered(105000); // Rp 105.000 exact
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

  const totalEstimasiHpp = fifoPreviews.reduce((sum, p) => sum + (p.preview.success ? p.preview.total_hpp : 0), 0);
  const estimasiLabaKotor = totalPenjualan - totalEstimasiHpp;

  const handleExecuteCheckout = () => {
    if (cart.length === 0) {
      playWarningSound();
      setCheckoutError('Keranjang belanja masih kosong.');
      return;
    }

    if (paymentMethod === 'tunai' && cashTendered < totalPenjualan) {
      playWarningSound();
      setCheckoutError(`Nominal uang diterima (${formatRupiah(cashTendered)}) kurang dari total belanja (${formatRupiah(totalPenjualan)}).`);
      return;
    }

    const res = onProcessCheckout(selectedCustomerId, paymentMethod, cart, cashTendered);
    if (!res.success) {
      playWarningSound();
      setCheckoutError(res.error || 'Terjadi kesalahan saat checkout.');
    } else {
      playCashRegisterSound();
      setCheckoutError(null);
      setCart([]);
      setCashTendered(0);
      setLastCheckoutResult(res.transaksi || null);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const selectedCustomer = customers.find(c => c.pelanggan_id === selectedCustomerId) || customers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title & Context Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-serif-brand font-bold text-stone-900 tracking-tight">
              Terminal Kasir &amp; POS Roastery
            </h2>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-[11px] font-mono font-medium text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              FIFO Real-Time
            </span>
            <span className="text-[11px] font-mono font-medium text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              Otomasi Jurnal Ganda
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Pilih produk merchant, amati pemotongan batch tertua secara transparan, hitung pecahan uang tunai &amp; cetak struk kasir
          </p>
        </div>

        <button
          onClick={handleQuickPreset7Coffee}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Isi Contoh Spesifikasi: 7 Unit Kopi Arabika</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Visual Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#fffefc] rounded-2xl border border-[#e8e2d8] p-5 shadow-xs">
            {/* Catalog Top Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <h3 className="text-sm font-bold text-stone-900 font-serif-brand">
                  Katalog Etalase Sentosa
                </h3>
                <span className="text-xs font-mono text-stone-400">
                  ({filteredProducts.length} produk)
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari produk / kode SKU..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Category Segmented Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-stone-100 no-scrollbar">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playTapSound();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-amber-200 font-semibold shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                Tidak ada produk ditemukan untuk pencarian &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => {
                  const available = availableStockMap[product.produk_id] || 0;
                  const inCart = cart.find(i => i.produk.produk_id === product.produk_id)?.kuantitas || 0;
                  const isOutOfStock = available <= 0;

                  // Batches info for this product
                  const productBatches = batches.filter(b => b.produk_id === product.produk_id && b.kuantitas_sisa > 0);
                  const oldestBatch = productBatches[0];

                  return (
                    <div
                      key={product.produk_id}
                      className="group rounded-2xl border border-stone-200/90 bg-[#fdfcfa] hover:border-amber-500 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      {/* Real Product Photography */}
                      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                        {product.gambar ? (
                          <img
                            src={product.gambar}
                            alt={product.nama_produk}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            No Image
                          </div>
                        )}

                        <div className="absolute top-2 left-2 bg-[#181512]/85 backdrop-blur-xs text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded-md border border-amber-600/30">
                          {product.kode_produk}
                        </div>

                        <div className="absolute top-2 right-2">
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold backdrop-blur-xs shadow-2xs ${
                              isOutOfStock
                                ? 'bg-red-600 text-white'
                                : available < 10
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-700 text-white'
                            }`}
                          >
                            Stok: {available} {product.satuan}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-amber-800">
                            <span>{product.kategori}</span>
                            {oldestBatch && (
                              <span className="font-mono text-[10px] text-stone-500">
                                FIFO Next: {oldestBatch.kode_batch}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-stone-900 mt-1 leading-snug font-serif-brand">
                            {product.nama_produk}
                          </h4>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {product.deskripsi}
                          </p>

                          {/* Batch layers pill */}
                          <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-600 space-y-1">
                            <div className="text-stone-400 font-medium flex items-center justify-between">
                              <span>Batch Masuk Aktif (FIFO):</span>
                              <span className="font-mono text-[9px] text-amber-700">Urutan Masuk Tertua</span>
                            </div>
                            {productBatches.length > 0 ? (
                              productBatches.map((b, idx) => (
                                <div
                                  key={b.batch_id}
                                  className={`flex justify-between font-mono px-2 py-0.5 rounded text-[10px] ${
                                    idx === 0
                                      ? 'bg-amber-100/70 border border-amber-300/80 text-amber-950 font-semibold'
                                      : 'bg-stone-50 text-stone-700'
                                  }`}
                                >
                                  <span>
                                    {idx === 0 ? '▶ ' : ''}{b.kode_batch} ({b.tanggal_masuk})
                                  </span>
                                  <span>{b.kuantitas_sisa} {product.satuan} @ {formatRupiah(b.harga_pokok_per_unit)}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-red-500">Stok habis seluruh batch</div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 block font-mono uppercase">Harga Jual</span>
                            <span className="font-bold text-stone-900 text-base font-mono tabular-nums">
                              {formatRupiah(product.harga_jual)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock || inCart >= available}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                              isOutOfStock || inCart >= available
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-[#181512] text-amber-200 hover:bg-stone-800 shadow-xs active:scale-95'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>{inCart > 0 ? `Pilih (${inCart})` : 'Pilih'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FIFO Live Simulation Warehouse Card */}
          {cart.length > 0 && (
            <div className="bg-amber-50/80 border-2 border-amber-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Alokasi Batch FIFO Persediaan (Langkah 2)
                    </h3>
                    <p className="text-[11px] text-amber-800">
                      Sistem mengekstrak batch tertua terlebih dahulu untuk menghitung HPP riil
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                  FIFO Active
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {fifoPreviews.map(({ item, preview }) => (
                  <div key={item.produk.produk_id} className="bg-white rounded-xl border border-amber-200 p-3.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-amber-100">
                      <span>{item.produk.nama_produk} — {item.kuantitas} {item.produk.satuan}</span>
                      <span className="font-mono text-amber-800">
                        Omzet: {formatRupiah(item.kuantitas * item.produk.harga_jual)}
                      </span>
                    </div>

                    {preview.success ? (
                      <div className="mt-2 space-y-1.5">
                        <div className="text-[11px] font-medium text-slate-500">Konsumsi Layer Batch Terlama:</div>
                        {preview.consumed.map((c, i) => (
                          <div key={i} className="flex items-center justify-between font-mono text-[11px] bg-amber-50/50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                            <span className="text-slate-800">
                              Ambil <strong className="text-amber-900 font-bold">{c.kuantitas_diambil} unit</strong> dari Batch <strong className="text-slate-900">{c.kode_batch}</strong> (@ {formatRupiah(c.harga_pokok_per_unit)})
                            </span>
                            <span className="text-slate-900 font-bold">
                              = {formatRupiah(c.subtotal_hpp)}
                            </span>
                          </div>
                        ))}

                        <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-900 border-t border-slate-100">
                          <span>Total Beban HPP Baris Ini:</span>
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

        {/* Right Column: Tactile POS Cash Terminal Register (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#fffdfa] rounded-2xl border border-[#e4ded4] p-5 shadow-sm">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#181512] text-amber-300 flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif-brand">
                    Keranjang Kasir
                  </h3>
                  <span className="text-[10px] text-stone-400 font-mono">Pesanan Baru (Pending)</span>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Customer Picker with Tier Indicator */}
            <div className="mt-3.5 space-y-3 pb-3 border-b border-stone-200 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700">
                    Pelanggan / Pembeli:
                  </label>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {selectedCustomer?.pelanggan_id === 4 ? 'Walk-in' : 'Mitra Terdaftar'}
                  </span>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={e => {
                    playTapSound();
                    setSelectedCustomerId(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-stone-900"
                >
                  {customers.map(c => (
                    <option key={c.pelanggan_id} value={c.pelanggan_id}>
                      {c.nama} ({c.kode_pelanggan})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 mt-1 truncate">
                  Alamat: {selectedCustomer?.alamat}
                </p>
              </div>

              {/* Payment Method Toggle */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setPaymentMethod('tunai');
                      if (cashTendered === 0) setCashTendered(totalPenjualan);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'tunai'
                        ? 'bg-emerald-900 text-emerald-100 border-emerald-800 shadow-xs font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Tunai (Kas 1-1000)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setPaymentMethod('kredit');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'kredit'
                        ? 'bg-amber-900 text-amber-100 border-amber-800 shadow-xs font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Kredit (Piutang 1-2000)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="py-3 divide-y divide-stone-100 min-h-[140px] max-h-[240px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-stone-400 text-xs">
                  <ShoppingCart className="w-9 h-9 mx-auto mb-2 opacity-30 text-amber-800" />
                  <span>Belum ada barang dipilih. Klik &quot;Pilih&quot; pada etalase produk.</span>
                </div>
              ) : (
                cart.map(item => {
                  const subtotal = item.kuantitas * item.produk.harga_jual;
                  return (
                    <div key={item.produk.produk_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="pr-2 flex-1">
                        <div className="font-bold text-stone-900">
                          {item.produk.nama_produk}
                        </div>
                        <div className="text-stone-500 font-mono text-[11px]">
                          {formatRupiah(item.produk.harga_jual)} / {item.produk.satuan}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                          <button
                            onClick={() => handleUpdateQty(item.produk.produk_id, -1)}
                            className="p-1 hover:bg-stone-200 text-stone-700 rounded-l-lg transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-stone-900">
                            {item.kuantitas}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.produk.produk_id, 1)}
                            className="p-1 hover:bg-stone-200 text-stone-700 rounded-r-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-20 text-right font-mono font-bold text-stone-900">
                          {formatRupiah(subtotal)}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.produk.produk_id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cash Tendered Calculator (Khusus Pembayaran Tunai) */}
            {paymentMethod === 'tunai' && cart.length > 0 && (
              <div className="bg-[#fbf9f5] border border-[#e8e2d8] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-700" />
                    <span>Uang Tunai Diterima:</span>
                  </label>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Pecahan Rupiah</span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={e => setCashTendered(Number(e.target.value))}
                    step="1000"
                    placeholder="Masukkan nominal uang..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-mono text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {/* Quick Cash Buttons styled as authentic Indonesian Banknotes */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setCashTendered(totalPenjualan);
                    }}
                    className="py-1 px-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 text-[10px] font-bold text-center border border-amber-400 transition-colors cursor-pointer"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setCashTendered(50000);
                    }}
                    className="py-1 px-1.5 rounded-lg bg-sky-50 border border-sky-300 hover:bg-sky-100 text-sky-900 text-[10px] font-mono font-bold text-center transition-colors cursor-pointer"
                  >
                    50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setCashTendered(100000);
                    }}
                    className="py-1 px-1.5 rounded-lg bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-900 text-[10px] font-mono font-bold text-center transition-colors cursor-pointer"
                  >
                    100.000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setCashTendered(200000);
                    }}
                    className="py-1 px-1.5 rounded-lg bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-900 text-[10px] font-mono font-bold text-center transition-colors cursor-pointer"
                  >
                    200.000
                  </button>
                </div>

                {/* Kembalian Real-Time Display */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-mono">
                  <span className="font-semibold text-stone-700">Uang Kembalian:</span>
                  <span className={`text-sm font-bold tabular-nums ${
                    isCashInsufficient ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {isCashInsufficient
                      ? `Kurang ${formatRupiah(totalPenjualan - cashTendered)}`
                      : formatRupiah(kembalian)}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {checkoutError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Financial Impact Breakdown */}
            <div className="mt-3 border-t border-stone-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Grand Total Penjualan:</span>
                <span className="font-mono font-bold text-stone-900 tabular-nums">
                  {formatRupiah(totalPenjualan)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Total HPP (FIFO Batch):</span>
                <span className="font-mono font-bold text-rose-700 tabular-nums">
                  (-) {formatRupiah(totalEstimasiHpp)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                <span>Laba Kotor Penjualan:</span>
                <span className="font-mono text-emerald-700 tabular-nums">
                  {formatRupiah(estimasiLabaKotor)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleExecuteCheckout}
              disabled={cart.length === 0 || isCashInsufficient}
              className={`w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                cart.length === 0 || isCashInsufficient
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#181512] text-amber-200 hover:bg-stone-800 shadow-md active:scale-98'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Selesaikan Transaksi &amp; Cetak Struk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Thermal Receipt & Invoice Modal */}
      {lastCheckoutResult && (
        <div className="fixed inset-0 z-50 bg-[#181512]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fcfaf7] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900 font-serif-brand">
                  Transaksi Selesai — Bukti Pembayaran
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setReceiptViewType('thermal')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    receiptViewType === 'thermal' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                  }`}
                >
                  Struk Kasir (58mm)
                </button>
                <button
                  onClick={() => setReceiptViewType('faktur')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    receiptViewType === 'faktur' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
                  }`}
                >
                  Faktur SAK EMKM
                </button>
              </div>
            </div>

            {/* Thermal Receipt Paper Rendering */}
            {receiptViewType === 'thermal' ? (
              <div className="receipt-paper p-6 rounded-xl border border-stone-300 font-mono text-xs text-stone-800 space-y-3 shadow-md max-w-sm mx-auto">
                <div className="text-center space-y-1">
                  <div className="font-bold text-base tracking-wider text-stone-900 font-serif-brand">
                    SENTOSA ROASTERY &amp; MERCANTILE
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Jl. Asia Afrika No. 45, Bandung · Telp: 0812-3456-7890
                  </div>
                  <div className="text-[10px] text-stone-400">
                    NPWP: 01.234.567.8-901.000 · SAK EMKM Terintegrasi
                  </div>
                </div>

                <div className="border-b border-dashed border-stone-300 my-2" />

                <div className="text-[11px] space-y-0.5 text-stone-600">
                  <div className="flex justify-between">
                    <span>No. Faktur:</span>
                    <span className="font-bold text-stone-900">{lastCheckoutResult.nomor_invoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{formatTanggal(lastCheckoutResult.tanggal_transaksi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span>{lastCheckoutResult.nama_pelanggan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span className="uppercase font-bold text-amber-900">{lastCheckoutResult.metode_pembayaran}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-stone-300 my-2" />

                {/* Items */}
                <div className="space-y-2 text-[11px]">
                  {lastCheckoutResult.items.map(item => (
                    <div key={item.detail_id} className="space-y-0.5">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{item.nama_produk}</span>
                        <span>{formatRupiah(item.subtotal_jual)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span>{item.kuantitas} x @ {formatRupiah(item.harga_jual_satuan)}</span>
                        <span>HPP FIFO: {formatRupiah(item.subtotal_hpp)}</span>
                      </div>
                      {/* FIFO batches breakdown in receipt */}
                      <div className="text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                        {item.konsumsi_batch.map(cb => `${cb.kode_batch} (${cb.kuantitas_diambil}u)`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-stone-300 my-2" />

                {/* Receipt Totals */}
                <div className="text-[11px] space-y-1">
                  <div className="flex justify-between font-bold text-stone-900 text-xs">
                    <span>TOTAL:</span>
                    <span className="tabular-nums">{formatRupiah(lastCheckoutResult.total_penjualan)}</span>
                  </div>
                  {lastCheckoutResult.metode_pembayaran === 'tunai' && (
                    <>
                      <div className="flex justify-between text-stone-600">
                        <span>TUNAI:</span>
                        <span className="tabular-nums">{formatRupiah(lastCheckoutResult.uang_diterima || lastCheckoutResult.total_penjualan)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 font-bold">
                        <span>KEMBALIAN:</span>
                        <span className="tabular-nums text-emerald-800">{formatRupiah(lastCheckoutResult.kembalian || 0)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200">
                    <span>Total Beban Pokok (HPP):</span>
                    <span className="tabular-nums">{formatRupiah(lastCheckoutResult.total_hpp)}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-stone-300 my-2" />

                {/* Simulated QRIS / Merchant QR Box */}
                <div className="text-center pt-1 pb-2 space-y-1">
                  <div className="w-24 h-24 mx-auto bg-white p-1.5 border border-stone-300 rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-stone-800" />
                  </div>
                  <div className="text-[9px] text-stone-500 uppercase tracking-wider font-mono">
                    QRIS Terverifikasi BI · ID: NMID-9928172
                  </div>
                  <div className="text-[10px] text-stone-600 font-serif-brand italic pt-1">
                    Terima kasih telah berbelanja di Sentosa!
                  </div>
                </div>
              </div>
            ) : (
              /* Faktur Lengkap View */
              <div className="bg-white p-5 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-3 font-mono">
                <div className="flex justify-between border-b pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 font-serif-brand">SENTOSA ROASTERY &amp; MERCANTILE</h4>
                    <p className="text-[11px] text-stone-500">Faktur Penjualan Barang Dagangan</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900">{lastCheckoutResult.nomor_invoice}</span>
                    <p className="text-[11px] text-stone-500">{formatTanggal(lastCheckoutResult.tanggal_transaksi)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] py-1 border-b">
                  <div>
                    <span className="text-stone-400 block">Ditagihkan Kepada:</span>
                    <strong className="text-stone-900">{lastCheckoutResult.nama_pelanggan}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Status Pembayaran:</span>
                    <strong className="uppercase text-emerald-800">{lastCheckoutResult.status} ({lastCheckoutResult.metode_pembayaran})</strong>
                  </div>
                </div>

                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b text-stone-500">
                      <th className="py-1">Produk</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Harga</th>
                      <th className="py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {lastCheckoutResult.items.map(item => (
                      <tr key={item.detail_id}>
                        <td className="py-1.5 font-bold">{item.nama_produk}</td>
                        <td className="py-1.5 text-center">{item.kuantitas}</td>
                        <td className="py-1.5 text-right">{formatRupiah(item.harga_jual_satuan)}</td>
                        <td className="py-1.5 text-right font-bold">{formatRupiah(item.subtotal_jual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t pt-2 space-y-1 text-right">
                  <div>Total Penjualan: <strong className="text-sm">{formatRupiah(lastCheckoutResult.total_penjualan)}</strong></div>
                  <div className="text-[10px] text-stone-500">HPP Tercatat: {formatRupiah(lastCheckoutResult.total_hpp)}</div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <button
                onClick={() => setLastCheckoutResult(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playTapSound();
                    onNavigateToTab('jurnal');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
                >
                  Lihat di Jurnal Umum →
                </button>

                <button
                  onClick={() => {
                    playTapSound();
                    handlePrintReceipt();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#181512] hover:bg-stone-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak Struk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

