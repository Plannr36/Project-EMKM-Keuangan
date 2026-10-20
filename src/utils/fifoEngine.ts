/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PersediaanBatch, FifoConsumptionResult } from '../types/erp';

/**
 * Menghitung pengurangan persediaan menggunakan metode First-In, First-Out (FIFO)
 * Sesuai Langkah 2 pada spesifikasi alur logika bisnis ERP UMKM.
 *
 * @param allBatches Daftar seluruh batch untuk produk terkait
 * @param requestedQty Jumlah unit yang ingin dibeli/dikeluarkan
 * @returns FifoConsumptionResult Hasil alokasi batch, HPP total, dan batch terupdate
 */
export function calculateFifoConsumption(
  allBatches: PersediaanBatch[],
  requestedQty: number
): FifoConsumptionResult {
  if (requestedQty <= 0) {
    return {
      success: false,
      consumed: [],
      total_hpp: 0,
      hpp_satuan_rata: 0,
      updated_batches: allBatches,
      error: 'Kuantitas pesanan harus lebih besar dari 0.',
    };
  }

  // 1. Ambil batch yang masih memiliki sisa stok dan urutkan berdasarkan tanggal masuk tertua (FIFO)
  // Kloning list batch agar tidak memutasi langsung input
  const updatedBatches: PersediaanBatch[] = allBatches.map(b => ({ ...b }));

  // Filter batch dengan stok > 0 dan urutkan tanggal ASC, lalu batch_id ASC
  const availableIndices = updatedBatches
    .map((b, idx) => ({ idx, batch: b }))
    .filter(item => item.batch.kuantitas_sisa > 0)
    .sort((a, b) => {
      const dateA = new Date(a.batch.tanggal_masuk).getTime();
      const dateB = new Date(b.batch.tanggal_masuk).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.batch.batch_id - b.batch.batch_id;
    });

  const totalAvailableStock = availableIndices.reduce(
    (sum, item) => sum + item.batch.kuantitas_sisa,
    0
  );

  if (totalAvailableStock < requestedQty) {
    return {
      success: false,
      consumed: [],
      total_hpp: 0,
      hpp_satuan_rata: 0,
      updated_batches: allBatches,
      error: `Stok tidak mencukupi! Tersedia ${totalAvailableStock} unit, dibutuhkan ${requestedQty} unit.`,
    };
  }

  let remainingToFulfill = requestedQty;
  const consumed: FifoConsumptionResult['consumed'] = [];
  let totalHpp = 0;

  for (const { idx } of availableIndices) {
    if (remainingToFulfill <= 0) break;

    const currentBatch = updatedBatches[idx];
    const takeQty = Math.min(currentBatch.kuantitas_sisa, remainingToFulfill);
    const subtotalHpp = takeQty * currentBatch.harga_pokok_per_unit;

    currentBatch.kuantitas_sisa -= takeQty;
    remainingToFulfill -= takeQty;
    totalHpp += subtotalHpp;

    consumed.push({
      batch_id: currentBatch.batch_id,
      kode_batch: currentBatch.kode_batch,
      kuantitas_diambil: takeQty,
      harga_pokok_per_unit: currentBatch.harga_pokok_per_unit,
      subtotal_hpp: subtotalHpp,
    });
  }

  const hppSatuanRata = requestedQty > 0 ? totalHpp / requestedQty : 0;

  return {
    success: true,
    consumed,
    total_hpp: totalHpp,
    hpp_satuan_rata: hppSatuanRata,
    updated_batches: updatedBatches,
  };
}

/**
 * Preview alokasi FIFO tanpa memutasi data aktual
 */
export function previewFifoAllocation(
  batches: PersediaanBatch[],
  requestedQty: number
): FifoConsumptionResult {
  return calculateFifoConsumption(batches, requestedQty);
}
