import { useEffect, useState } from "react"
import { getCoachPublicBySlug, type CoachPublicInfo } from "./coach"

// Fetches the public WhatsApp/community/name settings for the coach a
// participant belongs to, so their pages never bake one coach's info into
// the shared build - each participant sees their own coach's details.
export function useCoachPublicInfo(slug: string | undefined) {
  const [info, setInfo] = useState<CoachPublicInfo | null>(null)

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
