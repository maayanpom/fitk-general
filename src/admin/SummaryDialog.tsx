import { useState } from "react"
import { Check, Copy, MessageCircle, TriangleAlert } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { whatsAppLinkForPhone } from "@/config"
import type { Coach } from "@/data/coach"
import type { Participant } from "@/data/participant"
import { generateSummary } from "@/summary/generate"
import { hasPlaceholders, renderWhatsappText } from "@/summary/render"
import { formatDateTime, saveSummary, type Registration, type SummaryRow } from "./adminData"

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  > div {
    flex: 1;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`

const Warning = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  border: 1.5px solid var(--destructive);
  background: color-mix(in oklab, var(--destructive) 8%, transparent);
  line-height: 1.6;

  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.05rem;
  }

  ul {
    margin: 0;
    padding-inline-start: 20px;
  }
`

const Note = styled.p`
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.95rem;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

// From the content doc's "handling concerning answers" section.
function ConcernWarning({ reasons }: { reasons: string[] }) {
  return (
    <Warning role="alert">
      <h3>
        <TriangleAlert size={20} />
        לא נוצרה טיוטה אוטומטית
      </h3>
      <span>בתשובות יש סימנים שמחייבים מענה אישי:</span>
      <ul>
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <strong>מה עושים לפי הנוהל</strong>
      <span>
        עונים בחום ובאופן אישי, לא בתבנית. מבקשים בעדינות שיפנו לרופא או לדיאטנית מורשית, ואם
        רלוונטי לאיש בריאות הנפש. אם יש סכנה מיידית, מפנים לחירום. לא נותנים מספרים, יעדים או
        תוכנית אכילה, לא מחזקים את ההתנהגות, לא מאבחנים ולא משתפים את התשובה בקבוצה.
      </span>
    </Warning>
  )
}

export function SummaryDialog({
  target,
  coach,
  summary,
  onClose,
  onSaved,
}: {
  target: { participant: Participant; registration: Registration } | null
  coach: Coach
  summary: SummaryRow | undefined
  onClose: () => void
  onSaved: () => void
}) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      {target && (
        <DialogContent dir="rtl" className="max-h-[90dvh] gap-4 overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              סיכום אישי: {target.registration.fullName}
            </DialogTitle>
            <DialogDescription>
              טיוטה לפי כללים קבועים, בלי AI. אפשר לערוך לפני השליחה.
            </DialogDescription>
          </DialogHeader>
          <SummaryBody
            key={target.participant.participantId}
            target={target}
            coach={coach}
            summary={summary}
            onSaved={onSaved}
          />
        </DialogContent>
      )}
    </Dialog>
  )
}

function SummaryBody({
  target: { participant, registration },
  coach,
  summary,
  onSaved,
}: {
  target: { participant: Participant; registration: Registration }
  coach: Coach
  summary: SummaryRow | undefined
  onSaved: () => void
}) {
  const [draft, setDraft] = useState(summary?.draft ?? "")
  const [sentAt, setSentAt] = useState(summary?.sentAt ?? null)
  const [couponCode, setCouponCode] = useState("")
  const [couponExpiresAt, setCouponExpiresAt] = useState("")
  const [notice, setNotice] = useState<{ kind: "concern"; reasons: string[] } | { kind: "info"; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    const result = generateSummary(participant, {
      longGapHours: coach.longGapHours,
      couponText: coach.couponText,
      couponCode,
      couponExpiresAt,
      communityUrl: coach.communityUrl,
      toolboxLink: `${window.location.origin}/start/${participant.participantId}/toolbox`,
    })

    if (result.kind === "concern") {
      setNotice({ kind: "concern", reasons: result.reasons })
      return
    }
    if (result.kind === "incomplete") {
      setNotice({
        kind: "info",
        text: `הסיכום זמין אחרי שכל שלושת הימים הושלמו. חסרים: ${result.missingDays.map((d) => `יום ${d}`).join(", ")}.`,
      })
      return
    }
    setNotice(null)
    setDraft(renderWhatsappText(result.data, coach.name, coach.summaryDeliveryText))
  }

  const persist = async (nextSentAt: string | null) => {
    setBusy(true)
    setError("")
    try {
      await saveSummary(coach.id, participant.participantId, draft, nextSentAt)
      setSentAt(nextSentAt)
      onSaved()
    } catch (err) {
      console.error(err)
      setError("השמירה נכשלה. נסו שוב.")
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable, nothing else to do.
    }
  }

  const notReady = !draft.trim() || hasPlaceholders(draft)

  return (
    <Stack>
      <Row>
        <div>
          <Label htmlFor="coupon-code">קוד קופון האתגר</Label>
          <Input
            id="coupon-code"
            dir="ltr"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="coupon-expires">בתוקף עד</Label>
          <Input
            id="coupon-expires"
            placeholder="למשל 31.10.2026"
            value={couponExpiresAt}
            onChange={(e) => setCouponExpiresAt(e.target.value)}
          />
        </div>
      </Row>

      <Actions>
        <Button onClick={generate}>{draft ? "יצירת טיוטה מחדש" : "יצירת טיוטה"}</Button>
      </Actions>

      {notice?.kind === "concern" && <ConcernWarning reasons={notice.reasons} />}
      {notice?.kind === "info" && <Note>{notice.text}</Note>}

      {notice?.kind !== "concern" && (
        <>
          <Textarea
            aria-label="טיוטת הסיכום"
            rows={14}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {draft && hasPlaceholders(draft) && (
            <Note>יש בטיוטה שדות שעוד לא מולאו, כמו {"{קוד}"} או {"{תאריך}"}. השלימו אותם לפני השליחה.</Note>
          )}

          <Actions>
            <Button variant="outline" disabled={!draft.trim()} onClick={() => void copy()}>
              {copied ? <Check /> : <Copy />}
              העתקה
            </Button>
            <Button variant="outline" disabled={busy || !draft.trim()} onClick={() => void persist(sentAt)}>
              שמירת טיוטה
            </Button>
            <Button asChild disabled={notReady}>
              <a
                href={notReady ? undefined : whatsAppLinkForPhone(registration.phone, draft)}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={notReady}
              >
                <MessageCircle />
                פתיחה בוואטסאפ
              </a>
            </Button>
            <Button
              variant="outline"
              disabled={busy || !draft.trim()}
              onClick={() => void persist(sentAt ? null : new Date().toISOString())}
            >
              {sentAt ? "ביטול סימון נשלח" : "סימון נשלח"}
            </Button>
          </Actions>
          {sentAt && <Note>נשלח {formatDateTime(sentAt)}</Note>}
        </>
      )}

      {error && <Note style={{ color: "var(--destructive)" }}>{error}</Note>}
    </Stack>
  )
}
