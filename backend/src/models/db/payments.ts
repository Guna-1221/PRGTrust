import { getDb, initDb, memoryStore } from './core';
import type { DonationPayment } from './types';

interface DonationPaymentDbRow {
  id: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number;
  message: string | null;
  payment_status: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

function mapDonationPaymentRow(row: DonationPaymentDbRow): DonationPayment {
  return {
    id: row.id,
    donorName: row.donor_name,
    donorEmail: row.donor_email || undefined,
    donorPhone: row.donor_phone || undefined,
    amount: row.amount,
    message: row.message || undefined,
    paymentStatus: row.payment_status,
    transactionId: row.transaction_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllDonationPayments(status?: string): Promise<DonationPayment[]> {
  const db = await getDb();
  if (!db) {
    let payments = [...memoryStore.donationPayments];
    if (status) {
      payments = payments.filter((p) => p.paymentStatus === status);
    }
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  await initDb(db);
  let result;
  if (status) {
    result = await db
      .prepare("SELECT * FROM donation_payments WHERE payment_status = ? ORDER BY created_at DESC")
      .bind(status)
      .all<DonationPaymentDbRow>();
  } else {
    result = await db
      .prepare("SELECT * FROM donation_payments ORDER BY created_at DESC")
      .all<DonationPaymentDbRow>();
  }

  return (result.results || []).map(mapDonationPaymentRow);
}

export async function getDonationPaymentById(id: string): Promise<DonationPayment | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.donationPayments.find((p) => p.id === id) || null;
  }

  await initDb(db);
  const row = await db.prepare("SELECT * FROM donation_payments WHERE id = ?").bind(id).first<DonationPaymentDbRow>();
  return row ? mapDonationPaymentRow(row) : null;
}

export async function createDonationPayment(data: {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  message?: string;
  paymentStatus?: string;
  transactionId?: string;
}): Promise<DonationPayment> {
  const now = new Date().toISOString();
  const newPayment: DonationPayment = {
    id: crypto.randomUUID(),
    donorName: data.donorName.trim(),
    donorEmail: data.donorEmail?.trim() || undefined,
    donorPhone: data.donorPhone?.trim() || undefined,
    amount: data.amount,
    message: data.message?.trim() || undefined,
    paymentStatus: data.paymentStatus?.trim() || "pending",
    transactionId: data.transactionId?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    memoryStore.donationPayments.push(newPayment);
    return newPayment;
  }

  await initDb(db);
  await db
    .prepare(
      "INSERT INTO donation_payments (id, donor_name, donor_email, donor_phone, amount, message, payment_status, transaction_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newPayment.id,
      newPayment.donorName,
      newPayment.donorEmail || null,
      newPayment.donorPhone || null,
      newPayment.amount,
      newPayment.message || null,
      newPayment.paymentStatus,
      newPayment.transactionId || null,
      newPayment.createdAt,
      newPayment.updatedAt,
    )
    .run();

  return newPayment;
}

export async function updateDonationPaymentStatus(
  id: string,
  status: string,
  transactionId?: string,
): Promise<DonationPayment | null> {
  const existing = await getDonationPaymentById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: DonationPayment = {
    ...existing,
    paymentStatus: status.trim(),
    transactionId: transactionId !== undefined ? transactionId.trim() : existing.transactionId,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    const idx = memoryStore.donationPayments.findIndex((p) => p.id === id);
    if (idx !== -1) memoryStore.donationPayments[idx] = updated;
    return updated;
  }

  await initDb(db);
  
  if (transactionId !== undefined) {
    await db
      .prepare("UPDATE donation_payments SET payment_status = ?, transaction_id = ?, updated_at = ? WHERE id = ?")
      .bind(updated.paymentStatus, updated.transactionId || null, updated.updatedAt, id)
      .run();
  } else {
    await db
      .prepare("UPDATE donation_payments SET payment_status = ?, updated_at = ? WHERE id = ?")
      .bind(updated.paymentStatus, updated.updatedAt, id)
      .run();
  }

  return updated;
}
