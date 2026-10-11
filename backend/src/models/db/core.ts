import { getEnv, type D1Database } from '../../config/env';
import type { TrustEvent, Donation, GalleryImage, Member, HomeBackground, DonationPayment } from './types';
import { DEFAULT_DONATION_SEEDS } from './types';

// In-memory fallback if D1 database is not bound (e.g. dev mock environment)
export const memoryStore = {
  events: [] as TrustEvent[],
  donations: [...DEFAULT_DONATION_SEEDS] as Donation[],
  images: new Map<string, { data: string; contentType: string; size: number }>(),
  gallery: [] as GalleryImage[],
  members: [] as Member[],
  siteSettings: new Map<string, string>(),
  homeBackgrounds: [] as HomeBackground[],
  donationPayments: [] as DonationPayment[],
};

export let dbInitialized = false;

export async function getDb(): Promise<D1Database | null> {
  const env = await getEnv();
  return env.DB || null;
}

export let initPromise: Promise<void> | null = null;

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
        db.prepare(
          "CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, image TEXT NOT NULL, display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(display_order ASC)",
        ),
        db.prepare(
          "CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, name TEXT NOT NULL, position TEXT NOT NULL, image TEXT, biography TEXT, qualification TEXT, experience TEXT, phone TEXT, email TEXT, is_leadership INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_members_order ON members(display_order ASC)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active)",
        ),
        db.prepare(
          "CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE TABLE IF NOT EXISTS home_background (id TEXT PRIMARY KEY, image TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE TABLE IF NOT EXISTS donation_payments (id TEXT PRIMARY KEY, donor_name TEXT NOT NULL, donor_email TEXT, donor_phone TEXT, amount REAL NOT NULL, message TEXT, payment_status TEXT NOT NULL DEFAULT 'pending', transaction_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_donation_payments_status ON donation_payments(payment_status)",
        ),
        db.prepare(
          "CREATE INDEX IF NOT EXISTS idx_donation_payments_date ON donation_payments(created_at DESC)",
        ),
      ]);

      try { await db.prepare("ALTER TABLE events ADD COLUMN start_time TEXT").run(); } catch {}
      try { await db.prepare("ALTER TABLE events ADD COLUMN end_time TEXT").run(); } catch {}
      try { await db.prepare("ALTER TABLE events ADD COLUMN end_date TEXT").run(); } catch {}
      try { await db.prepare("ALTER TABLE events ADD COLUMN registration_link TEXT").run(); } catch {}
      try { await db.prepare("ALTER TABLE events ADD COLUMN contact_info TEXT").run(); } catch {}

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
