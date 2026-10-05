import { createContext, useContext } from "react"
import type { Participant, Section } from "./participant"

export type SyncState = "idle" | "saving" | "saved" | "error" | "local"

export type ParticipantContextValue = {
  participant: Participant | null
  syncState: SyncState
  adoptById: (code: string) => Promise<boolean>
  identifyByPhone: (coachSlug: string, phone: string) => Promise<boolean>
  updateSection: <S extends Section>(section: S, patch: Partial<Participant[S]>) => void
  completeSection: (section: Section) => Promise<boolean>
  retrySync: () => Promise<boolean>
}

export const ParticipantContext = createContext<ParticipantContextValue | null>(null)

function useParticipantContext() {
  const ctx = useContext(ParticipantContext)
  if (!ctx) throw new Error("ParticipantProvider is missing")
  return ctx
}

export function useParticipantState() {
  return useParticipantContext()
}

// For pages rendered inside RequireParticipant, where a participant always exists.
export function useParticipant() {
  const ctx = useParticipantContext()
  if (!ctx.participant) throw new Error("useParticipant used outside RequireParticipant")
  return { ...ctx, participant: ctx.participant }
}
