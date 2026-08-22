import { getEnv, type D1Database } from "./env";

export type TrustEvent = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location?: string;
  eventDate: string;
  createdAt: string;
  updatedAt?: string;
};

export type Donation = {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};

export const DEFAULT_DONATION_SEEDS: Donation[] = [
  {
    id: "seed-1",
    title: "Food drive — Anantapur streets",
    description: "Volunteer handing food packet to an elderly man on the street.",
    image: "/assets/food-donation-1.jpg",
    date: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Meals for the visually impaired",
    description: "Volunteer offering food to an elderly visually impaired man.",
    image: "/assets/food-donation-2.jpg",
    date: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "Care for elderly women",
    description: "Volunteer handing a food packet to an elderly woman in a red saree.",
    image: "/assets/food-donation-3.jpg",
    date: new Date().toISOString(),
  },
];

// In-memory fallback if D1 database is not bound (e.g. dev mock environment)
const memoryStore = {
  events: [] as TrustEvent[],
  donations: [...DEFAULT_DONATION_SEEDS] as Donation[],
  images: new Map<string, { data: string; contentType: string; size: number }>(),
};

let dbInitialized = false;

export async function getDb(): Promise<D1Database | null> {
  const env = await getEnv();
  return env.DB || null;
}

let initPromise: Promise<void> | null = null;

export async function initDb(db: D1Database): Promise<void> {
  if (dbInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await db.batch([
        db.prepare(
          "CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, image TEXT, location TEXT, event_date TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE TABLE IF NOT EXISTS donations (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, image TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, content_type TEXT NOT NULL, data TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date DESC)",
        ),
      ]);

      // Seed donations if empty
      const check = await db
        .prepare("SELECT COUNT(*) as count FROM donations")
        .first<{ count: number }>();
      if (!check || check.count === 0) {
        const now = new Date().toISOString();
        const stmts = DEFAULT_DONATION_SEEDS.map((d) =>
          db
            .prepare(
              "INSERT INTO donations (id, title, description, image, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(d.id, d.title, d.description, d.image, d.date, now, now),
        );
        await db.batch(stmts);
      }

      dbInitialized = true;
    } catch (err) {
      console.error("Database initialization warning:", err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/* ---------------- EVENTS CRUD ---------------- */

interface EventDbRow {
  id: string;
  title: string;
  description: string;
  image: string | null;
  location: string | null;
  event_date: string;
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
}): Promise<TrustEvent> {
  const now = new Date().toISOString();
  const newEvent: TrustEvent = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description.trim(),
    image: data.image?.trim() || undefined,
    location: data.location?.trim() || undefined,
    eventDate: data.eventDate.trim(),
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
      "INSERT INTO events (id, title, description, image, location, event_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newEvent.id,
      newEvent.title,
      newEvent.description,
      newEvent.image || null,
      newEvent.location || null,
      newEvent.eventDate,
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
      "UPDATE events SET title = ?, description = ?, image = ?, location = ?, event_date = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      updated.title,
      updated.description,
      updated.image || null,
      updated.location || null,
      updated.eventDate,
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

/* ---------------- DONATIONS CRUD ---------------- */

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

/* ---------------- D1 IMAGE STORAGE (R2 FALLBACK) ---------------- */

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
