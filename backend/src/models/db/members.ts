import { getDb, initDb, memoryStore } from './core';
import type { Member } from './types';

interface MemberDbRow {
  id: string;
  name: string;
  position: string;
  image: string | null;
  biography: string | null;
  qualification: string | null;
  experience: string | null;
  phone: string | null;
  email: string | null;
  is_leadership: number;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

function mapMemberRow(row: MemberDbRow): Member {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    image: row.image || undefined,
    biography: row.biography || undefined,
    qualification: row.qualification || undefined,
    experience: row.experience || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    isLeadership: row.is_leadership,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllMembers(activeOnly: boolean = false): Promise<Member[]> {
  const db = await getDb();
  if (!db) {
    let members = [...memoryStore.members];
    if (activeOnly) {
      members = members.filter((m) => m.isActive === 1);
    }
    return members.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  await initDb(db);
  const query = activeOnly
    ? "SELECT * FROM members WHERE is_active = 1 ORDER BY display_order ASC, created_at ASC"
    : "SELECT * FROM members ORDER BY display_order ASC, created_at ASC";

  const result = await db.prepare(query).all<MemberDbRow>();
  return (result.results || []).map(mapMemberRow);
}

export async function getMemberById(id: string): Promise<Member | null> {
  const db = await getDb();
  if (!db) {
    return memoryStore.members.find((m) => m.id === id) || null;
  }

  await initDb(db);
  const row = await db.prepare("SELECT * FROM members WHERE id = ?").bind(id).first<MemberDbRow>();
  return row ? mapMemberRow(row) : null;
}

export async function createMember(data: {
  name: string;
  position: string;
  image?: string;
  biography?: string;
  qualification?: string;
  experience?: string;
  phone?: string;
  email?: string;
  isLeadership?: number;
  isActive?: number;
  displayOrder?: number;
}): Promise<Member> {
  const now = new Date().toISOString();
  const newMember: Member = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    position: data.position.trim(),
    image: data.image?.trim() || undefined,
    biography: data.biography?.trim() || undefined,
    qualification: data.qualification?.trim() || undefined,
    experience: data.experience?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    email: data.email?.trim() || undefined,
    isLeadership: data.isLeadership !== undefined ? data.isLeadership : 0,
    isActive: data.isActive !== undefined ? data.isActive : 1,
    displayOrder: data.displayOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    memoryStore.members.push(newMember);
    return newMember;
  }

  await initDb(db);
  await db
    .prepare(
      "INSERT INTO members (id, name, position, image, biography, qualification, experience, phone, email, is_leadership, is_active, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newMember.id,
      newMember.name,
      newMember.position,
      newMember.image || null,
      newMember.biography || null,
      newMember.qualification || null,
      newMember.experience || null,
      newMember.phone || null,
      newMember.email || null,
      newMember.isLeadership,
      newMember.isActive,
      newMember.displayOrder,
      newMember.createdAt,
      newMember.updatedAt,
    )
    .run();

  return newMember;
}

export async function updateMember(
  id: string,
  patch: Partial<Omit<Member, "id" | "createdAt">>,
): Promise<Member | null> {
  const existing = await getMemberById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Member = {
    ...existing,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    position: patch.position !== undefined ? patch.position.trim() : existing.position,
    image: patch.image !== undefined ? patch.image?.trim() || undefined : existing.image,
    biography: patch.biography !== undefined ? patch.biography?.trim() || undefined : existing.biography,
    qualification: patch.qualification !== undefined ? patch.qualification?.trim() || undefined : existing.qualification,
    experience: patch.experience !== undefined ? patch.experience?.trim() || undefined : existing.experience,
    phone: patch.phone !== undefined ? patch.phone?.trim() || undefined : existing.phone,
    email: patch.email !== undefined ? patch.email?.trim() || undefined : existing.email,
    isLeadership: patch.isLeadership !== undefined ? patch.isLeadership : existing.isLeadership,
    isActive: patch.isActive !== undefined ? patch.isActive : existing.isActive,
    displayOrder: patch.displayOrder !== undefined ? patch.displayOrder : existing.displayOrder,
    updatedAt: now,
  };

  const db = await getDb();
  if (!db) {
    const idx = memoryStore.members.findIndex((m) => m.id === id);
    if (idx !== -1) memoryStore.members[idx] = updated;
    return updated;
  }

  await initDb(db);
  await db
    .prepare(
      "UPDATE members SET name = ?, position = ?, image = ?, biography = ?, qualification = ?, experience = ?, phone = ?, email = ?, is_leadership = ?, is_active = ?, display_order = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      updated.name,
      updated.position,
      updated.image || null,
      updated.biography || null,
      updated.qualification || null,
      updated.experience || null,
      updated.phone || null,
      updated.email || null,
      updated.isLeadership,
      updated.isActive,
      updated.displayOrder,
      updated.updatedAt,
      id,
    )
    .run();

  return updated;
}

export async function deleteMember(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    const before = memoryStore.members.length;
    memoryStore.members = memoryStore.members.filter((m) => m.id !== id);
    return memoryStore.members.length < before;
  }

  await initDb(db);
  const result = await db.prepare("DELETE FROM members WHERE id = ?").bind(id).run();
  return result.success;
}
