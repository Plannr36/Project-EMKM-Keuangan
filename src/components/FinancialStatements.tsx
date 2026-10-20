/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Scale,
  TrendingUp,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';
import { FinancialStatementsData } from '../types/erp';
import { formatRupiah } from '../utils/formatters';

interface FinancialStatementsProps {
  financials: FinancialStatementsData;
}

export const FinancialStatements: React.FC<FinancialStatementsProps> = ({
  financials,
}) => {
  const [statementTab, setStatementTab] = useState<'all' | 'labarugi' | 'ekuitas' | 'neraca'>('all');

  const { laba_rugi, perubahan_ekuitas, neraca } = financials;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laporan Keuangan Real-Time UMKM
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
              Langkah 5
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Otomatis terbarui setiap kali ada transaksi kasir, perubahan stok FIFO, maupun pencatatan beban usaha
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs">
            <button
              onClick={() => setStatementTab('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statementTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua (3 Laporan)
            </button>
            <button
              onClick={() => setStatementTab('labarugi')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statementTab === 'labarugi'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laba Rugi
            </button>
            <button
              onClick={() => setStatementTab('ekuitas')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statementTab === 'ekuitas'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perubahan Ekuitas
            </button>
            <button
              onClick={() => setStatementTab('neraca')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statementTab === 'neraca'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Neraca (Posisi Keuangan)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Cetak Laporan Keuangan"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Accounting Equation Equilibrium Banner */}
      <div className={`p-4 rounded-xl border shadow-xs transition-all ${
        neraca.is_balanced
          ? 'bg-emerald-50/80 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              neraca.is_balanced ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Persamaan Dasar Akuntansi:
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                  ASET = LIABILITAS + EKUITAS
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {neraca.is_balanced
                  ? '✅ Keseimbangan Neraca Terverifikasi Sempurna. Selisih = Rp 0.'
                  : `⚠️ Terdapat selisih pembukuan sebesar ${formatRupiah(neraca.selisih)}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div className="text-center sm:text-right">
              <span className="text-slate-500 text-[11px] block">Total Aset</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatRupiah(neraca.total_aset)}
              </span>
            </div>
            <div className="font-bold text-slate-400 text-base">=</div>
            <div className="text-center sm:text-right">
              <span className="text-slate-500 text-[11px] block">Liabilitas + Ekuitas</span>
              <span className="font-bold text-indigo-900 text-sm">
                {formatRupiah(neraca.total_liabilitas_dan_ekuitas)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* A. Laporan Laba Rugi Komprehensif (Statement of Comprehensive Income) */}
        {(statementTab === 'all' || statementTab === 'labarugi') && (
          <div className={`${statementTab === 'all' ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4`}>
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                  Bagian 5.A
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Laporan Laba Rugi Komprehensif
                </h3>
                <span className="text-xs text-slate-500">
                  Statement of Comprehensive Income
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Laba Bersih</span>
                <span className={`text-base font-bold font-mono tabular-nums ${
                  laba_rugi.laba_bersih >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {formatRupiah(laba_rugi.laba_bersih)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Pendapatan Penjualan */}
              <div className="flex justify-between py-1 text-slate-700">
                <span>Pendapatan Penjualan (4-1000)</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatRupiah(laba_rugi.pendapatan_penjualan)}
                </span>
              </div>

              {laba_rugi.retur_penjualan > 0 && (
                <div className="flex justify-between py-1 text-slate-600 pl-4">
                  <span>(-) Retur Penjualan (4-2000)</span>
                  <span className="font-mono tabular-nums text-red-600">
                    ({formatRupiah(laba_rugi.retur_penjualan)})
                  </span>
                </div>
              )}

              {/* HPP */}
              <div className="flex justify-between py-1 text-slate-700">
                <span>(-) Harga Pokok Penjualan (5-1000, FIFO)</span>
                <span className="font-mono tabular-nums text-red-700 font-medium">
                  ({formatRupiah(laba_rugi.harga_pokok_penjualan)})
                </span>
              </div>

              {/* Laba Kotor */}
              <div className="flex justify-between py-2 border-t border-b border-slate-200 font-semibold text-slate-900 bg-slate-50/70 px-2 rounded">
                <span>= Laba Kotor (Gross Profit)</span>
                <span className="font-mono tabular-nums text-indigo-700">
                  {formatRupiah(laba_rugi.laba_kotor)}
                </span>
              </div>

              {/* Beban Operasional */}
              <div className="pt-2">
                <span className="font-semibold text-slate-800 block mb-1">
                  (-) Beban Operasional Usaha:
                </span>
                <div className="space-y-1 pl-3 text-slate-600">
                  {laba_rugi.beban_operasional.map(b => (
                    <div key={b.kode_akun} className="flex justify-between py-0.5">
                      <span>{b.nama_akun} ({b.kode_akun})</span>
                      <span className="font-mono tabular-nums">
                        {formatRupiah(b.jumlah)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-slate-100 text-slate-700 font-medium">
                    <span>Total Beban Operasional</span>
                    <span className="font-mono tabular-nums text-red-700">
                      ({formatRupiah(laba_rugi.total_beban_operasional)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Laba Bersih */}
              <div className="mt-4 pt-3 border-t-2 border-slate-900 flex justify-between font-bold text-sm bg-slate-900 text-white p-3 rounded-lg">
                <span>= Laba Bersih Periode Berjalan</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  {formatRupiah(laba_rugi.laba_bersih)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* B. Laporan Perubahan Ekuitas (Statement of Changes in Equity) */}
        {(statementTab === 'all' || statementTab === 'ekuitas') && (
          <div className={`${statementTab === 'all' ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4`}>
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                  Bagian 5.B
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Laporan Perubahan Ekuitas
                </h3>
                <span className="text-xs text-slate-500">
                  Statement of Changes in Equity
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Modal Akhir</span>
                <span className="text-base font-bold font-mono text-indigo-900 tabular-nums">
                  {formatRupiah(perubahan_ekuitas.modal_akhir)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 text-slate-700">
                <span>Modal Awal Pemilik (3-1000)</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatRupiah(perubahan_ekuitas.modal_awal)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 text-slate-700 bg-emerald-50/50 px-2 rounded">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>(+) Laba Bersih Periode Berjalan (dari Laba Rugi)</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  + {formatRupiah(perubahan_ekuitas.laba_bersih)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 text-slate-700">
                <span>(-) Penarikan Prive Pemilik (3-3000)</span>
                <span className="font-mono tabular-nums text-red-600">
                  ({formatRupiah(perubahan_ekuitas.prive)})
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Prinsip Aliran Ekuitas:</div>
                <p>
                  Setiap laba kotor dari transaksi penjualan dikurangi beban usaha mengalir langsung menambah modal pemilik, sehingga laba tidak pernah &quot;hilang&quot; dari pembukuan.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-indigo-900 flex justify-between font-bold text-sm bg-indigo-900 text-white p-3 rounded-lg">
                <span>= Modal Akhir Pemilik</span>
                <span className="font-mono tabular-nums text-indigo-200">
                  {formatRupiah(perubahan_ekuitas.modal_akhir)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* C. Laporan Posisi Keuangan / Neraca (Statement of Financial Position) */}
        {(statementTab === 'all' || statementTab === 'neraca') && (
          <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                  Bagian 5.C
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Laporan Posisi Keuangan (Neraca)
                </h3>
                <span className="text-xs text-slate-500">
                  Statement of Financial Position — Real-Time T-Balance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Neraca Seimbang (Persamaan Akuntansi Terpenuhi)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Sisi Kiri: ASET */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    ASET (HARTA)
                  </h4>
                  <span className="font-mono text-[11px] text-slate-500">Saldo Normal: DEBIT</span>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-800 text-[11px]">Aset Lancar:</div>
                  <div className="space-y-1.5 pl-3">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span>Kas di Tangan / Bank (1-1000)</span>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatRupiah(neraca.aset_lancar.kas)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span>Piutang Usaha Pelanggan (1-2000)</span>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatRupiah(neraca.aset_lancar.piutang_usaha)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <div>
                        <span>Persediaan Barang Dagang (1-3000)</span>
                        <span className="text-[10px] text-slate-500 block">Metode FIFO Sisa Batch</span>
                      </div>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatRupiah(neraca.aset_lancar.persediaan_barang_dagang)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>TOTAL ASET</span>
                  <span className="font-mono text-indigo-700 tabular-nums">
                    {formatRupiah(neraca.total_aset)}
                  </span>
                </div>
              </div>

              {/* Sisi Kanan: LIABILITAS & EKUITAS */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    LIABILITAS &amp; EKUITAS
                  </h4>
                  <span className="font-mono text-[11px] text-slate-500">Saldo Normal: KREDIT</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-slate-800 text-[11px] mb-1">Liabilitas Jangka Pendek:</div>
                    <div className="pl-3">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span>Utang Usaha Supplier (2-1000)</span>
                        <span className="font-mono font-medium text-slate-900 tabular-nums">
                          {formatRupiah(neraca.liabilitas_jangka_pendek.utang_usaha)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-800 text-[11px] mb-1">Ekuitas Pemilik:</div>
                    <div className="space-y-1.5 pl-3">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span>Modal Awal Pemilik (3-1000)</span>
                        <span className="font-mono font-medium text-slate-900 tabular-nums">
                          {formatRupiah(neraca.ekuitas.modal_pemilik)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <div>
                          <span>Laba Berjalan / Ditahan</span>
                          <span className="text-[10px] text-slate-500 block">Akumulasi Laba Bersih</span>
                        </div>
                        <span className={`font-mono font-medium tabular-nums ${
                          neraca.ekuitas.laba_ditahan >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {formatRupiah(neraca.ekuitas.laba_ditahan)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                  <span>TOTAL LIABILITAS &amp; EKUITAS</span>
                  <span className="font-mono text-indigo-700 tabular-nums">
                    {formatRupiah(neraca.total_liabilitas_dan_ekuitas)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
