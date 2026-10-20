/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChartOfAccounts,
  JurnalUmum,
  JurnalDetail,
  BukuBesarEntry,
  FinancialStatementsData,
  Transaksi,
  PersediaanBatch,
} from '../types/erp';

/**
 * Membuat ayat jurnal otomatis untuk transaksi penjualan (Langkah 3)
 * Jurnal A: Pengakuan Pendapatan (Dr. Kas / Piutang, Cr. Penjualan)
 * Jurnal B: Pengakuan HPP & Pengurangan Persediaan (Dr. HPP, Cr. Persediaan)
 */
export function generateSaleJournals(
  transaksi: Transaksi,
  accounts: ChartOfAccounts[],
  nextJournalIdStart: number
): { journals: JurnalUmum[]; nextJournalId: number } {
  let journalIdCounter = nextJournalIdStart;

  const findAccount = (code: string) => {
    const acc = accounts.find(a => a.kode_akun === code);
    if (!acc) throw new Error(`Akun dengan kode ${code} tidak ditemukan.`);
    return acc;
  };

  const kasAcc = findAccount('1-1000');
  const piutangAcc = findAccount('1-2000');
  const persediaanAcc = findAccount('1-3000');
  const penjualanAcc = findAccount('4-1000');
  const hppAcc = findAccount('5-1000');

  const journals: JurnalUmum[] = [];

  // Jurnal A — Pengakuan Pendapatan
  const debitAccount = transaksi.metode_pembayaran === 'tunai' ? kasAcc : piutangAcc;
  const journalAId = journalIdCounter++;
  const journalANumber = `JU-SAL-${transaksi.nomor_invoice}`;

  const journalADetails: JurnalDetail[] = [
    {
      jurnal_detail_id: journalAId * 10 + 1,
      jurnal_id: journalAId,
      akun_id: debitAccount.akun_id,
      kode_akun: debitAccount.kode_akun,
      nama_akun: debitAccount.nama_akun,
      debit: transaksi.total_penjualan,
      kredit: 0,
    },
    {
      jurnal_detail_id: journalAId * 10 + 2,
      jurnal_id: journalAId,
      akun_id: penjualanAcc.akun_id,
      kode_akun: penjualanAcc.kode_akun,
      nama_akun: penjualanAcc.nama_akun,
      debit: 0,
      kredit: transaksi.total_penjualan,
    },
  ];

  journals.push({
    jurnal_id: journalAId,
    nomor_jurnal: journalANumber,
    tanggal_jurnal: transaksi.tanggal_transaksi,
    keterangan: `Penjualan ${transaksi.metode_pembayaran.toUpperCase()} - Inv: ${transaksi.nomor_invoice} (${transaksi.nama_pelanggan})`,
    transaksi_id: transaksi.transaksi_id,
    nomor_invoice: transaksi.nomor_invoice,
    tipe_jurnal: 'penjualan',
    details: journalADetails,
  });

  // Jurnal B — Pengakuan HPP & Pengurangan Persediaan
  if (transaksi.total_hpp > 0) {
    const journalBId = journalIdCounter++;
    const journalBNumber = `JU-HPP-${transaksi.nomor_invoice}`;

    const journalBDetails: JurnalDetail[] = [
      {
        jurnal_detail_id: journalBId * 10 + 1,
        jurnal_id: journalBId,
        akun_id: hppAcc.akun_id,
        kode_akun: hppAcc.kode_akun,
        nama_akun: hppAcc.nama_akun,
        debit: transaksi.total_hpp,
        kredit: 0,
      },
      {
        jurnal_detail_id: journalBId * 10 + 2,
        jurnal_id: journalBId,
        akun_id: persediaanAcc.akun_id,
        kode_akun: persediaanAcc.kode_akun,
        nama_akun: persediaanAcc.nama_akun,
        debit: 0,
        kredit: transaksi.total_hpp,
      },
    ];

    journals.push({
      jurnal_id: journalBId,
      nomor_jurnal: journalBNumber,
      tanggal_jurnal: transaksi.tanggal_transaksi,
      keterangan: `Pengakuan HPP Penjualan Inv: ${transaksi.nomor_invoice} (FIFO)`,
      transaksi_id: transaksi.transaksi_id,
      nomor_invoice: transaksi.nomor_invoice,
      tipe_jurnal: 'hpp',
      details: journalBDetails,
    });
  }

  return { journals, nextJournalId: journalIdCounter };
}

/**
 * Membuat jurnal pembelian persediaan / penambahan batch baru
 * Dr. Persediaan Barang Dagang (1-3000), Cr. Kas (1-1000) / Utang Usaha (2-1000)
 */
export function generatePurchaseJournal(
  batch: PersediaanBatch,
  productName: string,
  paymentMethod: 'tunai' | 'kredit',
  accounts: ChartOfAccounts[],
  nextJournalId: number
): { journal: JurnalUmum; nextJournalId: number } {
  const findAccount = (code: string) => {
    const acc = accounts.find(a => a.kode_akun === code);
    if (!acc) throw new Error(`Akun ${code} tidak ditemukan.`);
    return acc;
  };

  const persediaanAcc = findAccount('1-3000');
  const creditAccount = paymentMethod === 'tunai' ? findAccount('1-1000') : findAccount('2-1000');
  const totalPembelian = batch.kuantitas_awal * batch.harga_pokok_per_unit;

  const jId = nextJournalId;
  const journalNumber = `JU-BELI-${batch.kode_batch}`;

  const details: JurnalDetail[] = [
    {
      jurnal_detail_id: jId * 10 + 1,
      jurnal_id: jId,
      akun_id: persediaanAcc.akun_id,
      kode_akun: persediaanAcc.kode_akun,
      nama_akun: persediaanAcc.nama_akun,
      debit: totalPembelian,
      kredit: 0,
    },
    {
      jurnal_detail_id: jId * 10 + 2,
      jurnal_id: jId,
      akun_id: creditAccount.akun_id,
      kode_akun: creditAccount.kode_akun,
      nama_akun: creditAccount.nama_akun,
      debit: 0,
      kredit: totalPembelian,
    },
  ];

  const journal: JurnalUmum = {
    jurnal_id: jId,
    nomor_jurnal: journalNumber,
    tanggal_jurnal: batch.tanggal_masuk,
    keterangan: `Pembelian Persediaan Batch ${batch.kode_batch} - ${productName} (${batch.kuantitas_awal} unit @ Rp ${batch.harga_pokok_per_unit.toLocaleString('id-ID')})`,
    tipe_jurnal: 'pembelian',
    details,
  };

  return { journal, nextJournalId: nextJournalId + 1 };
}

/**
 * Membuat jurnal pencatatan beban operasional (misal: Beban Gaji, Listrik, Sewa)
 * Dr. Beban Terkait (6-xxxx), Cr. Kas (1-1000) atau Utang (2-1000)
 */
export function generateExpenseJournal(
  expenseAccountCode: string,
  amount: number,
  keterangan: string,
  tanggal: string,
  paymentMethod: 'kas' | 'utang',
  accounts: ChartOfAccounts[],
  nextJournalId: number
): { journal: JurnalUmum; nextJournalId: number } {
  const expenseAcc = accounts.find(a => a.kode_akun === expenseAccountCode);
  if (!expenseAcc) throw new Error(`Akun beban ${expenseAccountCode} tidak ditemukan.`);

  const creditAcc = paymentMethod === 'kas'
    ? accounts.find(a => a.kode_akun === '1-1000')!
    : accounts.find(a => a.kode_akun === '2-1000')!;

  const jId = nextJournalId;
  const journalNumber = `JU-EXP-${Date.now().toString().slice(-6)}`;

  const details: JurnalDetail[] = [
    {
      jurnal_detail_id: jId * 10 + 1,
      jurnal_id: jId,
      akun_id: expenseAcc.akun_id,
      kode_akun: expenseAcc.kode_akun,
      nama_akun: expenseAcc.nama_akun,
      debit: amount,
      kredit: 0,
    },
    {
      jurnal_detail_id: jId * 10 + 2,
      jurnal_id: jId,
      akun_id: creditAcc.akun_id,
      kode_akun: creditAcc.kode_akun,
      nama_akun: creditAcc.nama_akun,
      debit: 0,
      kredit: amount,
    },
  ];

  const journal: JurnalUmum = {
    jurnal_id: jId,
    nomor_jurnal: journalNumber,
    tanggal_jurnal: tanggal,
    keterangan: `Beban Operasional: ${keterangan}`,
    tipe_jurnal: 'beban',
    details,
  };

  return { journal, nextJournalId: nextJournalId + 1 };
}

/**
 * Membuat jurnal penarikan prive atau penyetoran modal pemilik
 * Prive: Dr. Prive (3-3000), Cr. Kas (1-1000)
 * Setor Modal: Dr. Kas (1-1000), Cr. Modal Pemilik (3-1000)
 */
export function generateEquityJournal(
  type: 'prive' | 'setor_modal',
  amount: number,
  memo: string,
  tanggal: string,
  accounts: ChartOfAccounts[],
  nextJournalId: number
): { journal: JurnalUmum; nextJournalId: number } {
  const kasAcc = accounts.find(a => a.kode_akun === '1-1000')!;
  const jId = nextJournalId;
  const journalNumber = `JU-${type === 'prive' ? 'PRV' : 'CAP'}-${Date.now().toString().slice(-6)}`;

  let details: JurnalDetail[] = [];

  if (type === 'prive') {
    const priveAcc = accounts.find(a => a.kode_akun === '3-3000')!;
    details = [
      {
        jurnal_detail_id: jId * 10 + 1,
        jurnal_id: jId,
        akun_id: priveAcc.akun_id,
        kode_akun: priveAcc.kode_akun,
        nama_akun: priveAcc.nama_akun,
        debit: amount,
        kredit: 0,
      },
      {
        jurnal_detail_id: jId * 10 + 2,
        jurnal_id: jId,
        akun_id: kasAcc.akun_id,
        kode_akun: kasAcc.kode_akun,
        nama_akun: kasAcc.nama_akun,
        debit: 0,
        kredit: amount,
      },
    ];
  } else {
    const modalAcc = accounts.find(a => a.kode_akun === '3-1000')!;
    details = [
      {
        jurnal_detail_id: jId * 10 + 1,
        jurnal_id: jId,
        akun_id: kasAcc.akun_id,
        kode_akun: kasAcc.kode_akun,
        nama_akun: kasAcc.nama_akun,
        debit: amount,
        kredit: 0,
      },
      {
        jurnal_detail_id: jId * 10 + 2,
        jurnal_id: jId,
        akun_id: modalAcc.akun_id,
        kode_akun: modalAcc.kode_akun,
        nama_akun: modalAcc.nama_akun,
        debit: 0,
        kredit: amount,
      },
    ];
  }

  const journal: JurnalUmum = {
    jurnal_id: jId,
    nomor_jurnal: journalNumber,
    tanggal_jurnal: tanggal,
    keterangan: type === 'prive' ? `Penarikan Prive Pemilik: ${memo}` : `Penyetoran Modal Pemilik: ${memo}`,
    tipe_jurnal: 'umum',
    details,
  };

  return { journal, nextJournalId: nextJournalId + 1 };
}

/**
 * Posting seluruh baris jurnal ke Buku Besar (General Ledger) (Langkah 4)
 * Menghitung saldo kumulatif kronologis per akun dengan mempertimbangkan saldo normal.
 */
export function postJournalsToLedger(
  journals: JurnalUmum[],
  accounts: ChartOfAccounts[]
): {
  ledgerEntries: BukuBesarEntry[];
  updatedAccounts: ChartOfAccounts[];
} {
  // Urutkan jurnal secara kronologis (tanggal ASC, lalu ID ASC)
  const sortedJournals = [...journals].sort((a, b) => {
    const timeA = new Date(a.tanggal_jurnal).getTime();
    const timeB = new Date(b.tanggal_jurnal).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.jurnal_id - b.jurnal_id;
  });

  const accountBalances: Record<string, number> = {};
  accounts.forEach(acc => {
    accountBalances[acc.kode_akun] = acc.saldo_awal || 0;
  });

  const ledgerEntries: BukuBesarEntry[] = [];
  let entryIdCounter = 1;

  for (const journal of sortedJournals) {
    for (const detail of journal.details) {
      const acc = accounts.find(a => a.kode_akun === detail.kode_akun);
      if (!acc) continue;

      let currentBal = accountBalances[acc.kode_akun] || 0;

      // Aturan saldo normal:
      // Akun bersaldo normal DEBIT (Aset, Beban, Prive): Saldo bertambah di Debit, berkurang di Kredit
      // Akun bersaldo normal KREDIT (Liabilitas, Ekuitas, Pendapatan): Saldo bertambah di Kredit, berkurang di Debit
      if (acc.saldo_normal === 'debit') {
        currentBal += detail.debit - detail.kredit;
      } else {
        currentBal += detail.kredit - detail.debit;
      }

      accountBalances[acc.kode_akun] = currentBal;

      ledgerEntries.push({
        buku_besar_id: entryIdCounter++,
        akun_id: acc.akun_id,
        kode_akun: acc.kode_akun,
        nama_akun: acc.nama_akun,
        jurnal_detail_id: detail.jurnal_detail_id,
        nomor_jurnal: journal.nomor_jurnal,
        tanggal_posting: journal.tanggal_jurnal,
        keterangan: journal.keterangan,
        debit: detail.debit,
        kredit: detail.kredit,
        saldo_kumulatif: currentBal,
      });
    }
  }

  // Update saldo berjalan di Chart of Accounts
  const updatedAccounts = accounts.map(acc => ({
    ...acc,
    saldo_berjalan: accountBalances[acc.kode_akun] ?? acc.saldo_awal,
  }));

  return { ledgerEntries, updatedAccounts };
}

/**
 * Menghitung 3 Laporan Keuangan Utama secara Real-Time (Langkah 5)
 * 1. Laporan Laba Rugi Komprehensif
 * 2. Laporan Perubahan Ekuitas
 * 3. Laporan Posisi Keuangan / Neraca
 */
export function calculateFinancialStatements(
  accounts: ChartOfAccounts[],
  initialBatchesValue: number = 0
): FinancialStatementsData {
  const getBal = (code: string) => {
    const acc = accounts.find(a => a.kode_akun === code);
    return acc ? acc.saldo_berjalan : 0;
  };

  // 1. Laporan Laba Rugi
  const penjualan = getBal('4-1000');
  const returPenjualan = getBal('4-2000');
  const penjualanBersih = penjualan - returPenjualan;
  const hpp = getBal('5-1000');
  const labaKotor = penjualanBersih - hpp;

  // Beban operasional (kode akun 6-xxxx)
  const expenseAccounts = accounts.filter(a => a.kategori === 'beban' && a.kode_akun.startsWith('6-'));
  const bebanOperasional = expenseAccounts.map(a => ({
    kode_akun: a.kode_akun,
    nama_akun: a.nama_akun,
    jumlah: a.saldo_berjalan,
  }));

  const totalBebanOperasional = bebanOperasional.reduce((sum, b) => sum + b.jumlah, 0);
  const labaBersih = labaKotor - totalBebanOperasional;

  // 2. Laporan Perubahan Ekuitas
  const modalAwalAccount = accounts.find(a => a.kode_akun === '3-1000');
  const modalAwal = modalAwalAccount ? modalAwalAccount.saldo_awal : 0;
  const prive = getBal('3-3000');
  const labaDitahan = getBal('3-2000');
  const modalAkhir = modalAwal + labaDitahan + labaBersih - prive;

  // 3. Laporan Posisi Keuangan (Neraca)
  const kas = getBal('1-1000');
  const piutangUsaha = getBal('1-2000');
  const persediaan = getBal('1-3000');
  const totalAsetLancar = kas + piutangUsaha + persediaan;
  const totalAset = totalAsetLancar;

  const utangUsaha = getBal('2-1000');
  const totalLiabilitas = utangUsaha;

  const totalEkuitas = modalAkhir;
  const totalLiabilitasDanEkuitas = totalLiabilitas + totalEkuitas;

  // Validasi Persamaan Akuntansi: Aset = Liabilitas + Ekuitas
  const selisih = Math.round((totalAset - totalLiabilitasDanEkuitas) * 100) / 100;
  const isBalanced = Math.abs(selisih) < 0.01;

  return {
    laba_rugi: {
      pendapatan_penjualan: penjualan,
      retur_penjualan: returPenjualan,
      penjualan_bersih: penjualanBersih,
      harga_pokok_penjualan: hpp,
      laba_kotor: labaKotor,
      beban_operasional: bebanOperasional,
      total_beban_operasional: totalBebanOperasional,
      laba_bersih: labaBersih,
    },
    perubahan_ekuitas: {
      modal_awal: modalAwal,
      laba_bersih: labaBersih,
      prive,
      modal_akhir: modalAkhir,
    },
    neraca: {
      aset_lancar: {
        kas,
        piutang_usaha: piutangUsaha,
        persediaan_barang_dagang: persediaan,
        total_aset_lancar: totalAsetLancar,
      },
      total_aset: totalAset,
      liabilitas_jangka_pendek: {
        utang_usaha: utangUsaha,
        total_liabilitas: totalLiabilitas,
      },
      ekuitas: {
        modal_pemilik: modalAwal,
        laba_ditahan: labaDitahan + labaBersih - prive,
        total_ekuitas: totalEkuitas,
      },
      total_liabilitas_dan_ekuitas: totalLiabilitasDanEkuitas,
      is_balanced: isBalanced,
      selisih,
    },
  };
}
