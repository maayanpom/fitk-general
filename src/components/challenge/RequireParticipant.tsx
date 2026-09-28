import type { ReactNode } from "react"
import styled from "styled-components"
import { PageInner, PageShell, PageTitle, Subtle } from "@/components/layout/PageShell"
import { useParticipantState } from "@/data/participantContext"

const Center = styled(PageInner)`
  min-height: calc(100dvh - 64px);
  justify-content: center;
  text-align: center;
`

const Card = styled.div`
  padding: 28px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: var(--card);
  box-shadow: 0 12px 32px -18px oklch(0.4 0.05 50 / 0.35);
`

// Every participant now arrives via a coach-issued personal link
// (/start/:code), which is the only thing that can identify which coach owns
// them - there's no generic "register here" page to send a bare visit to.
function NoPersonalLink() {
  return (
    <PageShell>
      <Center>
        <Card>
          <PageTitle as="h1">צריך קישור אישי</PageTitle>
          <Subtle>
            כדי להשתתף באתגר צריך קישור אישי מהמאמן/ת שלך. אם עדיין אין לך קישור, אפשר לפנות
            אליו/ה.
          </Subtle>
        </Card>
      </Center>
    </PageShell>
  )
}

export function RequireParticipant({ children }: { children: ReactNode }) {
  const { participant } = useParticipantState()

  if (!participant) return <NoPersonalLink />

  return children
}
