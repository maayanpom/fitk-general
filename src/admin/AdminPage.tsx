import { useCallback, useEffect, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { Link as LinkIcon, LogOut, RefreshCw } from "lucide-react"
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
import { checkIsSuperAdmin, fetchOwnCoach, type Coach } from "@/data/coach"
import type { Participant } from "@/data/participant"
import { supabase } from "@/data/supabase"
import {
  fetchParticipants,
  fetchRegistrations,
  fetchSummaries,
  formatRelativeDay,
  type Registration,
  type SummaryRow,
} from "./adminData"
import { CoachesList } from "./CoachesList"
import { CoachSettings } from "./CoachSettings"
import { ParticipantDetails } from "./ParticipantDetails"
import { ParticipantLinkPicker } from "./ParticipantLinkPicker"
import { ResultsTab } from "./ResultsTab"
import { RegistrationsTab } from "./RegistrationsTab"
import { SummaryDialog } from "./SummaryDialog"

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
  box-shadow: 0 6px 20px -14px oklch(0.3 0.06 300 / 0.35);
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
  box-shadow: 0 12px 32px -18px oklch(0.3 0.06 300 / 0.35);

  input {
    height: 44px;
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

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const done = (iso: string) => (iso ? "✓" : "—")

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

type Tab = "registrations" | "participants" | "results" | "settings" | "coaches"

function Dashboard() {
  const [tab, setTab] = useState<Tab>("registrations")
  const [coach, setCoach] = useState<Coach | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [summaries, setSummaries] = useState<SummaryRow[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "no-profile" | "error">("loading")
  const [selected, setSelected] = useState<Participant | null>(null)
  const [linksFor, setLinksFor] = useState<Participant | null>(null)
  const [summaryFor, setSummaryFor] = useState<{
    participant: Participant
    registration: Registration
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
    const [p, r, sm] = await Promise.allSettled([
      fetchParticipants(),
      fetchRegistrations(),
      fetchSummaries(),
    ])
    if (sm.status === "fulfilled") setSummaries(sm.value)
    else console.error(sm.reason)
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
        <ErrorText>לא נמצא פרופיל מאמן/ת לחשבון הזה. פנו אלינו לעזרה.</ErrorText>
      )}
      {status === "error" && <ErrorText>לא הצלחנו לטעון את הנתונים. נסו לרענן.</ErrorText>}

      {status === "ready" && coach && (
        <>
          <Tabs>
            <TabButton
              type="button"
              $active={tab === "registrations"}
              onClick={() => setTab("registrations")}
            >
              נרשמים
            </TabButton>
            <TabButton
              type="button"
              $active={tab === "participants"}
              onClick={() => setTab("participants")}
            >
              התקדמות
            </TabButton>
            <TabButton
              type="button"
              $active={tab === "results"}
              onClick={() => setTab("results")}
            >
              תוצאות
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
            <RegistrationsTab
              coach={coach}
              registrations={registrations}
              participants={participants}
              summaries={summaries}
              reload={() => void load()}
              onOpenAnswers={setSelected}
              onOpenSummary={(participant, registration) => setSummaryFor({ participant, registration })}
            />
          )}

          {tab === "results" && (
            <ResultsTab registrations={registrations} participants={participants} />
          )}

          {tab === "settings" && (
            <CoachSettings coach={coach} onSaved={setCoach} />
          )}

          {tab === "coaches" && isSuperAdmin && <CoachesList currentCoachId={coach.id} />}
        </>
      )}

      {coach && (
        <SummaryDialog
          target={summaryFor}
          coach={coach}
          summary={summaries.find((x) => x.participantId === summaryFor?.participant.participantId)}
          onClose={() => setSummaryFor(null)}
          onSaved={() => void load()}
        />
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
