import { useEffect, useState, type FormEvent } from "react"
import { MessageCircle, PartyPopper } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import styled from "styled-components"
import { DoneButton } from "@/components/challenge/DoneButton"
import { PageInner, PageShell, PageTitle, Subtle } from "@/components/layout/PageShell"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCoachPublicBySlug, type CoachPublicInfo } from "@/data/coach"
import { isValidEmail, isValidPhone, normalizePhone } from "@/admin/phone"
import { whatsAppLinkForPhone } from "@/config"
import { supabase } from "@/data/supabase"

const SERVER_ERRORS: Record<string, string> = {
  "too many requests": "יש עומס כרגע. נסו שוב בעוד כמה דקות.",
  "invalid phone": "מספר הטלפון אינו תקין. בדקו ונסו שוב.",
  "invalid email": "כתובת האימייל אינה תקינה. בדקו ונסו שוב.",
  "name, phone and email are required": "יש למלא שם, טלפון ואימייל.",
  "privacy and messages consents are required": "יש לאשר את מדיניות הפרטיות וקבלת הודעות.",
  "holdon consent is required": "יש לאשר את ההרשמה ל-HoldOn.",
  "unknown coach link": "הקישור אינו תקין. פנו למאמנת שלכם לקבלת קישור חדש.",
}

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
  box-shadow: 0 12px 32px -18px oklch(0.3 0.06 300 / 0.35);
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

const Honeypot = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
`

const FieldError = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.95rem;
  line-height: 1.5;
`

const Steps = styled.ol`
  margin: 0;
  padding: 14px 16px;
  padding-inline-start: 36px;
  border-radius: calc(var(--radius) * 1.2);
  background: var(--selected);
  color: var(--deep);
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.6;
`

const NextButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 999px;
  border: 1.5px solid var(--primary);
  color: var(--primary);
  font-weight: 700;
  text-decoration: none;
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
  const [consentMessages, setConsentMessages] = useState(false)
  const [consentHoldon, setConsentHoldon] = useState(false)
  const [website, setWebsite] = useState("") // honeypot, must stay empty
  const [touched, setTouched] = useState({ name: false, phone: false, email: false })
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

  const holdonRequired = coach?.requireHoldonConsent ?? true
  const errors = {
    name: name.trim() ? "" : "נא למלא שם מלא",
    phone: isValidPhone(normalizePhone(phone))
      ? ""
      : "מספר הטלפון נראה לא תקין. למשל 050-1234567",
    email: isValidEmail(email.trim()) ? "" : "כתובת המייל נראית לא תקינה. למשל name@gmail.com",
  }
  const canSubmit =
    !errors.name &&
    !errors.phone &&
    !errors.email &&
    consentPrivacy &&
    consentMessages &&
    (consentHoldon || !holdonRequired) &&
    !submitting

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
      consent_messages: consentMessages,
      consent_holdon: consentHoldon,
      website,
    })

    if (error) {
      console.error("Failed to submit registration", error)
      const message = error.message ?? ""
      const known = Object.entries(SERVER_ERRORS).find(([key]) => message.includes(key))
      setError(
        known
          ? known[1]
          : `משהו השתבש (${message || error.code || "שגיאה לא ידועה"}). נסו שוב, ואם זה חוזר - כתבו לנו בוואטסאפ.`,
      )
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
            <PageTitle as="h1">נרשמתם!</PageTitle>
            <p>נחזור אליכם בוואטסאפ עם קישור אישי לימי האתגר.</p>
            {coach.phone && (
              <NextButton
                href={whatsAppLinkForPhone(coach.phone, "היי, נרשמתי לאתגר 🙂")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                אפשר גם לכתוב לנו כבר עכשיו
              </NextButton>
            )}
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
            <Subtle>האתגר של {coach.name}: 3 ימים חוזרים לשגרה</Subtle>
          </header>

          <Steps>
            <li>נרשמים כאן, זה לוקח דקה.</li>
            <li>{coach.name} מסדרת עבורכם רישום חינמי ל-HoldOn.</li>
            <li>מקבלים בוואטסאפ קישור אישי לכל יום, כמה דקות ביום.</li>
          </Steps>

          <Subtle>
            האתגר בשיתוף HoldOn. ההשתתפות מותנית ברישום חינמי לאתר HoldOn, שיבוצע עבורכם על ידי{" "}
            {coach.name} לאחר אישורכם.
          </Subtle>

          <Field>
            <Label htmlFor="reg-name">שם מלא</Label>
            <Input
              id="reg-name"
              autoComplete="name"
              value={name}
              aria-invalid={touched.name && Boolean(errors.name)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              onChange={(e) => setName(e.target.value)}
            />
            {touched.name && errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>

          <Field>
            <Label htmlFor="reg-phone">טלפון</Label>
            <Input
              id="reg-phone"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              value={phone}
              aria-invalid={touched.phone && Boolean(errors.phone)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              onChange={(e) => setPhone(e.target.value)}
            />
            {touched.phone && errors.phone && <FieldError>{errors.phone}</FieldError>}
          </Field>

          <Field>
            <Label htmlFor="reg-email">מייל</Label>
            <Input
              id="reg-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              aria-invalid={touched.email && Boolean(errors.email)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              onChange={(e) => setEmail(e.target.value)}
            />
            {touched.email && errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>

          <Honeypot aria-hidden="true">
            <label htmlFor="reg-website">אתר</label>
            <input
              id="reg-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Honeypot>

          <ConsentRow>
            <Checkbox
              checked={consentPrivacy}
              onCheckedChange={(v) => setConsentPrivacy(v === true)}
            />
            <span>
              קראתי את{" "}
              {coach.privacyUrl ? (
                <a href={coach.privacyUrl} target="_blank" rel="noopener noreferrer">
                  מדיניות הפרטיות
                </a>
              ) : (
                <Link to={`/${slug}/privacy-policy`}>מדיניות הפרטיות</Link>
              )}{" "}
              והסכמתי לה, ואני מעל גיל 18.
            </span>
          </ConsentRow>

          <ConsentRow>
            <Checkbox
              checked={consentMessages}
              onCheckedChange={(v) => setConsentMessages(v === true)}
            />
            <span>הסכמתי לקבל הודעות בוואטסאפ ובמייל בנוגע לאתגר.</span>
          </ConsentRow>

          <ConsentRow>
            <Checkbox
              checked={consentHoldon}
              onCheckedChange={(v) => setConsentHoldon(v === true)}
            />
            <span>הסכמתי להעביר את פרטיי (שם, טלפון ומייל) ל-HoldOn לצורך רישום חינמי לאתר.</span>
          </ConsentRow>

          {error && <ErrorText>{error}</ErrorText>}

          <DoneButton type="submit" disabled={!canSubmit}>
            {submitting ? "שולחים..." : "נרשמים"}
          </DoneButton>
        </Card>
      </Center>
    </PageShell>
  )
}
