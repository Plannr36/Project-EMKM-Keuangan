/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Scale,
  TrendingUp,
  Wallet,
  Package,
  Landmark,
  Coins,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { FinancialStatementsData } from '../types/erp';
import { getSoundMuted, setSoundMuted, playTapSound } from '../utils/soundEffects';

interface HeaderProps {
  financials: FinancialStatementsData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetData: () => void;
  onSimulateExample: () => void;
  onAddEquityTransaction: (
    type: 'prive' | 'setor_modal',
    amount: number,
    memo: string,
    date: string
  ) => void;
}

export const Header: React.FC<HeaderProps> = ({
  financials,
  activeTab,
  setActiveTab,
  onResetData,
  onSimulateExample,
  onAddEquityTransaction,
}) => {
  const [isEquityModalOpen, setIsEquityModalOpen] = useState(false);
  const [equityType, setEquityType] = useState<'prive' | 'setor_modal'>('prive');
  const [equityAmount, setEquityAmount] = useState<number>(500000);
  const [equityMemo, setEquityMemo] = useState<string>('Keperluan Pribadi Pemilik');
  const [equityDate, setEquityDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [soundMuted, setSoundMutedState] = useState<boolean>(() => getSoundMuted());

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) {
      playTapSound();
    }
  };

  const tabs = [
    { id: 'pos', label: 'Kasir & POS', icon: '🛒' },
    { id: 'fifo', label: 'Gudang & Batch FIFO', icon: '📦' },
    { id: 'jurnal', label: 'Jurnal Umum (Double-Entry)', icon: '📑' },
    { id: 'bukubesar', label: 'Buku Besar & Akun T', icon: '📖' },
    { id: 'laporan', label: 'Laporan Keuangan SAK EMKM', icon: '📊' },
    { id: 'visualizer', label: 'Peta Alur Transaksi', icon: '🧭' },
    { id: 'pelanggan', label: 'Buku Pelanggan', icon: '👥' },
  ];

  const handleEquitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equityAmount <= 0) return;
    onAddEquityTransaction(equityType, equityAmount, equityMemo, equityDate);
    setIsEquityModalOpen(false);
  };

  return (
    <header className="bg-[#181512] text-stone-100 border-b border-[#2d2822] sticky top-0 z-30 shadow-lg">
      {/* Top Banner with Artisan Brand Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-stone-800/80">
          <div className="flex items-center gap-3.5">
            {/* Real Artisan Brand Emblem */}
            <div className="relative group shrink-0">
              <img
                src="/src/assets/images/sentosa_brand_crest_1792472442881.jpg"
                alt="Sentosa Artisan Crest"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/40 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#181512] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-serif-brand font-bold text-amber-50 tracking-wide">
                  SENTOSA ROASTERY &amp; MERCANTILE
                </span>
                <span className="text-[10px] text-amber-400 font-mono uppercase bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded tracking-wider">
                  ERP SAK EMKM
                </span>
                <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded tracking-wider">
                  FIFO Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2 flex-wrap font-sans">
                <span>Usaha Dagang &amp; Roastery Kopi Specialty</span>
                <span className="text-stone-600">·</span>
                <span>Est. 1998, Bandung</span>
                <span className="text-stone-600">·</span>
                <span className="text-amber-400/90 font-mono text-[10px]">Basis Biaya Tertua (FIFO)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Audio Feedback Button */}
            <button
              onClick={toggleSound}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                soundMuted
                  ? 'bg-stone-900 border-stone-700 text-stone-500 hover:text-stone-300'
                  : 'bg-amber-950/40 border-amber-700/50 text-amber-300 hover:bg-amber-900/50'
              }`}
              title={soundMuted ? 'Aktifkan Suara Kasir' : 'Bisukan Suara Kasir'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{soundMuted ? 'Mute' : 'Audio ON'}</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                setIsEquityModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200 bg-amber-950/60 border border-amber-600/50 rounded-lg hover:bg-amber-900/70 transition-colors shadow-2xs whitespace-nowrap"
              title="Catat penarikan prive pribadi atau setoran modal pemilik"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Prive / Modal</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                onSimulateExample();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-emerald-950/70 border border-emerald-600/60 rounded-lg hover:bg-emerald-900/80 transition-colors shadow-2xs whitespace-nowrap"
              title="Eksekusi otomatis alur 7 unit Kopi Arabika dari dokumen spesifikasi"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulasi Cepat (7 Kopi)</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                onResetData();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-300 bg-stone-900 border border-stone-700 rounded-lg hover:bg-stone-800 hover:text-white transition-colors whitespace-nowrap"
              title="Kembalikan data ke kondisi awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Real-time Financial KPI Ribbon with Artisan Dark Palette */}
        <div className="py-2.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5 items-center text-xs">
          <div className="flex items-center gap-2.5 bg-[#231f1a] p-2 rounded-lg border border-[#383129]">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-mono tracking-wider">Kas Toko (1-1000)</span>
              <span className="font-bold text-white font-mono tabular-nums text-xs sm:text-sm">
                {formatRupiah(financials.neraca.aset_lancar.kas)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#231f1a] p-2 rounded-lg border border-[#383129]">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-mono tracking-wider">Persediaan FIFO (1-3000)</span>
              <span className="font-bold text-amber-300 font-mono tabular-nums text-xs sm:text-sm">
                {formatRupiah(financials.neraca.aset_lancar.persediaan_barang_dagang)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#231f1a] p-2 rounded-lg border border-[#383129]">
            <div className="w-7 h-7 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-mono tracking-wider">Penjualan (4-1000)</span>
              <span className="font-bold text-white font-mono tabular-nums text-xs sm:text-sm">
                {formatRupiah(financials.laba_rugi.pendapatan_penjualan)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#231f1a] p-2 rounded-lg border border-[#383129]">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
              financials.laba_rugi.laba_bersih >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-mono tracking-wider">Laba Bersih</span>
              <span className={`font-bold font-mono tabular-nums text-xs sm:text-sm ${
                financials.laba_rugi.laba_bersih >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatRupiah(financials.laba_rugi.laba_bersih)}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-between lg:justify-end gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full lg:w-auto justify-center lg:justify-start ${
              financials.neraca.is_balanced
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/50 border-amber-500/50 text-amber-300'
            }`}>
              <Scale className="w-4 h-4 shrink-0 text-emerald-400" />
              <div className="text-[11px] leading-tight">
                <span className="font-mono block text-[9px] uppercase tracking-wider text-stone-400">Neraca Seimbang:</span>
                <span className="font-bold font-mono text-emerald-300">
                  {financials.neraca.is_balanced ? 'ASET = L + E ✓' : `Selisih ${formatRupiah(financials.neraca.selisih)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Active Indicator and Merchant Icons */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-stone-800/80 pt-1 pb-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTapSound();
                  setActiveTab(tab.id);
                }}
                className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 rounded-t-lg ${
                  isActive
                    ? 'border-amber-500 text-amber-200 font-semibold bg-[#26211c] shadow-xs'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal Owner Equity & Prive */}
      {isEquityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Transaksi Ekuitas Pemilik (Prive / Setor Modal)
                </h3>
              </div>
              <button
                onClick={() => setIsEquityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEquitySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Jenis Transaksi Pemilik:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEquityType('prive');
                      setEquityMemo('Keperluan Pribadi Pemilik');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      equityType === 'prive'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Penarikan Prive (Ambil Kas)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEquityType('setor_modal');
                      setEquityMemo('Setoran Modal Tambahan Usaha');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      equityType === 'setor_modal'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Setoran Modal Tambahan
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nominal Transaksi (Rp):
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={equityAmount}
                  onChange={e => setEquityAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tanggal Transaksi:
                </label>
                <input
                  type="date"
                  value={equityDate}
                  onChange={e => setEquityDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan / Memo:
                </label>
                <input
                  type="text"
                  value={equityMemo}
                  onChange={e => setEquityMemo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                <span className="font-semibold text-slate-900 block font-sans">Dampak Akuntansi:</span>
                {equityType === 'prive' ? (
                  <>
                    <div>(Dr) 3-3000 Prive Pemilik : {formatRupiah(equityAmount)}</div>
                    <div>(Cr) 1-1000 Kas : {formatRupiah(equityAmount)}</div>
                    <div className="text-amber-700 font-sans mt-1">Mengurangi Kas dan Mengurangi Ekuitas Akhir di Neraca.</div>
                  </>
                ) : (
                  <>
                    <div>(Dr) 1-1000 Kas : {formatRupiah(equityAmount)}</div>
                    <div>(Cr) 3-1000 Modal Pemilik : {formatRupiah(equityAmount)}</div>
                    <div className="text-emerald-700 font-sans mt-1">Menambah Kas dan Menambah Ekuitas Akhir di Neraca.</div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEquityModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  Simpan &amp; Posting Jurnal Ekuitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
