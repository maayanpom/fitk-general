import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useParticipantState } from "@/data/participantContext"

// Every participant now arrives either via a coach-issued personal link
// (/start/:code) or via /register. A bare day/toolbox link with no local
// identity yet has nowhere else to go but registration.
export function RequireParticipant({ children }: { children: ReactNode }) {
  const { participant } = useParticipantState()

  if (!participant) return <Navigate to="/register" replace />

  return children
}
