import { useMemo, useState } from "react"
import { Check, FileText, MessageCircle, Trash2 } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { whatsAppLinkForPhone } from "@/config"
import type { Coach } from "@/data/coach"
import type { Participant } from "@/data/participant"
import {
  createParticipantForRegistration,
  deletePerson,
  formatRelativeDay,
  setHoldonRegistered,
  SOURCE_LABELS,
  type LeadSource,
  type Registration,
  type SummaryRow,
} from "./adminData"
import { CsvImportDialog, ManualAdd } from "./AddLeads"
import { ParticipantLinkPicker } from "./ParticipantLinkPicker"

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  input {
    height: 40px;
    max-width: 260px;
  }

  select {
    height: 40px;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0 8px;
    background: var(--card);
    font: inherit;
  }
`

const Panel = styled.div`
  padding: 8px;
  border-radius: 18px;
  background: var(--card);
  overflow-x: auto;
`

const PhoneLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  direction: ltr;
`

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const Cell = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
`

const Name = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
`

const Muted = styled.span`
  color: var(--muted-foreground);
  font-size: 0.8rem;
`

const dayDate = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" })

export function RegistrationsTab({
  coach,
  registrations,
  participants,
  summaries,
  reload,
  onOpenAnswers,
  onOpenSummary,
}: {
  coach: Coach
  registrations: Registration[]
  participants: Participant[]
  summaries: SummaryRow[]
  reload: () => void
  onOpenAnswers: (p: Participant) => void
  onOpenSummary: (p: Participant, r: Registration) => void
}) {
  const [query, setQuery] = useState("")
  const [source, setSource] = useState<"all" | LeadSource>("all")
  const [holdon, setHoldon] = useState<"all" | "yes" | "no">("all")
  const [importOpen, setImportOpen] = useState(false)
  const [linksFor, setLinksFor] = useState<Registration | null>(null)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState("")

  const byId = useMemo(() => new Map(participants.map((p) => [p.participantId, p])), [participants])
  const summaryById = useMemo(() => new Map(summaries.map((s) => [s.participantId, s])), [summaries])

  const filtered = registrations.filter((r) => {
    if (source !== "all" && r.source !== source) return false
    if (holdon === "yes" && !r.holdonRegisteredAt) return false
    if (holdon === "no" && r.holdonRegisteredAt) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.phone.includes(q.replace(/\D/g, "") || "\u0000") ||
      r.email.toLowerCase().includes(q)
    )
  })

  const run = async (id: string, action: () => Promise<unknown>, message: string) => {
    setBusyId(id)
    setError("")
    try {
      await action()
      reload()
    } catch (err) {
      console.error(err)
      setError(message)
    } finally {
      setBusyId("")
    }
  }

  const holdonBlocked = (r: Registration) => coach.requireHoldonConsent && !r.consentHoldonAt

  return (
    <Stack>
      <ManualAdd onAdded={reload} />

      <Toolbar>
        <Input
          placeholder="חיפוש לפי שם, טלפון או מייל"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="מקור"
          value={source}
          onChange={(e) => setSource(e.target.value as "all" | LeadSource)}
        >
          <option value="all">כל המקורות</option>
          {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          aria-label="HoldOn"
          value={holdon}
          onChange={(e) => setHoldon(e.target.value as "all" | "yes" | "no")}
        >
          <option value="all">HoldOn: הכל</option>
          <option value="yes">נרשמו ל-HoldOn</option>
          <option value="no">טרם נרשמו</option>
        </select>
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          ייבוא CSV מהמודעה
        </Button>
      </Toolbar>

      {error && <ErrorText>{error}</ErrorText>}

      <Panel>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">שם</TableHead>
              <TableHead className="text-start">טלפון</TableHead>
              <TableHead className="text-start">מייל</TableHead>
              <TableHead className="text-start">מקור</TableHead>
              <TableHead className="text-start">HoldOn</TableHead>
              <TableHead className="text-start">קישורים</TableHead>
              <TableHead className="text-center">התקדמות</TableHead>
              <TableHead className="text-start">סיכום</TableHead>
              <TableHead className="text-start">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  אין נרשמים להצגה
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => {
              const p = r.participantId ? byId.get(r.participantId) : undefined
              const completed = p
                ? [p.day1, p.day2, p.day3].filter((d) => d.completedAt).length
                : 0
              const summary = r.participantId ? summaryById.get(r.participantId) : undefined
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <Name>
                      {r.fullName}
                      <Muted>{formatRelativeDay(r.createdAt)}</Muted>
                    </Name>
                  </TableCell>
                  <TableCell>
                    <PhoneLink
                      href={whatsAppLinkForPhone(r.phone, `היי ${r.fullName}, `)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={14} />
                      {r.phone}
                    </PhoneLink>
                  </TableCell>
                  <TableCell dir="ltr" className="text-start">
                    {r.email || "—"}
                  </TableCell>
                  <TableCell>
                    {SOURCE_LABELS[r.source]}
                    {r.importBatch && <Muted> · {r.importBatch}</Muted>}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={r.holdonRegisteredAt ? "secondary" : "outline"}
                      disabled={busyId === r.id}
                      onClick={() =>
                        void run(
                          r.id,
                          () => setHoldonRegistered(r.id, !r.holdonRegisteredAt),
                          "העדכון נכשל. נסו שוב.",
                        )
                      }
                    >
                      {r.holdonRegisteredAt ? (
                        <>
                          <Check /> נרשם/ה {dayDate.format(new Date(r.holdonRegisteredAt))}
                        </>
                      ) : (
                        "סמנו כנרשם/ה"
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {r.participantId ? (
                      <Button size="sm" variant="outline" onClick={() => setLinksFor(r)}>
                        קישורים
                      </Button>
                    ) : holdonBlocked(r) ? (
                      <Muted>אין הסכמה ל-HoldOn</Muted>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busyId === r.id}
                        onClick={() =>
                          void run(
                            r.id,
                            () => createParticipantForRegistration(r.id),
                            "יצירת הקישורים נכשלה. נסו שוב.",
                          )
                        }
                      >
                        יצירת קישורים
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{p ? `${completed} מתוך 3` : "—"}</TableCell>
                  <TableCell>
                    {p ? (
                      <Button size="sm" variant="outline" onClick={() => onOpenSummary(p, r)}>
                        סיכום
                        {summary?.sentAt ? " · נשלח" : summary?.draft ? " · טיוטה" : ""}
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Cell>
                      {p && (
                        <Button size="sm" variant="outline" onClick={() => onOpenAnswers(p)}>
                          <FileText /> תשובות
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`מחיקת ${r.fullName}`}
                        disabled={busyId === r.id}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `למחוק את ${r.fullName} ואת כל התשובות שלהם? אי אפשר לשחזר.`,
                            )
                          )
                            return
                          void run(
                            r.id,
                            () => deletePerson(r.id, r.participantId),
                            "המחיקה נכשלה. נסו שוב.",
                          )
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </Cell>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Panel>

      <CsvImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        existing={registrations}
        onImported={reload}
      />

      <Dialog open={Boolean(linksFor)} onOpenChange={(o) => !o && setLinksFor(null)}>
        {linksFor?.participantId && (
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>הקישורים של {linksFor.fullName}</DialogTitle>
            </DialogHeader>
            <ParticipantLinkPicker participantId={linksFor.participantId} />
          </DialogContent>
        )}
      </Dialog>
    </Stack>
  )
}
