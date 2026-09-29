import styled from "styled-components"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { ToolDetails } from "@/toolbox/ToolDetails"
import { TOOLS } from "@/toolbox/tools"

// Preview-only page (rendered by scripts/generate-previews.mjs, not routed in
// the app): every toolbox tool with its full explanation open, because the
// real page shows a tool's details in a dialog that only opens on click.

const Tool = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--card);
  border: 1.5px solid var(--border);

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
`

export default function ToolsCatalog() {
  return (
    <PageShell>
      <PageInner>
        <header>
          <SectionTitle as="h1">ארגז הכלים: כל הכלים פתוחים</SectionTitle>
          <Subtle>תצוגה לסקירה בלבד. באתר האמיתי כל כלי נפתח בחלון בלחיצה.</Subtle>
        </header>
        {TOOLS.map((tool) => (
          <Tool key={tool.id} id={tool.id}>
            <h2>
              {tool.emoji} {tool.name}
            </h2>
            <Subtle style={{ margin: 0 }}>{tool.heading}</Subtle>
            <ToolDetails tool={tool} />
          </Tool>
        ))}
      </PageInner>
    </PageShell>
  )
}
