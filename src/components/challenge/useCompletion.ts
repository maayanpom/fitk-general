import { useRef } from "react"
import { useParticipant } from "@/data/participantContext"
import type { Section } from "@/data/participant"

// Completes a section and scrolls the feedback/result area into view.
export function useCompletion(section: Section) {
  const { participant, completeSection } = useParticipant()
  const resultRef = useRef<HTMLDivElement>(null)

  const complete = async () => {
    const done = completeSection(section)
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    )
    return done
  }

  return { isCompleted: Boolean(participant[section].completedAt), complete, resultRef }
}
