/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PosCheckout } from './components/PosCheckout';
import { InventoryBatches } from './components/InventoryBatches';
import { JournalList } from './components/JournalList';
import { GeneralLedgerView } from './components/GeneralLedgerView';
import { FinancialStatements } from './components/FinancialStatements';
import { ProcessVisualizer } from './components/ProcessVisualizer';
import { CustomersView } from './components/CustomersView';

import {
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_CUSTOMERS,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNALS,
  INITIAL_TRANSACTIONS,
} from './data/seedData';

import {
  Produk,
  PersediaanBatch,
  Pelanggan,
  ChartOfAccounts,
  JurnalUmum,
  Transaksi,
  TransaksiDetail,
  KonsumsiBatch,
} from './types/erp';

import { calculateFifoConsumption } from './utils/fifoEngine';
import {
  generateSaleJournals,
  generatePurchaseJournal,
  generateExpenseJournal,
  postJournalsToLedger,
  calculateFinancialStatements,
} from './utils/accountingEngine';

const STORAGE_KEY = 'mini_erp_umkm_state_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pos');

  // Core application states
  const [products, setProducts] = useState<Produk[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [batches, setBatches] = useState<PersediaanBatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_batches`);
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [customers, setCustomers] = useState<Pelanggan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [accounts, setAccounts] = useState<ChartOfAccounts[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [journals, setJournals] = useState<JurnalUmum[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_journals`);
    return saved ? JSON.parse(saved) : INITIAL_JOURNALS;
  });

  const [transactions, setTransactions] = useState<Transaksi[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_KEY}_batches`, JSON.stringify(batches));
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    localStorage.setItem(`${STORAGE_KEY}_journals`, JSON.stringify(journals));
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [products, batches, customers, accounts, journals, transactions]);

  // Compute General Ledger posting and running balances dynamically
  const { ledgerEntries, updatedAccounts } = useMemo(() => {
    return postJournalsToLedger(journals, accounts);
  }, [journals, accounts]);

  // Compute Financial Statements dynamically
  const financialStatements = useMemo(() => {
    return calculateFinancialStatements(updatedAccounts);
  }, [updatedAccounts]);

  // Handle Checkout (Langkah 1 & 2 & 3)
  const handleProcessCheckout = (
    customerId: number,
    paymentMethod: 'tunai' | 'kredit',
    cart: Array<{ produk: Produk; kuantitas: number }>
  ) => {
    const customer = customers.find(c => c.pelanggan_id === customerId) || customers[0];
    const txId = transactions.length + 1;
    const invNumber = `INV-2026-${String(txId).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    let currentBatches = [...batches];
    const txDetails: TransaksiDetail[] = [];
    let grandTotalPenjualan = 0;
    let grandTotalHpp = 0;

    let detailIdCounter = txId * 100;
    let konsumsiIdCounter = txId * 1000;

    for (const item of cart) {
      const productBatches = currentBatches.filter(b => b.produk_id === item.produk.produk_id);
      const fifoRes = calculateFifoConsumption(productBatches, item.kuantitas);

      if (!fifoRes.success) {
        return {
          success: false,
          error: `Gagal memproses item ${item.produk.nama_produk}: ${fifoRes.error}`,
        };
      }

      // Update the batches with remaining stock
      currentBatches = currentBatches.map(b => {
        if (b.produk_id !== item.produk.produk_id) return b;
        const updated = fifoRes.updated_batches.find(ub => ub.batch_id === b.batch_id);
        return updated || b;
      });

      const subtotalJual = item.kuantitas * item.produk.harga_jual;
      grandTotalPenjualan += subtotalJual;
      grandTotalHpp += fifoRes.total_hpp;

      const konsumsiItems: KonsumsiBatch[] = fifoRes.consumed.map(c => ({
        konsumsi_id: konsumsiIdCounter++,
        detail_id: detailIdCounter,
        batch_id: c.batch_id,
        kode_batch: c.kode_batch,
        kuantitas_diambil: c.kuantitas_diambil,
        harga_pokok_per_unit: c.harga_pokok_per_unit,
        subtotal_hpp: c.subtotal_hpp,
      }));

      txDetails.push({
        detail_id: detailIdCounter++,
        transaksi_id: txId,
        produk_id: item.produk.produk_id,
        kode_produk: item.produk.kode_produk,
        nama_produk: item.produk.nama_produk,
        kuantitas: item.kuantitas,
        harga_jual_satuan: item.produk.harga_jual,
        subtotal_jual: subtotalJual,
        hpp_satuan_rata: fifoRes.hpp_satuan_rata,
        subtotal_hpp: fifoRes.total_hpp,
        konsumsi_batch: konsumsiItems,
      });
    }

    const newTransaction: Transaksi = {
      transaksi_id: txId,
      nomor_invoice: invNumber,
      pelanggan_id: customer.pelanggan_id,
      nama_pelanggan: customer.nama,
      tanggal_transaksi: today,
      metode_pembayaran: paymentMethod,
      total_penjualan: grandTotalPenjualan,
      total_hpp: grandTotalHpp,
      laba_kotor: grandTotalPenjualan - grandTotalHpp,
      status: 'selesai',
      items: txDetails,
    };

    // Langkah 3: Buat Jurnal Umum Otomatis
    const nextJId = journals.length > 0 ? Math.max(...journals.map(j => j.jurnal_id)) + 1 : 1;
    const { journals: newJournals } = generateSaleJournals(
      newTransaction,
      updatedAccounts,
      nextJId
    );

    // Update aggregate product stock
    const updatedProducts = products.map(p => {
      const itemInCart = cart.find(i => i.produk.produk_id === p.produk_id);
      if (!itemInCart) return p;
      return {
        ...p,
        stok_total: Math.max(0, p.stok_total - itemInCart.kuantitas),
      };
    });

    setBatches(currentBatches);
    setProducts(updatedProducts);
    setTransactions([newTransaction, ...transactions]);
    setJournals([...journals, ...newJournals]);

    return {
      success: true,
      transaksi: newTransaction,
    };
  };

  // Handle Adding Incoming Stock Batch (Pembelian Persediaan)
  const handleAddBatch = (
    productId: number,
    kodeBatch: string,
    tanggalMasuk: string,
    qty: number,
    costPerUnit: number,
    paymentMethod: 'tunai' | 'kredit',
    keterangan?: string
  ) => {
    const product = products.find(p => p.produk_id === productId);
    if (!product) return;

    const newBatchId = batches.length > 0 ? Math.max(...batches.map(b => b.batch_id)) + 1 : 1;

    const newBatch: PersediaanBatch = {
      batch_id: newBatchId,
      kode_batch: kodeBatch,
      produk_id: productId,
      tanggal_masuk: tanggalMasuk,
      kuantitas_awal: qty,
      kuantitas_sisa: qty,
      harga_pokok_per_unit: costPerUnit,
      keterangan: keterangan || `Penerimaan Supplier - ${product.nama_produk}`,
    };

    // Buat jurnal pembelian persediaan: Dr. Persediaan (1-3000), Cr. Kas (1-1000) / Utang (2-1000)
    const nextJId = journals.length > 0 ? Math.max(...journals.map(j => j.jurnal_id)) + 1 : 1;
    const { journal: purchaseJournal } = generatePurchaseJournal(
      newBatch,
      product.nama_produk,
      paymentMethod,
      updatedAccounts,
      nextJId
    );

    const updatedBatchesList = [...batches, newBatch];
    const updatedProductsList = products.map(p => {
      if (p.produk_id !== productId) return p;
      return { ...p, stok_total: p.stok_total + qty };
    });

    setBatches(updatedBatchesList);
    setProducts(updatedProductsList);
    setJournals([...journals, purchaseJournal]);
  };

  // Handle Adding Master Product
  const handleAddProduct = (
    kodeProduk: string,
    namaProduk: string,
    kategori: string,
    hargaJual: number,
    satuan: string,
    deskripsi?: string
  ) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.produk_id)) + 1 : 101;
    const newProduct: Produk = {
      produk_id: newId,
      kode_produk: kodeProduk,
      nama_produk: namaProduk,
      kategori,
      harga_jual: hargaJual,
      satuan,
      stok_total: 0,
      deskripsi: deskripsi || '-',
    };

    setProducts([...products, newProduct]);
  };

  // Handle Adding Operating Expense
  const handleAddExpense = (
    accountCode: string,
    amount: number,
    memo: string,
    tanggal: string,
    paymentMethod: 'kas' | 'utang'
  ) => {
    const nextJId = journals.length > 0 ? Math.max(...journals.map(j => j.jurnal_id)) + 1 : 1;
    const { journal: expenseJournal } = generateExpenseJournal(
      accountCode,
      amount,
      memo,
      tanggal,
      paymentMethod,
      updatedAccounts,
      nextJId
    );

    setJournals([...journals, expenseJournal]);
  };

  // Handle Adding Customer
  const handleAddCustomer = (nama: string, telepon: string, alamat: string) => {
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.pelanggan_id)) + 1 : 1;
    const newCust: Pelanggan = {
      pelanggan_id: newId,
      kode_pelanggan: `CUST-00${newId}`,
      nama,
      telepon,
      alamat,
      created_at: new Date().toISOString().split('T')[0],
    };
    setCustomers([...customers, newCust]);
  };

  // Reset to initial clean state
  const handleResetData = () => {
    if (window.confirm('Reset data sistem ke kondisi awal? Semua transaksi tambahan akan dihapus.')) {
      localStorage.removeItem(`${STORAGE_KEY}_products`);
      localStorage.removeItem(`${STORAGE_KEY}_batches`);
      localStorage.removeItem(`${STORAGE_KEY}_customers`);
      localStorage.removeItem(`${STORAGE_KEY}_accounts`);
      localStorage.removeItem(`${STORAGE_KEY}_journals`);
      localStorage.removeItem(`${STORAGE_KEY}_transactions`);

      setProducts(INITIAL_PRODUCTS);
      setBatches(INITIAL_BATCHES);
      setCustomers(INITIAL_CUSTOMERS);
      setAccounts(INITIAL_ACCOUNTS);
      setJournals(INITIAL_JOURNALS);
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  // Quick Simulation of the exact prompt scenario:
  // "Contoh: B-001 (5 unit @ 8.000), B-002 (10 unit @ 9.000), order 7 unit -> HPP = 58.000"
  const handleSimulateExample = () => {
    const coffee = products.find(p => p.kode_produk === 'PRD-001');
    const customer = customers.find(c => c.pelanggan_id === 1) || customers[0];
    if (!coffee) return;

    // Check if sufficient coffee stock
    const available = batches
      .filter(b => b.produk_id === coffee.produk_id)
      .reduce((sum, b) => sum + b.kuantitas_sisa, 0);

    if (available < 7) {
      alert('Stok kopi saat ini kurang dari 7 unit. Silakan klik "Reset Data" terlebih dahulu untuk menguji simulasi ini.');
      return;
    }

    const res = handleProcessCheckout(customer.pelanggan_id, 'tunai', [
      { produk: coffee, kuantitas: 7 },
    ]);

    if (res.success) {
      setActiveTab('visualizer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
      {/* Top Navigation & Financial Stats Ribbon */}
      <Header
        financials={financialStatements}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        onSimulateExample={handleSimulateExample}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'pos' && (
          <PosCheckout
            products={products}
            batches={batches}
            customers={customers}
            onProcessCheckout={handleProcessCheckout}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'fifo' && (
          <InventoryBatches
            products={products}
            batches={batches}
            onAddBatch={handleAddBatch}
            onAddProduct={handleAddProduct}
          />
        )}

        {activeTab === 'jurnal' && (
          <JournalList
            journals={journals}
            accounts={updatedAccounts}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === 'bukubesar' && (
          <GeneralLedgerView
            accounts={updatedAccounts}
            ledgerEntries={ledgerEntries}
          />
        )}

        {activeTab === 'laporan' && (
          <FinancialStatements
            financials={financialStatements}
          />
        )}

        {activeTab === 'visualizer' && (
          <ProcessVisualizer
            transactions={transactions}
            journals={journals}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'pelanggan' && (
          <CustomersView
            customers={customers}
            transactions={transactions}
            onAddCustomer={handleAddCustomer}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">ERP Mini UMKM</span> — Sistem Akuntansi Ganda &amp; Persediaan FIFO Real-Time
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Standar SAK EMKM</span>
            <span>·</span>
            <span>Persamaan: Aset = Liabilitas + Ekuitas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
