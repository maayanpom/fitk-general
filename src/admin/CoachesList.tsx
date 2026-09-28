import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchAllCoachesSummary, type CoachSummary } from "@/data/coach"
import { formatRelativeDay } from "./adminData"

const Panel = styled.div`
  padding: 8px;
  border-radius: 18px;
  background: var(--card);
  box-shadow: 0 6px 20px -14px oklch(0.4 0.05 50 / 0.35);
`

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/${slug}/register`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable - nothing else to do here.
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={() => void copy()}>
      {copied ? <Check /> : <Copy />}
      {slug}
    </Button>
  )
}

// Minimal, data-free oversight for the super admin: who's registered, and
// their public link - never participants or leads, per the platform's rule
// that coach data is private per coach, even from the super admin.
export function CoachesList() {
  const [coaches, setCoaches] = useState<CoachSummary[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    fetchAllCoachesSummary()
      .then((data) => {
        setCoaches(data)
        setStatus("ready")
      })
      .catch((err: unknown) => {
        console.error("Failed to load coaches list", err)
        setStatus("error")
      })
  }, [])

  if (status === "loading") return null
  if (status === "error") return <ErrorText>לא הצלחנו לטעון את רשימת המאמנות.</ErrorText>

  return (
    <Panel>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">שם</TableHead>
            <TableHead className="text-start">אימייל</TableHead>
            <TableHead className="text-start">טלפון</TableHead>
            <TableHead className="text-start">קישור הרשמה</TableHead>
            <TableHead className="text-start">הצטרפ/ה</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                עוד אין מאמנות רשומות
              </TableCell>
            </TableRow>
          )}
          {coaches.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell dir="ltr" className="text-start">
                {c.email}
              </TableCell>
              <TableCell dir="ltr" className="text-start">
                {c.phone}
              </TableCell>
              <TableCell>
                <CopyLinkButton slug={c.slug} />
              </TableCell>
              <TableCell>{formatRelativeDay(c.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}
