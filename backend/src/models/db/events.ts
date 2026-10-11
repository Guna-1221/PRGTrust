import { getDb, initDb, memoryStore } from './core';
import type { TrustEvent } from './types';

interface EventDbRow {
  id: string;
  title: string;
  description: string;
  image: string | null;
  location: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  end_date: string | null;
  registration_link: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

function mapEventRow(row: EventDbRow): TrustEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image || undefined,
    location: row.location || undefined,
    eventDate: row.event_date,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    endDate: row.end_date || undefined,
    registrationLink: row.registration_link || undefined,
    contactInfo: row.contact_info || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllEvents(): Promise<TrustEvent[]> {
  const db = await getDb();
  if (!db) {
    return [...memoryStore.events].sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    );
  }

  await initDb(db);
  const result = await db
    .prepare("SELECT * FROM events ORDER BY event_date DESC, created_at DESC")
    .all<EventDbRow>();

  return (result.results || []).map(mapEventRow);
}

export async function getEventById(id: string): Promise<TrustEvent | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.events.find((e) => e.id === id) || null;
  }

  await initDb(db);
  const row = await db
    .prepare("SELECT * FROM events WHERE id = ?")
    .bind(id)
    .first<EventDbRow>();
  return row ? mapEventRow(row) : null;
}

export async function createEvent(data: {
  title: string;
  description: string;
  image?: string;
  location?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  endDate?: string;
  registrationLink?: string;
  contactInfo?: string;
}): Promise<TrustEvent> {
  const now = new Date().toISOString();
  const newEvent: TrustEvent = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description.trim(),
    image: data.image?.trim() || undefined,
    location: data.location?.trim() || undefined,
    eventDate: data.eventDate.trim(),
    startTime: data.startTime?.trim() || undefined,
    endTime: data.endTime?.trim() || undefined,
    endDate: data.endDate?.trim() || undefined,
    registrationLink: data.registrationLink?.trim() || undefined,
    contactInfo: data.contactInfo?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    memoryStore.events.unshift(newEvent);
    return newEvent;
  }

  await initDb(db);
  await db
    .prepare(
      "INSERT INTO events (id, title, description, image, location, event_date, start_time, end_time, end_date, registration_link, contact_info, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newEvent.id,
      newEvent.title,
      newEvent.description,
      newEvent.image || null,
      newEvent.location || null,
      newEvent.eventDate,
      newEvent.startTime || null,
      newEvent.endTime || null,
      newEvent.endDate || null,
      newEvent.registrationLink || null,
      newEvent.contactInfo || null,
      newEvent.createdAt,
      newEvent.updatedAt || now,
    )
    .run();

  return newEvent;
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<TrustEvent, "id" | "createdAt">>,
): Promise<TrustEvent | null> {
  const existing = await getEventById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: TrustEvent = {
    ...existing,
    ...patch,
    title: patch.title !== undefined ? patch.title.trim() : existing.title,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : existing.description,
    image:
      patch.image !== undefined ? patch.image?.trim() || undefined : existing.image,
    location:
      patch.location !== undefined
        ? patch.location?.trim() || undefined
        : existing.location,
    eventDate:
      patch.eventDate !== undefined
        ? patch.eventDate.trim()
        : existing.eventDate,
    startTime: patch.startTime !== undefined ? patch.startTime?.trim() || undefined : existing.startTime,
    endTime: patch.endTime !== undefined ? patch.endTime?.trim() || undefined : existing.endTime,
    endDate: patch.endDate !== undefined ? patch.endDate?.trim() || undefined : existing.endDate,
    registrationLink: patch.registrationLink !== undefined ? patch.registrationLink?.trim() || undefined : existing.registrationLink,
    contactInfo: patch.contactInfo !== undefined ? patch.contactInfo?.trim() || undefined : existing.contactInfo,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    const idx = memoryStore.events.findIndex((e) => e.id === id);
    if (idx !== -1) memoryStore.events[idx] = updated;
    return updated;
  }

  await initDb(db);
  await db
    .prepare(
      "UPDATE events SET title = ?, description = ?, image = ?, location = ?, event_date = ?, start_time = ?, end_time = ?, end_date = ?, registration_link = ?, contact_info = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      updated.title,
      updated.description,
      updated.image || null,
      updated.location || null,
      updated.eventDate,
      updated.startTime || null,
      updated.endTime || null,
      updated.endDate || null,
      updated.registrationLink || null,
      updated.contactInfo || null,
      updated.updatedAt || now,
      id,
    )
    .run();

  return updated;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    const before = memoryStore.events.length;
    memoryStore.events = memoryStore.events.filter((e) => e.id !== id);
    return memoryStore.events.length < before;
  }

  await initDb(db);
  const result = await db
    .prepare("DELETE FROM events WHERE id = ?")
    .bind(id)
    .run();
  return result.success;
}
