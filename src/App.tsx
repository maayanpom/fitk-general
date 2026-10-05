import { lazy, Suspense, useEffect } from "react"
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom"
import { RequireParticipant } from "@/components/challenge/RequireParticipant"
import { ROOT_REDIRECT } from "@/config"
import { ParticipantProvider } from "@/data/ParticipantProvider"
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage"
import RegisterPage from "@/pages/RegisterPage"
import StartPage from "@/pages/StartPage"
import { PAGES, type ChallengePage } from "@/routes"

// Coach-only screens are loaded on demand, so participants never download them.
const AdminPage = lazy(() => import("@/admin/AdminPage"))
const CoachSignupPage = lazy(() => import("@/pages/CoachSignupPage"))

function PageRoute({ page }: { page: ChallengePage }) {
  useEffect(() => {
    document.title = page.title
  }, [page.title])

  const { coachSlug } = useParams<{ coachSlug?: string }>()

  return (
    <RequireParticipant coachSlug={coachSlug}>
      <page.Component />
    </RequireParticipant>
  )
}

function StartRoute() {
  return (
    <ParticipantProvider>
      <StartPage />
    </ParticipantProvider>
  )
}

// Handles "/", short "/day-N" links, misspelled "challange-day-N" links and unknown paths.
function FallbackRedirect() {
  const { pathname } = useLocation()
  const alias = pathname.match(/^\/(?:day|challange-day)-(\d+)\/?$/i)
  const target = alias && PAGES.find((p) => p.slug === `challenge-day-${alias[1]}`)

  return <Navigate to={`/${target ? target.slug : ROOT_REDIRECT}`} replace />
}

export default function App() {
  return (
    <Suspense fallback={null}>
    <Routes>
      {PAGES.map((page) => (
        <Route
          key={page.slug}
          path={`/${page.slug}`}
          element={
            <ParticipantProvider>
              <PageRoute page={page} />
            </ParticipantProvider>
          }
        />
      ))}
      {/* Fixed per-coach links: /<coach>/day-1, /<coach>/day-2, /<coach>/day-3, /<coach>/toolbox */}
      {PAGES.map((page) => (
        <Route
          key={`coach-${page.slug}`}
          path={`/:coachSlug/${page.slug.replace(/^challenge-/, "")}`}
          element={
            <ParticipantProvider>
              <PageRoute page={page} />
            </ParticipantProvider>
          }
        />
      ))}
      <Route path="/coach-signup" element={<CoachSignupPage />} />
      <Route path="/start/:code" element={<StartRoute />} />
      <Route path="/start/:code/:target" element={<StartRoute />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/:slug/register" element={<RegisterPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/:slug/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
    </Suspense>
  )
}
