import { useEffect, useState, type FormEvent } from "react"
import { PartyPopper } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import styled from "styled-components"
import { DoneButton } from "@/components/challenge/DoneButton"
import { PageInner, PageShell, PageTitle, Subtle } from "@/components/layout/PageShell"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCoachPublicBySlug, type CoachPublicInfo } from "@/data/coach"
import { supabase } from "@/data/supabase"

const Center = styled(PageInner)`
  min-height: calc(100dvh - 64px);
  justify-content: center;
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: var(--card);
  box-shadow: 0 12px 32px -18px oklch(0.4 0.05 50 / 0.35);
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 1rem;
    font-weight: 600;
  }

  input {
    height: 48px;
    font-size: 1rem;
  }
`

const ConsentRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  line-height: 1.55;
  cursor: pointer;

  button[role="checkbox"] {
    margin-top: 3px;
    flex-shrink: 0;
  }

  a {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const ThankYou = styled(Card)`
  text-align: center;
  align-items: center;

  svg {
    color: var(--primary);
  }

  h1 {
    margin: 0;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
`

export default function RegisterPage() {
  const { slug } = useParams<{ slug: string }>()
  const [coach, setCoach] = useState<CoachPublicInfo | null | undefined>(undefined)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentHoldon, setConsentHoldon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!slug) {
      setCoach(null)
      return
    }
    let cancelled = false
    getCoachPublicBySlug(slug)
      .then((data) => {
        if (!cancelled) setCoach(data)
      })
      .catch(() => {
        if (!cancelled) setCoach(null)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    document.title = coach
      ? `הרשמה לאתגר של ${coach.name}`
      : 'הרשמה – אתגר "3 ימים חוזרים לשגרה"'
  }, [coach])

  const canSubmit =
    name.trim() && phone.trim() && email.trim() && consentPrivacy && consentHoldon && !submitting

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !slug) return
    setSubmitting(true)
    setError("")

    if (!supabase) {
      setError("ההרשמה אינה זמינה כרגע. נסו שוב מאוחר יותר.")
      setSubmitting(false)
      return
    }

    const { error } = await supabase.rpc("submit_registration", {
      coach_slug: slug,
      full_name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      consent_privacy: consentPrivacy,
      consent_holdon: consentHoldon,
    })

    if (error) {
      console.error("Failed to submit registration", error)
      setError("משהו השתבש. נסו שוב, ואם זה חוזר - כתבו לנו בוואטסאפ.")
      setSubmitting(false)
      return
    }

    setDone(true)
  }

  if (coach === undefined) {
    return (
      <PageShell>
        <Center>
          <Subtle>טוען...</Subtle>
        </Center>
      </PageShell>
    )
  }

  if (coach === null) {
    return (
      <PageShell>
        <Center>
          <Card>
            <PageTitle as="h1">הקישור אינו תקין</PageTitle>
            <Subtle>ייתכן שהקישור הועתק בטעות.</Subtle>
          </Card>
        </Center>
      </PageShell>
    )
  }

  if (done) {
    return (
      <PageShell>
        <Center>
          <ThankYou>
            <PartyPopper size={40} />
            <PageTitle as="h1">תודה שנרשמתם!</PageTitle>
            <p>נחזור אליכם בוואטסאפ.</p>
          </ThankYou>
        </Center>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Center>
        <Card as="form" onSubmit={(e) => void submit(e)}>
          <header>
            <PageTitle>הרשמה לאתגר</PageTitle>
            <Subtle>של {coach.name} · "3 ימים חוזרים לשגרה"</Subtle>
          </header>

          <Field>
            <Label htmlFor="reg-name">שם מלא</Label>
            <Input
              id="reg-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="reg-phone">טלפון</Label>
            <Input
              id="reg-phone"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="reg-email">מייל</Label>
            <Input
              id="reg-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <ConsentRow>
            <Checkbox
              checked={consentPrivacy}
              onCheckedChange={(v) => setConsentPrivacy(v === true)}
            />
            <span>
              קראתי ואני מסכים/ה ל<Link to={`/${slug}/privacy-policy`}>מדיניות הפרטיות</Link>.
            </span>
          </ConsentRow>

          <ConsentRow>
            <Checkbox
              checked={consentHoldon}
              onCheckedChange={(v) => setConsentHoldon(v === true)}
            />
            <span>אני מאשר/ת להעביר את פרטיי (שם, טלפון ומייל) ל-HoldOn לצורך רישום חינמי.</span>
          </ConsentRow>

          {error && <ErrorText>{error}</ErrorText>}

          <DoneButton type="submit" disabled={!canSubmit}>
            {submitting ? "שולחים..." : "נרשמים →"}
          </DoneButton>
        </Card>
      </Center>
    </PageShell>
  )
}
