import { getDb, initDb, memoryStore } from './core';
import type { Donation } from './types';
import { DEFAULT_DONATION_SEEDS } from './types';

interface DonationDbRow {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  created_at: string;
  updated_at: string;
}

function mapDonationRow(row: DonationDbRow): Donation {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllDonations(): Promise<Donation[]> {
  const db = await getDb();
  if (!db) {
    return [...memoryStore.donations].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  await initDb(db);
  const result = await db
    .prepare("SELECT * FROM donations ORDER BY date DESC, created_at DESC")
    .all<DonationDbRow>();

  return (result.results || []).map(mapDonationRow);
}

export async function getDonationById(id: string): Promise<Donation | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.donations.find((d) => d.id === id) || null;
  }

  await initDb(db);
  const row = await db
    .prepare("SELECT * FROM donations WHERE id = ?")
    .bind(id)
    .first<DonationDbRow>();
  return row ? mapDonationRow(row) : null;
}

export async function createDonation(data: {
  title: string;
  description: string;
  image: string;
  date?: string;
}): Promise<Donation> {
  const now = new Date().toISOString();
  const newDonation: Donation = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description.trim(),
    image: data.image.trim(),
    date: data.date?.trim() || now,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    memoryStore.donations.unshift(newDonation);
    return newDonation;
  }

  await initDb(db);
  await db
    .prepare(
      "INSERT INTO donations (id, title, description, image, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newDonation.id,
      newDonation.title,
      newDonation.description,
      newDonation.image,
      newDonation.date,
      newDonation.createdAt || now,
      newDonation.updatedAt || now,
    )
    .run();

  return newDonation;
}

export async function updateDonation(
  id: string,
  patch: Partial<Omit<Donation, "id" | "createdAt">>,
): Promise<Donation | null> {
  const existing = await getDonationById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Donation = {
    ...existing,
    ...patch,
    title: patch.title !== undefined ? patch.title.trim() : existing.title,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : existing.description,
    image: patch.image !== undefined ? patch.image.trim() : existing.image,
    date: patch.date !== undefined ? patch.date.trim() : existing.date,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    const idx = memoryStore.donations.findIndex((d) => d.id === id);
    if (idx !== -1) memoryStore.donations[idx] = updated;
    return updated;
  }

  await initDb(db);
  await db
    .prepare(
      "UPDATE donations SET title = ?, description = ?, image = ?, date = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      updated.title,
      updated.description,
      updated.image,
      updated.date,
      updated.updatedAt || now,
      id,
    )
    .run();

  return updated;
}

export async function deleteDonation(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    const before = memoryStore.donations.length;
    memoryStore.donations = memoryStore.donations.filter((d) => d.id !== id);
    return memoryStore.donations.length < before;
  }

  await initDb(db);
  const result = await db
    .prepare("DELETE FROM donations WHERE id = ?")
    .bind(id)
    .run();
  return result.success;
}

export async function resetDonationsToSeed(): Promise<Donation[]> {
  const now = new Date().toISOString();
  const seedsWithDate = DEFAULT_DONATION_SEEDS.map((s) => ({
    ...s,
    date: now,
    createdAt: now,
    updatedAt: now,
  }));

  const db = await getDb();
  if (!db) {
    memoryStore.donations = [...seedsWithDate];
    return memoryStore.donations;
  }

  await initDb(db);
  await db.prepare("DELETE FROM donations").run();

  const stmts = seedsWithDate.map((d) =>
    db
      .prepare(
        "INSERT INTO donations (id, title, description, image, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(d.id, d.title, d.description, d.image, d.date, now, now),
  );
  await db.batch(stmts);

  return seedsWithDate;
}
