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

interface GeneralLedgerViewProps {
  accounts: ChartOfAccounts[];
  ledgerEntries: BukuBesarEntry[];
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  accounts,
  ledgerEntries,
}) => {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('1-1000'); // Default: 1-1000 Kas
  const [searchTerm, setSearchTerm] = useState<string>('');

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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Buku Besar &amp; Posting Akun (General Ledger)
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
              Langkah 4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat posting kronologis dan mutasi saldo kumulatif per akun (Running Balance)
          </p>
        </div>
      </div>

      {/* Account Selector Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pilih Akun Buku Besar:</span>
          </label>
          <span className="text-xs text-slate-500">
            {accounts.length} Akun Standar UMKM
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
                onClick={() => setSelectedAccountCode(acc.kode_akun)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">{acc.kode_akun}</span>
                <span>{acc.nama_akun}</span>
                {entriesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
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
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-sm">
              {currentAccount.kode_akun}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
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
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Saldo Awal</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatRupiah(currentAccount.saldo_awal)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Total Mutasi Debit</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                + {formatRupiah(totalMutasiDebit)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Total Mutasi Kredit</span>
              <span className="font-semibold text-amber-700 tabular-nums">
                - {formatRupiah(totalMutasiKredit)}
              </span>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
              <span className="text-indigo-600 block text-[10px] font-sans font-semibold">
                Saldo Akhir Berjalan
              </span>
              <span className="font-bold text-indigo-900 tabular-nums text-sm">
                {formatRupiah(currentAccount.saldo_berjalan)}
              </span>
            </div>
          </div>
        </div>

        {/* Ledger Entries Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Tanggal Posting</th>
                <th className="py-2.5 px-3">No. Jurnal</th>
                <th className="py-2.5 px-3">Keterangan Transaksi</th>
                <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                <th className="py-2.5 px-3 text-right">Kredit (Cr)</th>
                <th className="py-2.5 px-3 text-right">Saldo Kumulatif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row for Saldo Awal */}
              <tr className="bg-slate-50/40 text-slate-500 italic">
                <td className="py-2.5 px-3 font-mono">-</td>
                <td className="py-2.5 px-3 font-mono">SALDO-AWAL</td>
                <td className="py-2.5 px-3">Saldo Pembukaan Akun</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">-</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">-</td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                  {formatRupiah(currentAccount.saldo_awal)}
                </td>
              </tr>

              {accountEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada mutasi posting transaksi untuk akun ini.
                  </td>
                </tr>
              ) : (
                accountEntries.map(entry => (
                  <tr key={entry.buku_besar_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {formatTanggal(entry.tanggal_posting)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                      {entry.nomor_jurnal}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      {entry.keterangan}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      {entry.debit > 0 ? (
                        <span className="text-emerald-700 font-medium">
                          {formatRupiah(entry.debit)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      {entry.kredit > 0 ? (
                        <span className="text-amber-700 font-medium">
                          {formatRupiah(entry.kredit)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatRupiah(entry.saldo_kumulatif)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/70 font-semibold text-slate-900 border-t border-slate-200">
                <td colSpan={3} className="py-2.5 px-3 text-right font-sans">
                  Total Mutasi &amp; Saldo Akhir:
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                  {formatRupiah(totalMutasiDebit)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-amber-700 tabular-nums">
                  {formatRupiah(totalMutasiKredit)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-900 tabular-nums">
                  {formatRupiah(currentAccount.saldo_berjalan)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
