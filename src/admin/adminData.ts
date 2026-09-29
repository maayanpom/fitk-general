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

export type LeadSource = "community" | "meta_ad" | "manual"

export const SOURCE_LABELS: Record<LeadSource, string> = {
  community: "קהילה",
  meta_ad: "מודעה",
  manual: "ידני",
}

export type Registration = {
  id: string
  fullName: string
  phone: string
  email: string
  source: LeadSource
  consentPrivacyAt: string | null
  consentMessagesAt: string | null
  consentHoldonAt: string | null
  holdonRegisteredAt: string | null
  importBatch: string | null
  participantId: string | null
  createdAt: string
}

type RegistrationRow = {
  id: string
  full_name: string
  phone: string
  email: string
  source: LeadSource
  consent_privacy_at: string | null
  consent_messages_at: string | null
  consent_holdon_at: string | null
  holdon_registered_at: string | null
  import_batch: string | null
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
    source: row.source,
    consentPrivacyAt: row.consent_privacy_at,
    consentMessagesAt: row.consent_messages_at,
    consentHoldonAt: row.consent_holdon_at,
    holdonRegisteredAt: row.holdon_registered_at,
    importBatch: row.import_batch,
    participantId: row.participant_id,
    createdAt: row.created_at,
  }))
}

export type NewLead = { full_name: string; phone: string; email: string }

// Manual add (5.2) and Meta CSV import (5.3). One consent confirmation covers
// the whole call; the server dedupes by phone and email and normalizes phones.
export async function addRegistrations(
  rows: NewLead[],
  source: "manual" | "meta_ad",
  batch: string,
): Promise<{ inserted: number; skippedDuplicates: number }> {
  if (!supabase) throw new Error("Supabase is not connected")
  const { data, error } = await supabase.rpc("coach_add_registrations", {
    p_rows: rows,
    p_source: source,
    p_batch: batch,
    p_consent_confirmed: true,
  })
  if (error) throw error
  const d = data as { inserted: number; skipped_duplicates: number }
  return { inserted: d.inserted, skippedDuplicates: d.skipped_duplicates }
}

// 5.4: the HoldOn registration status button.
export async function setHoldonRegistered(registrationId: string, registered: boolean) {
  if (!supabase) throw new Error("Supabase is not connected")
  const { error } = await supabase.rpc("set_holdon_registered", {
    p_registration: registrationId,
    p_registered: registered,
  })
  if (error) throw error
}

// 5.5: creates the personal code (the participant id) for a registration.
// The server refuses when HoldOn consent is required and missing.
export async function createParticipantForRegistration(registrationId: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not connected")
  const { data, error } = await supabase.rpc("create_participant_for_registration", {
    p_registration: registrationId,
  })
  if (error) throw error
  return data as string
}

// 5.8: deletes the person, every answer and the summary.
export async function deletePerson(registrationId: string | null, participantId: string | null) {
  if (!supabase) throw new Error("Supabase is not connected")
  const { error } = await supabase.rpc("coach_delete_person", {
    p_registration: registrationId,
    p_participant: participantId,
  })
  if (error) throw error
}

export type SummaryRow = {
  participantId: string
  draft: string
  sentAt: string | null
}

export async function fetchSummaries(): Promise<SummaryRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from("summaries").select("participant_id, draft, sent_at")
  if (error) throw error
  return (data as { participant_id: string; draft: string; sent_at: string | null }[]).map((r) => ({
    participantId: r.participant_id,
    draft: r.draft,
    sentAt: r.sent_at,
  }))
}

export async function saveSummary(
  coachId: string,
  participantId: string,
  draft: string,
  sentAt: string | null,
) {
  if (!supabase) throw new Error("Supabase is not connected")
  const { error } = await supabase.from("summaries").upsert({
    participant_id: participantId,
    coach_id: coachId,
    draft,
    sent_at: sentAt,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
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
