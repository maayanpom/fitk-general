import { useEffect, useState } from "react"
import { getCoachPublicBySlug, type CoachPublicInfo } from "./coach"

// Fetches the public WhatsApp/community/name settings for the coach a
// participant belongs to, so their pages never bake one coach's info into
// the shared build - each participant sees their own coach's details.
// Only the static preview generator (scripts/generate-previews.mjs) sets this, so
// server-rendered snapshots show the buttons that depend on coach settings.
const previewCoach = () =>
  (globalThis as { __PREVIEW_COACH__?: CoachPublicInfo }).__PREVIEW_COACH__

export function useCoachPublicInfo(slug: string | undefined) {
  const [info, setInfo] = useState<CoachPublicInfo | null>(() => previewCoach() ?? null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    getCoachPublicBySlug(slug)
      .then((data) => {
        if (!cancelled) setInfo(data)
      })
      .catch((err: unknown) => console.error("Failed to load coach info", err))
    return () => {
      cancelled = true
    }
  }, [slug])

  return info
}
