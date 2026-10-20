/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, ShoppingBag, Award, Star, Search, ShieldCheck } from 'lucide-react';
import { Pelanggan, Transaksi } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';
import { playTapSound, playCashRegisterSound } from '../utils/soundEffects';

interface CustomersViewProps {
  customers: Pelanggan[];
  transactions: Transaksi[];
  onAddCustomer: (nama: string, telepon: string, alamat: string) => void;
  onSelectCustomerForPos?: (customerId: number) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  transactions,
  onAddCustomer,
  onSelectCustomerForPos,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    playCashRegisterSound();
    onAddCustomer(nama.trim(), telepon.trim() || '-', alamat.trim() || '-');
    setIsModalOpen(false);
    setNama('');
    setTelepon('');
    setAlamat('');
  };

  const filteredCustomers = customers.filter(c =>
    c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.kode_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telepon.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-serif-brand font-bold text-stone-900 tracking-tight">
              Buku Relasi Mitra &amp; Pelanggan
            </h2>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-[11px] font-mono text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              Merchant CRM
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Kelola buku data pelanggan setia, klasifikasi tier loyalitas, akumulasi belanja grosir &amp; piutang usaha
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-100 bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-md self-start sm:self-auto cursor-pointer border border-amber-900/40 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Tambah Mitra / Pelanggan</span>
        </button>
      </div>

      {/* Search & Statistics Bar */}
      <div className="bg-[#fffdfa] rounded-2xl border border-[#e8e2d8] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari pelanggan (nama, kode, telepon)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-700 focus:bg-white text-stone-900"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-amber-800" />
            <span className="font-semibold text-amber-900">{customers.length} Mitra Terdaftar</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold text-stone-800">{transactions.length} Total Riwayat Checkout</span>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {filteredCustomers.map(customer => {
          const custTransactions = transactions.filter(
            t => t.pelanggan_id === customer.pelanggan_id
          );
          const totalBelanja = custTransactions.reduce(
            (sum, t) => sum + t.total_penjualan,
            0
          );

          // Customer status tier
          let tierLabel = 'Pelanggan Baru';
          let tierColor = 'bg-stone-100 text-stone-700 border-stone-200';
          if (totalBelanja > 2000000) {
            tierLabel = '👑 Mitra Prioritas (VIP)';
            tierColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
          } else if (totalBelanja > 500000) {
            tierLabel = '⭐ Pelanggan Setia';
            tierColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
          }

          return (
            <div
              key={customer.pelanggan_id}
              className="bg-[#fffdfa] rounded-2xl border border-[#e4ded4] hover:border-amber-700/50 p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-600 font-bold">
                    {customer.kode_pelanggan}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierColor}`}>
                    {tierLabel}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="text-base font-serif-brand font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                    {customer.nama}
                  </h3>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Sejak {formatTanggal(customer.created_at)}
                  </div>
                </div>

                <div className="mt-3.5 space-y-2 text-xs text-stone-600 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono text-stone-800">{customer.telepon}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-stone-600">{customer.alamat}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-amber-700" />
                    <span>{custTransactions.length} Pembelian</span>
                  </div>
                  <div className="font-mono font-bold text-stone-900 text-sm mt-0.5">
                    {formatRupiah(totalBelanja)}
                  </div>
                </div>

                {onSelectCustomerForPos && (
                  <button
                    onClick={() => {
                      playTapSound();
                      onSelectCustomerForPos(customer.pelanggan_id);
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Buka Kasir →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffdfa] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-900/20">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-stone-900">
                    Registrasi Mitra Baru
                  </h3>
                  <p className="text-[11px] text-stone-500">Tambahkan pelanggan ke buku direktori UMKM</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  setIsModalOpen(false);
                }}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Pelanggan / Toko Mitra:
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Kedai Kopi Senja Abadi"
                  required
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-amber-700 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nomor Telepon / WhatsApp:
                </label>
                <input
                  type="text"
                  value={telepon}
                  onChange={e => setTelepon(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-amber-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Alamat Pengiriman / Gerai:
                </label>
                <textarea
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  rows={2}
                  placeholder="Jl. Sukajadi No. 12, Bandung"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-amber-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-amber-100 bg-stone-900 hover:bg-stone-800 rounded-xl shadow-md border border-amber-900/30 cursor-pointer"
                >
                  Simpan ke Direktori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
