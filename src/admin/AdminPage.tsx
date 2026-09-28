import { useCallback, useEffect, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { Link as LinkIcon, LogOut, MessageCircle, RefreshCw } from "lucide-react"
import styled from "styled-components"
import { PageTitle, Subtle } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { whatsAppLinkForPhone } from "@/config"
import { checkIsSuperAdmin, fetchOwnCoach, type Coach } from "@/data/coach"
import type { Participant } from "@/data/participant"
import { supabase } from "@/data/supabase"
import {
  createParticipant,
  fetchParticipants,
  fetchRegistrations,
  formatRelativeDay,
  linkRegistrationToParticipant,
  type Registration,
} from "./adminData"
import { CoachesList } from "./CoachesList"
import { CoachSettings } from "./CoachSettings"
import { ParticipantDetails } from "./ParticipantDetails"
import { ParticipantLinkPicker } from "./ParticipantLinkPicker"

const Shell = styled.main`
  min-height: 100dvh;
  padding: 32px 16px 56px;
  background: var(--background);
`

const Inner = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1.5px solid ${({ $active }) => ($active ? "var(--primary)" : "var(--border)")};
  background: ${({ $active }) => ($active ? "var(--accent)" : "var(--card)")};
  color: var(--foreground);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
`

const Panel = styled.div`
  padding: 8px;
  border-radius: 18px;
  background: var(--card);
  box-shadow: 0 6px 20px -14px oklch(0.4 0.05 50 / 0.35);
`

const LoginForm = styled.form`
  max-width: 380px;
  margin: 10vh auto 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px 22px;
  border-radius: 20px;
  background: var(--card);
  box-shadow: 0 12px 32px -18px oklch(0.4 0.05 50 / 0.35);

  input {
    height: 44px;
  }
`

const AddParticipantCard = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  background: var(--secondary);

  label {
    font-weight: 600;
    font-size: 0.9rem;
  }
`

const AddField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;

  input {
    height: 40px;
    background: var(--card);
  }
`

const NameButton = styled.button`
  padding: 0;
  border: 0;
  background: none;
  color: var(--primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
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

const AddedRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
`

const AddedMark = styled.span`
  font-weight: 600;
  color: var(--primary);
  font-size: 0.85rem;
`

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const done = (iso: string) => (iso ? "✓" : "—")
const consentMark = (v: boolean) => (v ? "✓" : "—")

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    document.title = "דשבורד האתגר"
  }, [])

  if (!supabase) {
    return (
      <Shell>
        <Inner>
          <PageTitle>דשבורד</PageTitle>
          <Subtle>
            Supabase עדיין לא מחובר. יש להגדיר VITE_SUPABASE_URL ו־VITE_SUPABASE_ANON_KEY בקובץ
            .env.local.
          </Subtle>
        </Inner>
      </Shell>
    )
  }

  if (checkingSession) return <Shell />

  return <Shell>{session ? <Dashboard /> : <Login />}</Shell>
}

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    if (error) setError("אימייל או סיסמה שגויים")
    setBusy(false)
  }

  return (
    <LoginForm onSubmit={(e) => void submit(e)}>
      <PageTitle>כניסה לדשבורד</PageTitle>
      <Label htmlFor="email">אימייל</Label>
      <Input
        id="email"
        type="email"
        dir="ltr"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Label htmlFor="password">סיסמה</Label>
      <Input
        id="password"
        type="password"
        dir="ltr"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" size="lg" disabled={busy || !email || !password}>
        כניסה
      </Button>
    </LoginForm>
  )
}

type Tab = "participants" | "registrations" | "settings" | "coaches"

function Dashboard() {
  const [tab, setTab] = useState<Tab>("participants")
  const [coach, setCoach] = useState<Coach | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "no-profile" | "error">("loading")
  const [selected, setSelected] = useState<Participant | null>(null)
  const [linksFor, setLinksFor] = useState<Participant | null>(null)
  const [prefill, setPrefill] = useState<{
    name: string
    key: number
    registrationId?: string
  } | null>(null)

  const load = useCallback(async () => {
    try {
      const ownCoach = await fetchOwnCoach()
      if (!ownCoach) {
        setStatus("no-profile")
        return
      }
      setCoach(ownCoach)
      setIsSuperAdmin(await checkIsSuperAdmin())
    } catch (err) {
      console.error(err)
      setStatus("error")
      return
    }

    // Independent try/catch per table: one failing doesn't block the other.
    const [p, r] = await Promise.allSettled([fetchParticipants(), fetchRegistrations()])
    if (p.status === "fulfilled") setParticipants(p.value)
    else console.error(p.reason)
    if (r.status === "fulfilled") setRegistrations(r.value)
    else console.error(r.reason)

    setStatus(p.status === "fulfilled" ? "ready" : "error")
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Inner>
      <TopBar>
        <div>
          <PageTitle>דשבורד האתגר</PageTitle>
          {status === "ready" && (
            <Subtle>
              {participants.length} משתתפים · {registrations.length} הרשמות
            </Subtle>
          )}
        </div>
        <Actions>
          <Button
            variant="outline"
            onClick={() => {
              setStatus("loading")
              void load()
            }}
          >
            <RefreshCw />
            רענון
          </Button>
          <Button variant="ghost" onClick={() => void supabase!.auth.signOut()}>
            <LogOut />
            יציאה
          </Button>
        </Actions>
      </TopBar>

      {status === "loading" && <Subtle>טוען...</Subtle>}
      {status === "no-profile" && (
        <ErrorText>לא נמצא פרופיל מאמנת לחשבון הזה. פני אלינו לעזרה.</ErrorText>
      )}
      {status === "error" && <ErrorText>לא הצלחנו לטעון את הנתונים. נסו לרענן.</ErrorText>}

      {status === "ready" && coach && (
        <>
          <Tabs>
            <TabButton
              type="button"
              $active={tab === "participants"}
              onClick={() => setTab("participants")}
            >
              משתתפים
            </TabButton>
            <TabButton
              type="button"
              $active={tab === "registrations"}
              onClick={() => setTab("registrations")}
            >
              הרשמות
            </TabButton>
            <TabButton
              type="button"
              $active={tab === "settings"}
              onClick={() => setTab("settings")}
            >
              הגדרות
            </TabButton>
            {isSuperAdmin && (
              <TabButton
                type="button"
                $active={tab === "coaches"}
                onClick={() => setTab("coaches")}
              >
                מאמנות במערכת
              </TabButton>
            )}
          </Tabs>

          {tab === "participants" && (
            <>
              <AddParticipant
                key={prefill?.key ?? "default"}
                initialName={prefill?.name ?? ""}
                registrationId={prefill?.registrationId}
                onCreated={() => void load()}
              />
              <Panel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start">שם</TableHead>
                      <TableHead className="text-center">יום 1</TableHead>
                      <TableHead className="text-center">יום 2</TableHead>
                      <TableHead className="text-center">יום 3</TableHead>
                      <TableHead className="text-center">ארגז כלים</TableHead>
                      <TableHead className="text-start">עדכון אחרון</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          עוד אין משתתפים
                        </TableCell>
                      </TableRow>
                    )}
                    {participants.map((p) => (
                      <TableRow key={p.participantId}>
                        <TableCell>
                          <NameButton type="button" onClick={() => setSelected(p)}>
                            {p.firstName}
                          </NameButton>
                        </TableCell>
                        <TableCell className="text-center">{done(p.day1.completedAt)}</TableCell>
                        <TableCell className="text-center">{done(p.day2.completedAt)}</TableCell>
                        <TableCell className="text-center">{done(p.day3.completedAt)}</TableCell>
                        <TableCell className="text-center">
                          {done(p.toolbox.completedAt)}
                        </TableCell>
                        <TableCell>{formatRelativeDay(p.updatedAt)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setLinksFor(p)}>
                            <LinkIcon />
                            קישורים
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Panel>
            </>
          )}

          {tab === "registrations" && (
            <Panel>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">שם</TableHead>
                    <TableHead className="text-start">טלפון</TableHead>
                    <TableHead className="text-start">מייל</TableHead>
                    <TableHead className="text-center">מדיניות</TableHead>
                    <TableHead className="text-center">HoldOn</TableHead>
                    <TableHead className="text-start">נרשם/ה</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        עוד אין הרשמות
                      </TableCell>
                    </TableRow>
                  )}
                  {registrations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.fullName}</TableCell>
                      <TableCell>
                        <PhoneLink
                          href={whatsAppLinkForPhone(
                            r.phone,
                            `היי ${r.fullName}, ראיתי שנרשמת לאתגר "3 ימים חוזרים לשגרה" 🙂`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle size={14} />
                          {r.phone}
                        </PhoneLink>
                      </TableCell>
                      <TableCell dir="ltr" className="text-start">
                        {r.email}
                      </TableCell>
                      <TableCell className="text-center">
                        {consentMark(r.consentPrivacy)}
                      </TableCell>
                      <TableCell className="text-center">{consentMark(r.consentHoldon)}</TableCell>
                      <TableCell>{formatRelativeDay(r.createdAt)}</TableCell>
                      <TableCell>
                        {r.participantId ? (
                          <AddedRow>
                            <AddedMark>✓ נוסף/ה</AddedMark>
                            <ParticipantLinkPicker participantId={r.participantId} />
                          </AddedRow>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPrefill({
                                name: r.fullName,
                                key: Date.now(),
                                registrationId: r.id,
                              })
                              setTab("participants")
                            }}
                          >
                            → הוספת משתתף/ת
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          )}

          {tab === "settings" && (
            <CoachSettings coach={coach} onSaved={setCoach} />
          )}

          {tab === "coaches" && isSuperAdmin && <CoachesList />}
        </>
      )}

      <ParticipantDetails participant={selected} onClose={() => setSelected(null)} />

      <Dialog open={Boolean(linksFor)} onOpenChange={(open) => !open && setLinksFor(null)}>
        {linksFor && (
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>הקישורים של {linksFor.firstName}</DialogTitle>
            </DialogHeader>
            <ParticipantLinkPicker participantId={linksFor.participantId} />
          </DialogContent>
        )}
      </Dialog>
    </Inner>
  )
}

function AddParticipant({
  initialName = "",
  registrationId,
  onCreated,
}: {
  initialName?: string
  registrationId?: string
  onCreated: () => void
}) {
  const [name, setName] = useState(initialName)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [createdId, setCreatedId] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError("")
    try {
      const id = await createParticipant(name)
      if (registrationId) await linkRegistrationToParticipant(registrationId, id)
      setCreatedId(id)
      setName("")
      onCreated()
    } catch (err) {
      console.error(err)
      setError("יצירת המשתתף/ת נכשלה. נסו שוב.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <AddParticipantCard onSubmit={(e) => void submit(e)}>
      <AddField>
        <Label htmlFor="new-participant-name">משתתף/ת חדש/ה</Label>
        <Input
          id="new-participant-name"
          placeholder="שם"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </AddField>
      <Button type="submit" disabled={!name.trim() || creating}>
        צור קישור אישי
      </Button>
      {error && <ErrorText>{error}</ErrorText>}
      {createdId && <ParticipantLinkPicker participantId={createdId} />}
    </AddParticipantCard>
  )
}
