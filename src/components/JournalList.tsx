import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Filter,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Lightbulb,
  Building,
} from 'lucide-react';
import { JurnalUmum, ChartOfAccounts, TipeJurnal } from '../types/erp';
import { formatRupiah, formatTanggal } from '../utils/formatters';
import { playTapSound } from '../utils/soundEffects';

interface JournalListProps {
  journals: JurnalUmum[];
  accounts: ChartOfAccounts[];
  onAddExpense: (
    accountCode: string,
    amount: number,
    keterangan: string,
    tanggal: string,
    paymentMethod: 'kas' | 'utang'
  ) => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  journals,
  accounts,
  onAddExpense,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Expense form state
  const [expenseAccountCode, setExpenseAccountCode] = useState<string>('6-3000'); // Beban Utilitas by default
  const [expenseAmount, setExpenseAmount] = useState<number>(150000);
  const [expenseMemo, setExpenseMemo] = useState<string>('Biaya Listrik & Air Bulan Berjalan');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expensePayment, setExpensePayment] = useState<'kas' | 'utang'>('kas');

  const filteredJournals = [...journals]
    .filter(j => {
      if (filterType === 'all') return true;
      return j.tipe_jurnal === filterType;
    })
    .sort((a, b) => {
      const timeA = new Date(a.tanggal_jurnal).getTime();
      const timeB = new Date(b.tanggal_jurnal).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return b.jurnal_id - a.jurnal_id;
    });

  const totalDebit = journals.reduce(
    (sum, j) => sum + j.details.reduce((dSum, d) => dSum + d.debit, 0),
    0
  );
  const totalKredit = journals.reduce(
    (sum, j) => sum + j.details.reduce((kSum, d) => kSum + d.kredit, 0),
    0
  );
  const isAllBalanced = Math.abs(totalDebit - totalKredit) < 0.01;

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;
    onAddExpense(
      expenseAccountCode,
      expenseAmount,
      expenseMemo,
      expenseDate,
      expensePayment
    );
    setIsExpenseModalOpen(false);
  };

  const expenseAccounts = accounts.filter(a => a.kategori === 'beban' && a.kode_akun.startsWith('6-'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-serif-brand font-bold text-stone-900 tracking-tight">
              Jurnal Umum &amp; Pembukuan Ganda
            </h2>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-[11px] font-mono text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              Langkah 3 (Double-Entry Otomatis)
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Daftar seluruh ayat jurnal sistem (Jurnal Penjualan, Jurnal HPP FIFO, Jurnal Pembelian, &amp; Beban Operasional)
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            setIsExpenseModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-200 bg-[#181512] hover:bg-stone-800 rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Catat Beban Operasional</span>
        </button>
      </div>

      {/* Ribbon Balance Check */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block font-sans">
              Prinsip Keseimbangan Double-Entry Bookkeeping
            </span>
            <span className="text-xs text-slate-500 block">
              Setiap transaksi otomatis menghasilkan pasangan Debit &amp; Kredit yang seimbang.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs tabular-nums">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Debit:</span>
            <span className="font-bold text-slate-900 text-sm">{formatRupiah(totalDebit)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Kredit:</span>
            <span className="font-bold text-slate-900 text-sm">{formatRupiah(totalKredit)}</span>
          </div>
          <div className="pl-4 border-l border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Status Audit:</span>
            <span className={`font-bold ${isAllBalanced ? 'text-emerald-700' : 'text-red-700'}`}>
              {isAllBalanced ? '✅ SEIMBANG (0.00)' : '⚠️ TIDAK SEIMBANG'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Filter Jenis Jurnal:
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Semua Jurnal' },
              { id: 'penjualan', label: 'Jurnal Penjualan (Jurnal A)' },
              { id: 'hpp', label: 'Jurnal HPP (Jurnal B)' },
              { id: 'pembelian', label: 'Jurnal Pembelian Stok' },
              { id: 'beban', label: 'Beban Operasional' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterType === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Journals List */}
        {filteredJournals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <span>Belum ada ayat jurnal tercatat. Lakukan transaksi di Kasir atau catat beban operasional.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJournals.map(journal => {
              const jDebit = journal.details.reduce((sum, d) => sum + d.debit, 0);
              const jKredit = journal.details.reduce((sum, d) => sum + d.kredit, 0);
              const isBalanced = Math.abs(jDebit - jKredit) < 0.01;

              return (
                <div
                  key={journal.jurnal_id}
                  className="rounded-lg border border-slate-200 overflow-hidden bg-white"
                >
                  {/* Journal Header */}
                  <div className="bg-slate-50 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {journal.nomor_jurnal}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-mono">
                        {formatTanggal(journal.tanggal_jurnal)}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-sm capitalize ${
                          journal.tipe_jurnal === 'penjualan'
                            ? 'bg-blue-100 text-blue-800'
                            : journal.tipe_jurnal === 'hpp'
                            ? 'bg-purple-100 text-purple-800'
                            : journal.tipe_jurnal === 'pembelian'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {journal.tipe_jurnal}
                      </span>
                    </div>

                    <div className="text-slate-600 truncate max-w-md">
                      <span className="font-medium text-slate-800">{journal.keterangan}</span>
                    </div>
                  </div>

                  {/* Journal Lines Table */}
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 text-[11px]">
                        <th className="py-1.5 px-4">Kode &amp; Nama Akun</th>
                        <th className="py-1.5 px-4 text-right w-36">Debit (Dr)</th>
                        <th className="py-1.5 px-4 text-right w-36">Kredit (Cr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {journal.details.map(detail => {
                        const isCredit = detail.kredit > 0;
                        return (
                          <tr key={detail.jurnal_detail_id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4">
                              <div className={`flex items-center gap-2 ${isCredit ? 'pl-6' : ''}`}>
                                <span className="font-mono text-slate-500 text-[11px]">
                                  {detail.kode_akun}
                                </span>
                                <span className="font-medium text-slate-900">
                                  {detail.nama_akun}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-900">
                              {detail.debit > 0 ? formatRupiah(detail.debit) : '-'}
                            </td>
                            <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-900">
                              {detail.kredit > 0 ? formatRupiah(detail.kredit) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/60 font-mono text-[11px] font-semibold text-slate-700 border-t border-slate-200">
                        <td className="py-1.5 px-4 text-right">Total:</td>
                        <td className="py-1.5 px-4 text-right tabular-nums">{formatRupiah(jDebit)}</td>
                        <td className="py-1.5 px-4 text-right tabular-nums">{formatRupiah(jKredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Operating Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Catat Beban Operasional Usaha
                </h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Akun Beban:
                </label>
                <select
                  value={expenseAccountCode}
                  onChange={e => setExpenseAccountCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                >
                  {expenseAccounts.map(a => (
                    <option key={a.kode_akun} value={a.kode_akun}>
                      {a.kode_akun} - {a.nama_akun}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah Beban (Rp):
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Transaksi:
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Sumber Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpensePayment('kas')}
                    className={`py-1.5 px-3 rounded-md border text-center transition-colors ${
                      expensePayment === 'kas'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Kas (Kredit Kas 1-1000)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpensePayment('utang')}
                    className={`py-1.5 px-3 rounded-md border text-center transition-colors ${
                      expensePayment === 'utang'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Utang (Kredit Utang 2-1000)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan / Deskripsi:
                </label>
                <input
                  type="text"
                  value={expenseMemo}
                  onChange={e => setExpenseMemo(e.target.value)}
                  placeholder="Contoh: Pembayaran Token Listrik Toko"
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700">
                Otomatis posting:
                <br />
                (Dr) {expenseAccountCode} : {formatRupiah(expenseAmount)}
                <br />
                (Cr) {expensePayment === 'kas' ? '1-1000 Kas' : '2-1000 Utang Usaha'} : {formatRupiah(expenseAmount)}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Simpan &amp; Posting ke Buku Besar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
