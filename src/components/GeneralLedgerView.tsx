/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
} from 'lucide-react';
import { ChartOfAccounts, BukuBesarEntry } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';
import { playTapSound } from '../utils/soundEffects';

interface GeneralLedgerViewProps {
  accounts: ChartOfAccounts[];
  ledgerEntries: BukuBesarEntry[];
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  accounts,
  ledgerEntries,
}) => {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('1-1000'); // Default: 1-1000 Kas
  const [viewMode, setViewMode] = useState<'table' | 'taccount'>('table');

  const currentAccount = accounts.find(a => a.kode_akun === selectedAccountCode) || accounts[0];

  // Filter entries for the selected account
  const accountEntries = ledgerEntries.filter(
    e => e.kode_akun === selectedAccountCode
  );

  const totalMutasiDebit = accountEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalMutasiKredit = accountEntries.reduce((sum, e) => sum + e.kredit, 0);

  // Group accounts by category for the selector
  const categories = ['aset', 'liabilitas', 'ekuitas', 'pendapatan', 'beban'] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-serif-brand font-bold text-stone-900 tracking-tight">
              Buku Besar &amp; Akun T (General Ledger)
            </h2>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-[11px] font-mono text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              Langkah 4: Posting Saldo Kumulatif
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Riwayat posting kronologis ganda, mutasi debit/kredit, dan visualisasi Akun T berstandar akuntansi
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => {
              playTapSound();
              setViewMode('table');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            📋 Tabel Kronologis
          </button>
          <button
            onClick={() => {
              playTapSound();
              setViewMode('taccount');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'taccount' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            ⚖️ Visual Akun T (Dr/Cr)
          </button>
        </div>
      </div>

      {/* Account Selector Cards */}
      <div className="bg-[#fffdfa] rounded-2xl border border-[#e8e2d8] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-700" />
            <span>Pilih Akun Buku Besar:</span>
          </label>
          <span className="text-xs text-stone-500 font-mono">
            {accounts.length} Akun Standar SAK EMKM
          </span>
        </div>

        {/* Quick Account Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {accounts.map(acc => {
            const isSelected = acc.kode_akun === selectedAccountCode;
            const entriesCount = ledgerEntries.filter(e => e.kode_akun === acc.kode_akun).length;

            return (
              <button
                key={acc.kode_akun}
                onClick={() => {
                  playTapSound();
                  setSelectedAccountCode(acc.kode_akun);
                }}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#181512] text-amber-200 font-bold shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">{acc.kode_akun}</span>
                <span>{acc.nama_akun}</span>
                {entriesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-amber-400 text-stone-900 font-bold' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {entriesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Account Profile & KPI Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              {currentAccount.kode_akun}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                {currentAccount.nama_akun}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="capitalize">Kategori: {currentAccount.kategori}</span>
                <span>·</span>
                <span className="uppercase font-mono">
                  Saldo Normal: {currentAccount.saldo_normal}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Saldo Awal</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatRupiah(currentAccount.saldo_awal)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Mutasi Debit</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                + {formatRupiah(totalMutasiDebit)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Mutasi Kredit</span>
              <span className="font-bold text-amber-700 tabular-nums">
                - {formatRupiah(totalMutasiKredit)}
              </span>
            </div>
            <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
              <span className="text-amber-900 block text-[10px] font-sans font-bold uppercase tracking-wider">
                Saldo Akhir Berjalan
              </span>
              <span className="font-bold text-slate-900 tabular-nums text-sm">
                {formatRupiah(currentAccount.saldo_berjalan)}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode: Chronological Table OR Visual T-Account */}
        {viewMode === 'table' ? (
          /* Ledger Entries Table */
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                  <th className="py-2.5 px-3">Tanggal Posting</th>
                  <th className="py-2.5 px-3">No. Jurnal</th>
                  <th className="py-2.5 px-3">Keterangan Transaksi</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2.5 px-3 text-right">Kredit (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Saldo Kumulatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {/* Row for Saldo Awal */}
                <tr className="bg-stone-50/60 text-stone-500 italic">
                  <td className="py-2.5 px-3 font-mono">-</td>
                  <td className="py-2.5 px-3 font-mono">SALDO-AWAL</td>
                  <td className="py-2.5 px-3">Saldo Pembukaan Akun</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">-</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">-</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-800 tabular-nums">
                    {formatRupiah(currentAccount.saldo_awal)}
                  </td>
                </tr>

                {accountEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      Belum ada mutasi posting transaksi untuk akun ini.
                    </td>
                  </tr>
                ) : (
                  accountEntries.map(entry => (
                    <tr key={entry.buku_besar_id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-stone-600">
                        {formatTanggal(entry.tanggal_posting)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-amber-900">
                        {entry.nomor_jurnal}
                      </td>
                      <td className="py-2.5 px-3 text-stone-800">
                        {entry.keterangan}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-900">
                        {entry.debit > 0 ? (
                          <span className="text-emerald-700 font-medium">
                            {formatRupiah(entry.debit)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-900">
                        {entry.kredit > 0 ? (
                          <span className="text-amber-800 font-medium">
                            {formatRupiah(entry.kredit)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900 tabular-nums">
                        {formatRupiah(entry.saldo_kumulatif)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-stone-100/70 font-semibold text-stone-900 border-t border-stone-200">
                  <td colSpan={3} className="py-2.5 px-3 text-right font-sans">
                    Total Mutasi &amp; Saldo Akhir:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                    {formatRupiah(totalMutasiDebit)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-800 tabular-nums">
                    {formatRupiah(totalMutasiKredit)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-950 tabular-nums">
                    {formatRupiah(currentAccount.saldo_berjalan)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          /* Visual Classic T-Account (Akun T) */
          <div className="mt-5 space-y-4">
            <div className="text-center pb-2 border-b-2 border-stone-900">
              <span className="text-xs font-mono text-stone-400 uppercase tracking-widest block">Akun Buku Besar Standar (Akun T)</span>
              <h4 className="text-lg font-bold text-stone-900 font-serif-brand">
                {currentAccount.kode_akun} — {currentAccount.nama_akun}
              </h4>
            </div>

            {/* The T Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-stone-900 text-xs font-mono">
              {/* Left Column: DEBET */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider">DEBET (Dr)</span>
                  <span className="text-[10px] text-stone-400 font-sans">Masuk / Bertambah</span>
                </div>

                {/* Saldo Awal if debit */}
                {currentAccount.saldo_normal === 'debit' && currentAccount.saldo_awal > 0 && (
                  <div className="flex justify-between py-1 px-2 rounded bg-stone-50 border border-stone-200 text-stone-600 italic">
                    <span>Saldo Pembukaan:</span>
                    <span className="font-bold text-stone-800">{formatRupiah(currentAccount.saldo_awal)}</span>
                  </div>
                )}

                {/* Debit Postings */}
                <div className="space-y-1.5 min-h-[120px]">
                  {accountEntries.filter(e => e.debit > 0).length === 0 ? (
                    <div className="text-stone-400 text-center py-8 italic font-sans text-xs">
                      Tidak ada posting debit.
                    </div>
                  ) : (
                    accountEntries
                      .filter(e => e.debit > 0)
                      .map(e => (
                        <div key={e.buku_besar_id} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-stone-900">{e.nomor_jurnal}</div>
                            <div className="text-[10px] text-stone-500 font-sans">{e.keterangan}</div>
                            <div className="text-[9px] text-stone-400">{e.tanggal_posting}</div>
                          </div>
                          <span className="font-bold text-emerald-800 tabular-nums">
                            {formatRupiah(e.debit)}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-3 border-t-2 border-stone-300 flex justify-between font-bold text-emerald-900">
                  <span>Total Debit:</span>
                  <span className="tabular-nums">
                    {formatRupiah(totalMutasiDebit + (currentAccount.saldo_normal === 'debit' ? currentAccount.saldo_awal : 0))}
                  </span>
                </div>
              </div>

              {/* Right Column: KREDIT */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <span className="font-bold text-amber-800 uppercase tracking-wider">KREDIT (Cr)</span>
                  <span className="text-[10px] text-stone-400 font-sans">Keluar / Berkurang</span>
                </div>

                {/* Saldo Awal if credit */}
                {currentAccount.saldo_normal === 'kredit' && currentAccount.saldo_awal > 0 && (
                  <div className="flex justify-between py-1 px-2 rounded bg-stone-50 border border-stone-200 text-stone-600 italic">
                    <span>Saldo Pembukaan:</span>
                    <span className="font-bold text-stone-800">{formatRupiah(currentAccount.saldo_awal)}</span>
                  </div>
                )}

                {/* Credit Postings */}
                <div className="space-y-1.5 min-h-[120px]">
                  {accountEntries.filter(e => e.kredit > 0).length === 0 ? (
                    <div className="text-stone-400 text-center py-8 italic font-sans text-xs">
                      Tidak ada posting kredit.
                    </div>
                  ) : (
                    accountEntries
                      .filter(e => e.kredit > 0)
                      .map(e => (
                        <div key={e.buku_besar_id} className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-stone-900">{e.nomor_jurnal}</div>
                            <div className="text-[10px] text-stone-500 font-sans">{e.keterangan}</div>
                            <div className="text-[9px] text-stone-400">{e.tanggal_posting}</div>
                          </div>
                          <span className="font-bold text-amber-800 tabular-nums">
                            {formatRupiah(e.kredit)}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-3 border-t-2 border-stone-300 flex justify-between font-bold text-amber-900">
                  <span>Total Kredit:</span>
                  <span className="tabular-nums">
                    {formatRupiah(totalMutasiKredit + (currentAccount.saldo_normal === 'kredit' ? currentAccount.saldo_awal : 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Balance Card */}
            <div className="p-4 rounded-2xl bg-[#181512] text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">Saldo Akhir Akun Berjalan (Closing Balance)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatRupiah(currentAccount.saldo_berjalan)}
                </span>
              </div>
              <div className="text-xs font-mono text-stone-300 flex items-center gap-2">
                <span className="bg-amber-950/80 border border-amber-600/40 px-2.5 py-1 rounded-lg">
                  Posisi Normal: <strong className="text-amber-400 uppercase">{currentAccount.saldo_normal}</strong>
                </span>
                <span className="text-emerald-400 font-sans font-semibold">✓ Terverifikasi SAK EMKM</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
