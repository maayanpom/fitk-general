import { useState, type FormEvent, type ReactNode } from "react"
import styled from "styled-components"
import { normalizePhone, isValidPhone } from "@/admin/phone"
import { PageInner, PageShell, PageTitle, Subtle } from "@/components/layout/PageShell"
import { whatsAppLinkForPhone } from "@/config"
import { useParticipantState } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"

const Center = styled(PageInner)`
  min-height: calc(100dvh - 64px);
  justify-content: center;
  text-align: center;
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: var(--card);
  box-shadow: 0 12px 32px -18px oklch(0.3 0.06 300 / 0.35);
`

const PhoneInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  font: inherit;
  font-size: 1.1rem;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
`

const Button = styled.button`
  padding: 12px 16px;
  font: inherit;
  font-weight: 700;
  color: var(--primary-foreground);
  background: var(--primary);
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
  text-decoration: none;
  &:disabled {
    opacity: 0.6;
  }
`

// Without a coach slug in the URL (old /challenge-day-N links) there is no one to
// identify against, so the person is sent back to the coach for the right link.
function NoPersonalLink() {
  return (
    <PageShell>
      <Center>
        <Card>
          <PageTitle as="h1">צריך קישור אישי</PageTitle>
          <Subtle>
            כדי להשתתף באתגר צריך קישור ממי שמפעיל את האתגר. אם עדיין אין לכם קישור, אפשר לפנות
            אליהם.
          </Subtle>
        </Card>
      </Center>
    </PageShell>
  )
}

// One field: the phone number used at registration. After the first match the
// browser remembers the participant, so later days skip this screen.
function PhoneGate({ coachSlug }: { coachSlug: string }) {
  const { identifyByPhone } = useParticipantState()
  const coach = useCoachPublicInfo(coachSlug)
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (!isValidPhone(normalized)) {
      setNotFound(true)
      return
    }
    setBusy(true)
    setNotFound(false)
    const ok = await identifyByPhone(coachSlug, normalized)
    // On success the participant is stored and this gate unmounts.
    if (!ok) {
      setNotFound(true)
      setBusy(false)
    }
  }

  return (
    <PageShell>
      <Center>
        <Card as="form" onSubmit={submit}>
          <PageTitle as="h1">ברוכים הבאים</PageTitle>
          <Subtle>הזינו את מספר הטלפון שמילאתם בהרשמה</Subtle>
          <PhoneInput
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="052-1234567"
            aria-label="מספר טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" disabled={busy || !phone.trim()}>
            {busy ? "בודקים..." : "כניסה"}
          </Button>
          {notFound && (
            <>
              <Subtle>לא מצאנו אתכם, כתבו לי ואעזור</Subtle>
              {coach?.phone && (
                <Button
                  as="a"
                  href={whatsAppLinkForPhone(coach.phone, "היי, לא הצלחתי להיכנס לאתגר 🙂")}
                  target="_blank"
                  rel="noreferrer"
                >
                  כתבו לי בוואטסאפ
                </Button>
              )}
            </>
          )}
        </Card>
      </Center>
    </PageShell>
  )
}

export function RequireParticipant({
  children,
  coachSlug,
}: {
  children: ReactNode
  coachSlug?: string
}) {
  const { participant } = useParticipantState()

  if (!coachSlug) return participant ? children : <NoPersonalLink />
  // A participant remembered from another coach's link must identify again here.
  if (!participant || participant.coachSlug !== coachSlug) return <PhoneGate coachSlug={coachSlug} />

  return children
}
