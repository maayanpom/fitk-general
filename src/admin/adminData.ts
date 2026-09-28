import { normalizeParticipant, type Participant } from "@/data/participant"
import { supabase } from "@/data/supabase"

type ParticipantRow = {
  id: string
  first_name: string
  day1: Participant["day1"] | null
  day2: Participant["day2"] | null
  day3: Participant["day3"] | null
  toolbox: Participant["toolbox"] | null
  created_at: string
  updated_at: string
}

function fromRow(row: ParticipantRow): Participant {
  return normalizeParticipant({
    participantId: row.id,
    // Not needed anywhere in the admin UI (a coach only ever sees her own
    // participants, via RLS) - only participant-facing pages use this.
    coachSlug: "",
    firstName: row.first_name,
    day1: row.day1 ?? ({} as Participant["day1"]),
    day2: row.day2 ?? ({} as Participant["day2"]),
    day3: row.day3 ?? ({} as Participant["day3"]),
    toolbox: row.toolbox ?? ({} as Participant["toolbox"]),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

export async function fetchParticipants(): Promise<Participant[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data as ParticipantRow[]).map(fromRow)
}

export type Registration = {
  id: string
  fullName: string
  phone: string
  email: string
  consentPrivacy: boolean
  consentHoldon: boolean
  participantId: string | null
  createdAt: string
}

type RegistrationRow = {
  id: string
  full_name: string
  phone: string
  email: string
  consent_privacy: boolean
  consent_holdon: boolean
  participant_id: string | null
  created_at: string
}

export async function fetchRegistrations(): Promise<Registration[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as RegistrationRow[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    consentPrivacy: row.consent_privacy,
    consentHoldon: row.consent_holdon,
    participantId: row.participant_id,
    createdAt: row.created_at,
  }))
}

// Marks a registration (lead) as converted into a participant, so the admin
// UI can stop it being converted a second time.
export async function linkRegistrationToParticipant(
  registrationId: string,
  participantId: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not connected")
  const { error } = await supabase.rpc("link_registration_to_participant", {
    registration_id: registrationId,
    participant_id: participantId,
  })
  if (error) throw error
}

// Creates a new participant (coach-registered) and returns their id, for
// building the personal /start/:code link. Reuses the same RPC participants
// use to save their own answers - the admin session is also `authenticated`,
// which upsert_participant already grants execute to.
export async function createParticipant(firstName: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not connected")
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const { error } = await supabase.rpc("upsert_participant", {
    p: {
      participantId: id,
      firstName: firstName.trim(),
      day1: {},
      day2: {},
      day3: {},
      toolbox: {},
      createdAt: now,
    },
  })
  if (error) throw error
  return id
}

const dateTime = new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" })
const time = new Intl.DateTimeFormat("he-IL", { timeStyle: "short" })
const dayOnly = new Intl.DateTimeFormat("he-IL", { dateStyle: "short" })

export function formatDateTime(iso: string) {
  return iso ? dateTime.format(new Date(iso)) : "—"
}

// "היום" / "אתמול" / a short date - for the "last update" column.
export function formatRelativeDay(iso: string) {
  if (!iso) return "—"
  const date = new Date(iso)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfDate = new Date(date)
  startOfDate.setHours(0, 0, 0, 0)
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000)

  if (diffDays === 0) return `היום, ${time.format(date)}`
  if (diffDays === 1) return `אתמול, ${time.format(date)}`
  return dayOnly.format(date)
}
