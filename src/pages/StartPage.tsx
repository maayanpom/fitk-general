import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { PageInner, PageShell, PageTitle, Subtle } from "@/components/layout/PageShell"
import { ROOT_REDIRECT } from "@/config"
import { useParticipantState } from "@/data/participantContext"
import { PAGES } from "@/routes"

const VALID_SLUGS = new Set(PAGES.map((p) => p.slug))

const Center = styled(PageInner)`
  min-height: calc(100dvh - 64px);
  justify-content: center;
  text-align: center;
`

const ErrorCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: var(--card);
  box-shadow: 0 12px 32px -18px oklch(0.4 0.05 50 / 0.35);

`

export default function StartPage() {
  const { code, target } = useParams<{ code: string; target?: string }>()
  const destination = target && VALID_SLUGS.has(target) ? target : ROOT_REDIRECT
  const { adoptById } = useParticipantState()
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading")

  useEffect(() => {
    let cancelled = false
    if (!code) {
      setStatus("not-found")
      return
    }
    void adoptById(code).then((ok) => {
      if (!cancelled) setStatus(ok ? "found" : "not-found")
    })
    return () => {
      cancelled = true
    }
    // adoptById is stable for the provider's lifetime; re-running per code change is what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  if (status === "found") return <Navigate to={`/${destination}`} replace />

  if (status === "not-found") {
    return (
      <PageShell>
        <Center>
          <ErrorCard>
            <PageTitle as="h1">הקישור אינו תקין</PageTitle>
            <Subtle>
              ייתכן שהקישור הועתק בטעות. יש לפנות למאמנת שקישרה אליכם כדי לקבל קישור חדש.
            </Subtle>
          </ErrorCard>
        </Center>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Center>
        <Subtle>טוען...</Subtle>
      </Center>
    </PageShell>
  )
}
