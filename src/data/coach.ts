import { supabase } from "./supabase"

export type Coach = {
  id: string
  name: string
  email: string
  phone: string
  communityUrl: string | null
  slug: string
  createdAt: string
}

type CoachRow = {
  id: string
  name: string
  email: string
  phone: string
  community_url: string | null
  slug: string
  created_at: string
}

function fromRow(row: CoachRow): Coach {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    communityUrl: row.community_url,
    slug: row.slug,
    createdAt: row.created_at,
  }
}

// Hebrew names don't transliterate cleanly to URLs, so slugs are just a short
// random code - editable later via the settings tab if a coach wants nicer.
function randomSlug() {
  return Math.random().toString(36).slice(2, 8)
}

// Signs a new coach up: creates the Supabase Auth user, then their profile
// row. Retries a couple of random slugs in the rare case of a collision.
export async function signUpCoach(params: {
  name: string
  email: string
  password: string
  phone: string
}): Promise<Coach> {
  if (!supabase) throw new Error("Supabase is not connected")
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
  })
  if (error) throw error
  if (!data.user) throw new Error("החשבון נוצר אך לא נפתחה התחברות. נסו להתחבר.")

  let lastError: unknown
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: row, error: insertError } = await supabase
      .from("coaches")
      .insert({
        id: data.user.id,
        name: params.name.trim(),
        email: params.email.trim(),
        phone: params.phone.trim(),
        slug: randomSlug(),
      })
      .select()
      .single()
    if (!insertError) return fromRow(row as CoachRow)
    lastError = insertError
  }
  throw lastError
}

// The signed-in coach's own profile, or null if this account has none yet
// (an edge case - e.g. signup partly failed).
//
// Filters explicitly by the caller's own id rather than relying on RLS alone:
// a super admin can see every coach's row (a separate, permissive policy for
// the oversight list), so an unfiltered query would return multiple rows for
// that account and make .maybeSingle() throw.
export async function fetchOwnCoach(): Promise<Coach | null> {
  if (!supabase) return null
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) return null

  const { data, error } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle()
  if (error) throw error
  return data ? fromRow(data as CoachRow) : null
}

// Whether another coach already uses this slug - checked before saving so a
// collision can be shown as an inline error instead of relying on the raw
// Postgres "duplicate key" message after the write fails.
//
// Goes through the public slug lookup (a security-definer RPC, declared
// below) rather than a plain table query: RLS only lets a coach read their
// own row ("coach reads own row" in coaches.sql), so a direct query could
// never see another coach's slug and this check would silently never fire.
export async function isSlugTaken(slug: string): Promise<boolean> {
  const info = await getCoachPublicBySlug(slug.trim())
  return info !== null
}

export async function updateOwnCoach(
  id: string,
  patch: Partial<Pick<Coach, "name" | "phone" | "communityUrl" | "slug">>,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not connected")
  const update: Record<string, string | null> = {}
  if (patch.name !== undefined) update.name = patch.name.trim()
  if (patch.phone !== undefined) update.phone = patch.phone.trim()
  if (patch.communityUrl !== undefined) {
    update.community_url = patch.communityUrl ? patch.communityUrl.trim() || null : null
  }
  if (patch.slug !== undefined) update.slug = patch.slug.trim()

  const { error } = await supabase.from("coaches").update(update).eq("id", id)
  if (error) throw error
}

export async function checkIsSuperAdmin(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc("is_super_admin")
  if (error) throw error
  return Boolean(data)
}

export type CoachSummary = {
  id: string
  name: string
  email: string
  phone: string
  slug: string
  createdAt: string
  participantCount: number
}

type CoachWithCountRow = {
  id: string
  name: string
  email: string
  phone: string
  slug: string
  created_at: string
  participant_count: number
}

// The super admin's minimal oversight list - never participant/lead data,
// only a trainee count (used to decide whether a coach can be deleted).
export async function fetchAllCoachesSummary(): Promise<CoachSummary[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc("admin_coaches_with_counts")
  if (error) throw error
  return (data as CoachWithCountRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    slug: row.slug,
    createdAt: row.created_at,
    participantCount: row.participant_count,
  }))
}

// Deletes a coach who has zero trainees. Only the super admin can call this -
// the RPC itself re-checks both the role and the trainee count server-side.
export async function deleteCoach(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not connected")
  const { error } = await supabase.rpc("admin_delete_coach", { target_coach_id: id })
  if (error) throw error
}

export type CoachPublicInfo = {
  name: string
  email: string
  phone: string
  communityUrl: string | null
  slug: string
}

function publicFromJson(data: unknown): CoachPublicInfo | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>
  return {
    name: String(d.name ?? ""),
    email: String(d.email ?? ""),
    phone: String(d.phone ?? ""),
    communityUrl: (d.community_url as string | null) ?? null,
    slug: String(d.slug ?? ""),
  }
}

// Safe-to-display coach info for public/participant-facing pages (never
// anything beyond name/email/phone/community link/slug).
export async function getCoachPublicBySlug(slug: string): Promise<CoachPublicInfo | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc("get_coach_public_by_slug", { coach_slug: slug })
  if (error) throw error
  return publicFromJson(data)
}

export async function getCoachPublic(coachId: string): Promise<CoachPublicInfo | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc("get_coach_public", { coach_id: coachId })
  if (error) throw error
  return publicFromJson(data)
}
