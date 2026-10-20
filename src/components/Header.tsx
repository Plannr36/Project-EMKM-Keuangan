/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  RotateCcw,
  Sparkles,
  Layers,
  Scale,
  TrendingUp,
  Wallet,
  Package,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { FinancialStatementsData } from '../types/erp';

interface HeaderProps {
  financials: FinancialStatementsData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetData: () => void;
  onSimulateExample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  financials,
  activeTab,
  setActiveTab,
  onResetData,
  onSimulateExample,
}) => {
  const tabs = [
    { id: 'pos', label: 'Kasir & POS' },
    { id: 'fifo', label: 'Stok & Batch FIFO' },
    { id: 'jurnal', label: 'Jurnal Umum' },
    { id: 'bukubesar', label: 'Buku Besar (GL)' },
    { id: 'laporan', label: 'Laporan Keuangan' },
    { id: 'visualizer', label: 'Alur Sistem ERP' },
    { id: 'pelanggan', label: 'Pelanggan' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner & Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  ERP Mini UMKM
                </h1>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-medium text-slate-600">
                  Sentosa Mart &amp; Roastery
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Metode FIFO
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Akuntansi Ganda &amp; Laporan Keuangan Real-Time Berbasis FIFO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSimulateExample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-2xs whitespace-nowrap"
              title="Eksekusi otomatis contoh 7 unit Kopi Arabika dari dokumen spesifikasi"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulasi Cepat (7 Unit Kopi)</span>
            </button>

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
              title="Kembalikan data ke kondisi awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Real-time Financial KPI Ribbon */}
        <div className="py-2.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Total Kas (1-1000)</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                {formatRupiah(financials.neraca.aset_lancar.kas)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Persediaan (1-3000)</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                {formatRupiah(financials.neraca.aset_lancar.persediaan_barang_dagang)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Penjualan (4-1000)</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                {formatRupiah(financials.laba_rugi.pendapatan_penjualan)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${financials.laba_rugi.laba_bersih >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div>
              <span className="text-slate-500 block text-[11px]">Laba Bersih Berjalan</span>
              <span className={`font-semibold font-mono tabular-nums ${financials.laba_rugi.laba_bersih >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatRupiah(financials.laba_rugi.laba_bersih)}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-between lg:justify-end gap-2 border-t sm:border-t-0 pt-1 sm:pt-0 border-slate-100">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
              <Scale className={`w-3.5 h-3.5 ${financials.neraca.is_balanced ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="text-[11px]">
                <span className="font-medium text-slate-700">Persamaan Akuntansi:</span>{' '}
                <span className={financials.neraca.is_balanced ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {financials.neraca.is_balanced ? 'Seimbang (A = L + E)' : `Selisih ${formatRupiah(financials.neraca.selisih)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar border-t border-slate-100 pt-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
