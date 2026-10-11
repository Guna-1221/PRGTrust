import { getDb, initDb, memoryStore } from './core';
import type { GalleryImage } from './types';

interface GalleryDbRow {
  id: string;
  title: string;
  description: string | null;
  image: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

function mapGalleryRow(row: GalleryDbRow): GalleryImage {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    image: row.image,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const db = await getDb();
  if (!db) {
    return [...memoryStore.gallery].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  await initDb(db);
  const result = await db
    .prepare("SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC")
    .all<GalleryDbRow>();

  return (result.results || []).map(mapGalleryRow);
}

export async function getGalleryImageById(id: string): Promise<GalleryImage | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.gallery.find((g) => g.id === id) || null;
  }

  await initDb(db);
  const row = await db
    .prepare("SELECT * FROM gallery WHERE id = ?")
    .bind(id)
    .first<GalleryDbRow>();
  return row ? mapGalleryRow(row) : null;
}

export async function createGalleryImage(data: {
  title: string;
  description?: string;
  image: string;
  displayOrder?: number;
}): Promise<GalleryImage> {
  const now = new Date().toISOString();
  const newGallery: GalleryImage = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    image: data.image.trim(),
    displayOrder: data.displayOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    memoryStore.gallery.push(newGallery);
    return newGallery;
  }

  await initDb(db);
  await db
    .prepare(
      "INSERT INTO gallery (id, title, description, image, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newGallery.id,
      newGallery.title,
      newGallery.description || null,
      newGallery.image,
      newGallery.displayOrder,
      newGallery.createdAt,
      newGallery.updatedAt,
    )
    .run();

  return newGallery;
}

export async function updateGalleryImage(
  id: string,
  patch: Partial<Omit<GalleryImage, "id" | "createdAt">>,
): Promise<GalleryImage | null> {
  const existing = await getGalleryImageById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: GalleryImage = {
    ...existing,
    ...patch,
    title: patch.title !== undefined ? patch.title.trim() : existing.title,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || undefined
        : existing.description,
    image: patch.image !== undefined ? patch.image.trim() : existing.image,
    displayOrder: patch.displayOrder !== undefined ? patch.displayOrder : existing.displayOrder,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    const idx = memoryStore.gallery.findIndex((g) => g.id === id);
    if (idx !== -1) memoryStore.gallery[idx] = updated;
    return updated;
  }

  await initDb(db);
  await db
    .prepare(
      "UPDATE gallery SET title = ?, description = ?, image = ?, display_order = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      updated.title,
      updated.description || null,
      updated.image,
      updated.displayOrder,
      updated.updatedAt,
      id,
    )
    .run();

  return updated;
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    const before = memoryStore.gallery.length;
    memoryStore.gallery = memoryStore.gallery.filter((g) => g.id !== id);
    return memoryStore.gallery.length < before;
  }

  await initDb(db);
  const result = await db.prepare("DELETE FROM gallery WHERE id = ?").bind(id).run();
  return result.success;
}
