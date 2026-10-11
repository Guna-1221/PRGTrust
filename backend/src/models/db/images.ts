import { getDb, initDb, memoryStore } from './core';

interface ImageDbRow {
  id: string;
  content_type: string;
  data: string;
  size: number;
  created_at: string;
}

export async function saveImageToDb(
  key: string,
  base64Data: string,
  contentType: string,
  size: number,
): Promise<void> {
  const db = await getDb();
  if (!db) {
    memoryStore.images.set(key, { data: base64Data, contentType, size });
    return;
  }

  await initDb(db);
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT OR REPLACE INTO images (id, content_type, data, size, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(key, contentType, base64Data, size, now)
    .run();
}

export async function getImageFromDb(
  key: string,
): Promise<{ data: string; contentType: string; size: number } | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.images.get(key) || null;
  }

  await initDb(db);
  const row = await db
    .prepare("SELECT * FROM images WHERE id = ?")
    .bind(key)
    .first<ImageDbRow>();

  if (!row) return null;
  return {
    data: row.data,
    contentType: row.content_type,
    size: row.size,
  };
}

export async function deleteImageFromDb(key: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    memoryStore.images.delete(key);
    return true;
  }

  await initDb(db);
  await db.prepare("DELETE FROM images WHERE id = ?").bind(key).run();
  return true;
}
