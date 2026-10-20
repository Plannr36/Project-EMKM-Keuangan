/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import { Pelanggan, Transaksi } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';

interface CustomersViewProps {
  customers: Pelanggan[];
  transactions: Transaksi[];
  onAddCustomer: (nama: string, telepon: string, alamat: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  transactions,
  onAddCustomer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    onAddCustomer(nama.trim(), telepon.trim() || '-', alamat.trim() || '-');
    setIsModalOpen(false);
    setNama('');
    setTelepon('');
    setAlamat('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Daftar Pelanggan (B2B &amp; Retail UMKM)
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
              Master Data Pelanggan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data mitra pembeli, riwayat pesanan, dan piutang penjualan
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tambah Pelanggan</span>
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(customer => {
          const custTransactions = transactions.filter(
            t => t.pelanggan_id === customer.pelanggan_id
          );
          const totalBelanja = custTransactions.reduce(
            (sum, t) => sum + t.total_penjualan,
            0
          );

          return (
            <div
              key={customer.pelanggan_id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    {customer.kode_pelanggan}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Terdaftar: {formatTanggal(customer.created_at)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {customer.nama}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{customer.telepon}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.alamat}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{custTransactions.length} Transaksi</span>
                </div>
                <div className="font-mono font-bold text-indigo-700">
                  {formatRupiah(totalBelanja)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Tambah Data Pelanggan Baru
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap / Nama Toko:
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Toko Barokah Abadi"
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp:
                </label>
                <input
                  type="text"
                  value={telepon}
                  onChange={e => setTelepon(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alamat Pengiriman / Toko:
                </label>
                <textarea
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  rows={2}
                  placeholder="Jl. Raya No. ..., Kota ..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
