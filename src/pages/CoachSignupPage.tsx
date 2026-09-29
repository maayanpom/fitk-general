import { useEffect, useState, type FormEvent } from "react"
import { Check, Copy } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { DoneButton } from "@/components/challenge/DoneButton"
import { PageInner, PageShell, PageTitle, Subtle } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpCoach, type Coach } from "@/data/coach"
import { supabase } from "@/data/supabase"

const Center = styled(PageInner)`
  min-height: calc(100dvh - 64px);
  justify-content: center;
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
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

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    height: 44px;
    font-size: 0.9rem;
    background: var(--secondary);
  }
`

function friendlyError(message: string) {
  if (message.includes("already registered")) return "כבר קיים חשבון עם המייל הזה. נסו להתחבר."
  if (message.includes("Password")) return "הסיסמה קצרה מדי - צריך לפחות 6 תווים."
  return "ההרשמה נכשלה. נסו שוב."
}

export default function CoachSignupPage() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<Coach | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = "הרשמה להפעלת האתגר"
  }, [])

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false)
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      setAlreadyLoggedIn(Boolean(data.session))
      setCheckingSession(false)
    })
  }, [])

  const canSubmit = name.trim() && email.trim() && password.length >= 6 && phone.trim() && !submitting

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    try {
      const coach = await signUpCoach({ name, email, password, phone })
      setCreated(coach)
    } catch (err) {
      console.error("Coach signup failed", err)
      setError(friendlyError(err instanceof Error ? err.message : ""))
    } finally {
      setSubmitting(false)
    }
  }

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable - the link is still selectable by hand.
    }
  }

  if (checkingSession) return <PageShell />
  if (alreadyLoggedIn) return <Navigate to="/admin" replace />

  if (created) {
    const link = `${window.location.origin}/${created.slug}/register`
    return (
      <PageShell>
        <Center>
          <Card>
            <PageTitle as="h1">ברוכים הבאים, {created.name}!</PageTitle>
            <Subtle>זה הקישור הציבורי שלך להרשמה לאתגר - אפשר לשתף אותו בכל מקום.</Subtle>
            <LinkRow>
              <Input readOnly dir="ltr" value={link} onFocus={(e) => e.target.select()} />
              <Button type="button" variant="outline" size="icon" onClick={() => void copy(link)}>
                {copied ? <Check /> : <Copy />}
              </Button>
            </LinkRow>
            <DoneButton onClick={() => navigate("/admin")}>לדשבורד שלי →</DoneButton>
          </Card>
        </Center>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Center>
        <Card as="form" onSubmit={(e) => void submit(e)}>
          <header>
            <PageTitle>הרשמה להפעלת האתגר</PageTitle>
            <Subtle>פותחים את החשבון שלך לניהול האתגר</Subtle>
          </header>

          <Field>
            <Label htmlFor="coach-name">שם (יוצג למשתתפים)</Label>
            <Input id="coach-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field>
            <Label htmlFor="coach-email">אימייל</Label>
            <Input
              id="coach-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="coach-password">סיסמה</Label>
            <Input
              id="coach-password"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="coach-phone">טלפון (וואטסאפ)</Label>
            <Input
              id="coach-phone"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          {error && <ErrorText>{error}</ErrorText>}

          <DoneButton type="submit" disabled={!canSubmit}>
            {submitting ? "יוצרים חשבון..." : "יצירת חשבון →"}
          </DoneButton>
        </Card>
      </Center>
    </PageShell>
  )
}
