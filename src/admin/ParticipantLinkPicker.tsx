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
  const links = [
    { key: "day-1", label: "יום 1" },
    { key: "day-2", label: "יום 2" },
    { key: "day-3", label: "יום 3" },
    { key: "toolbox", label: "ארגז כלים" },
  ]

  const copy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${coachSlug}/${key}`)
      setCopied(key)
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000)
    } catch {
      // Clipboard API unavailable - nothing else to do here.
    }
  }

  return (
    <Grid>
      <span>קישורים קבועים למשתתפים:</span>
      {links.map(({ key, label }) => (
        <Button key={key} type="button" size="sm" variant="outline" onClick={() => void copy(key)}>
          {copied === key ? <Check /> : <Copy />}
          {label}
        </Button>
      ))}
    </Grid>
  )
}
