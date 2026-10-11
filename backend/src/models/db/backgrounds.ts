import { getDb, initDb, memoryStore } from './core';
import type { HomeBackground } from './types';

interface HomeBackgroundDbRow {
  id: string;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapBackgroundRow(row: HomeBackgroundDbRow): HomeBackground {
  return {
    id: row.id,
    image: row.image,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveBackground(): Promise<HomeBackground | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.homeBackgrounds.find((b) => b.isActive === 1) || null;
  }

  await initDb(db);
  const row = await db.prepare("SELECT * FROM home_background WHERE is_active = 1 LIMIT 1").first<HomeBackgroundDbRow>();
  return row ? mapBackgroundRow(row) : null;
}

export async function setActiveBackground(id: string): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDb();
  
  if (!db) {
    memoryStore.homeBackgrounds.forEach(b => {
      if (b.id === id) {
        b.isActive = 1;
        b.updatedAt = now;
      } else if (b.isActive === 1) {
        b.isActive = 0;
        b.updatedAt = now;
      }
    });
    return;
  }

  await initDb(db);
  // Unset all active
  await db.prepare("UPDATE home_background SET is_active = 0, updated_at = ?").bind(now).run();
  // Set the specific one active
  await db.prepare("UPDATE home_background SET is_active = 1, updated_at = ? WHERE id = ?").bind(now, id).run();
}

export async function createBackground(image: string): Promise<HomeBackground> {
  const now = new Date().toISOString();
  const newBg: HomeBackground = {
    id: crypto.randomUUID(),
    image: image.trim(),
    isActive: 0,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    memoryStore.homeBackgrounds.push(newBg);
    return newBg;
  }

  await initDb(db);
  await db
    .prepare("INSERT INTO home_background (id, image, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
    .bind(newBg.id, newBg.image, newBg.isActive, newBg.createdAt, newBg.updatedAt)
    .run();

  return newBg;
}

export async function deleteBackground(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    const before = memoryStore.homeBackgrounds.length;
    memoryStore.homeBackgrounds = memoryStore.homeBackgrounds.filter((b) => b.id !== id);
    return memoryStore.homeBackgrounds.length < before;
  }

  await initDb(db);
  const result = await db.prepare("DELETE FROM home_background WHERE id = ?").bind(id).run();
  return result.success;
}

export async function getAllBackgrounds(): Promise<HomeBackground[]> {
  const db = await getDb();
  if (!db) {
    return [...memoryStore.homeBackgrounds].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  await initDb(db);
  const result = await db.prepare("SELECT * FROM home_background ORDER BY created_at DESC").all<HomeBackgroundDbRow>();
  return (result.results || []).map(mapBackgroundRow);
}
