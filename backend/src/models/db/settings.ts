import { getDb, initDb, memoryStore } from './core';

interface SiteSettingDbRow {
  key: string;
  value: string;
  updated_at: string;
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.siteSettings.get(key) || null;
  }

  await initDb(db);
  const row = await db.prepare("SELECT value FROM site_settings WHERE key = ?").bind(key).first<{ value: string }>();
  return row ? row.value : null;
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    memoryStore.siteSettings.set(key, value);
    return;
  }

  const now = new Date().toISOString();
  await initDb(db);
  await db
    .prepare("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)")
    .bind(key, value, now)
    .run();
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) {
    return Object.fromEntries(memoryStore.siteSettings);
  }

  await initDb(db);
  const result = await db.prepare("SELECT * FROM site_settings").all<SiteSettingDbRow>();
  const settings: Record<string, string> = {};
  for (const row of result.results || []) {
    settings[row.key] = row.value;
  }
  return settings;
}
