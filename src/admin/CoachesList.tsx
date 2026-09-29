import { useEffect, useState } from "react"
import { Check, Copy, Trash2 } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteCoach, fetchAllCoachesSummary, type CoachSummary } from "@/data/coach"
import { formatRelativeDay } from "./adminData"

const Panel = styled.div`
  padding: 8px;
  border-radius: 18px;
  background: var(--card);
  box-shadow: 0 6px 20px -14px oklch(0.3 0.06 300 / 0.35);
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
export function CoachesList({ currentCoachId }: { currentCoachId: string }) {
  const [coaches, setCoaches] = useState<CoachSummary[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [deleteTarget, setDeleteTarget] = useState<CoachSummary | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

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

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    try {
      await deleteCoach(deleteTarget.id)
      setCoaches((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error("Failed to delete coach", err)
      setDeleteError("מחיקת המאמן/ת נכשלה. יכול להיות שנוספו לו/לה מתאמנים בינתיים - רעננו ונסו שוב.")
    } finally {
      setDeleting(false)
    }
  }

  if (status === "loading") return null
  if (status === "error") return <ErrorText>לא הצלחנו לטעון את רשימת המאמנים/ות.</ErrorText>

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
            <TableHead className="text-start"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                עוד אין מאמנים/ות רשומים
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
              <TableCell>
                {c.participantCount === 0 && c.id !== currentCoachId && (
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteError("")
                      setDeleteTarget(c)
                    }}
                  >
                    <Trash2 />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>למחוק את {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              הפעולה תמחק לצמיתות את חשבון המאמן/ת וקישור ההרשמה שלו/ה. אין דרך לבטל.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <ErrorText>{deleteError}</ErrorText>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting}>
              מחיקה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  )
}
