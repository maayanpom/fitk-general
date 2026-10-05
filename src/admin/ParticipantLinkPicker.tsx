import { useState } from "react"
import { Check, Copy } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/routes"

const LINKS = [
  { label: "יום 1", slug: undefined as string | undefined },
  { label: "יום 2", slug: PAGES[1].slug },
  { label: "יום 3", slug: PAGES[2].slug },
  { label: "ארגז כלים", slug: PAGES[3].slug },
]

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

function linkFor(participantId: string, slug?: string) {
  const path = slug ? `/start/${participantId}/${slug}` : `/start/${participantId}`
  return `${window.location.origin}${path}`
}

export function ParticipantLinkPicker({ participantId }: { participantId: string }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (label: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 2000)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) - nothing else to do here.
    }
  }

  return (
    <Grid>
      {LINKS.map(({ label, slug }) => (
        <Button
          key={label}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void copy(label, linkFor(participantId, slug))}
        >
          {copied === label ? <Check /> : <Copy />}
          {label}
        </Button>
      ))}
    </Grid>
  )
}

// The three fixed links a coach shares with everyone: no personal parameters,
// participants identify with the phone number they registered with.
export function CoachDayLinks({ coachSlug }: { coachSlug: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const days = [1, 2, 3]

  const copy = async (day: number) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${coachSlug}/day-${day}`)
      setCopied(`day-${day}`)
      setTimeout(() => setCopied((c) => (c === `day-${day}` ? null : c)), 2000)
    } catch {
      // Clipboard API unavailable - nothing else to do here.
    }
  }

  return (
    <Grid>
      <span>קישורים קבועים למשתתפים:</span>
      {days.map((day) => (
        <Button key={day} type="button" size="sm" variant="outline" onClick={() => void copy(day)}>
          {copied === `day-${day}` ? <Check /> : <Copy />}
          יום {day}
        </Button>
      ))}
    </Grid>
  )
}
