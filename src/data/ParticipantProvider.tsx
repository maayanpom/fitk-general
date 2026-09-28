import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { normalizeParticipant, type Participant, type Section } from "./participant"
import { ParticipantContext, type SyncState } from "./participantContext"
import { supabase } from "./supabase"

const STORAGE_KEY = "challenge.participant"
const SYNC_DELAY_MS = 800

const noParticipant = (): Participant | null => null

export function ParticipantProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<Participant | null>(STORAGE_KEY, noParticipant)
  const participant = useMemo(() => (stored ? normalizeParticipant(stored) : null), [stored])
  const [syncState, setSyncState] = useState<SyncState>(supabase ? "idle" : "local")
  const lastSynced = useRef("")

  const sync = useCallback(async (p: Participant) => {
    if (!supabase) return true
    const json = JSON.stringify(p)
    if (json === lastSynced.current) return true

    setSyncState("saving")
    const { error } = await supabase.rpc("upsert_participant", { p })
    if (error) {
      console.error("Failed to save participant", error)
      setSyncState("error")
      return false
    }
    lastSynced.current = json
    setSyncState("saved")
    return true
  }, [])

  // Background sync of every change; the database is the source of truth.
  useEffect(() => {
    if (!participant) return
    const timer = setTimeout(() => void sync(participant), SYNC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [participant, sync])

  // Adopts an existing participant (created by the coach in admin) as this
  // browser's local identity, via a personal /start/:code link.
  const adoptById = useCallback(
    async (code: string) => {
      if (!supabase) return false
      const { data, error } = await supabase.rpc("get_participant", { participant_id: code })
      // get_participant returns real jsonb null for "no match" - unlike the
      // old plain-composite version, this is a genuine null, not an
      // all-fields-null object, but the ?. guard is safe either way.
      if (error || !data?.id) return false

      const row = data as {
        id: string
        first_name: string
        coach_slug: string | null
        day1: Participant["day1"] | null
        day2: Participant["day2"] | null
        day3: Participant["day3"] | null
        toolbox: Participant["toolbox"] | null
        created_at: string
        updated_at: string
      }
      setStored(
        normalizeParticipant({
          participantId: row.id,
          coachSlug: row.coach_slug ?? "",
          firstName: row.first_name,
          day1: row.day1 ?? ({} as Participant["day1"]),
          day2: row.day2 ?? ({} as Participant["day2"]),
          day3: row.day3 ?? ({} as Participant["day3"]),
          toolbox: row.toolbox ?? ({} as Participant["toolbox"]),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
      )
      lastSynced.current = ""
      return true
    },
    [setStored],
  )

  const updateSection = useCallback(
    <S extends Section>(section: S, patch: Partial<Participant[S]>) =>
      setStored((prev) =>
        prev
          ? {
              ...prev,
              [section]: { ...normalizeParticipant(prev)[section], ...patch },
              updatedAt: new Date().toISOString(),
            }
          : prev,
      ),
    [setStored],
  )

  const completeSection = useCallback(
    async (section: Section) => {
      if (!participant) return false
      const now = new Date().toISOString()
      const next: Participant = {
        ...participant,
        [section]: { ...participant[section], completedAt: now },
        updatedAt: now,
      }
      setStored(next)
      return sync(next)
    },
    [participant, setStored, sync],
  )

  const retrySync = useCallback(async () => {
    if (!participant) return false
    lastSynced.current = ""
    return sync(participant)
  }, [participant, sync])

  const value = useMemo(
    () => ({ participant, syncState, adoptById, updateSection, completeSection, retrySync }),
    [participant, syncState, adoptById, updateSection, completeSection, retrySync],
  )

  return <ParticipantContext.Provider value={value}>{children}</ParticipantContext.Provider>
}
