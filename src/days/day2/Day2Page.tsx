import { Check } from "lucide-react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton } from "@/components/challenge/DoneButton"
import { FeedbackCard } from "@/components/challenge/FeedbackCard"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { PageInner, PageShell, SectionTitle } from "@/components/layout/PageShell"
import { useParticipant } from "@/data/participantContext"
import { getDay2Feedback } from "./feedback"

type PlateComponent = "protein" | "vegetables" | "carbs" | "fat"

const COMPONENTS: { key: PlateComponent; emoji: string; title: string; examples: string }[] = [
  { key: "protein", emoji: "🍗", title: "מקור חלבון", examples: "דג, עוף, בשר, טופו..." },
  { key: "vegetables", emoji: "🥗", title: "ירקות", examples: "סלט, מלפפון, עגבנייה, ירקות מבושלים..." },
  { key: "carbs", emoji: "🍞", title: "מקור פחמימה", examples: "לחם, אורז, תפו\"א, פתיתים, פסטה, חומוס..." },
  { key: "fat", emoji: "🥑", title: "מקור שומן לפי הצורך", examples: "אבוקדו, טחינה" },
]

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const PlateCard = styled.button<{ $checked: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 16px 14px;
  min-height: 150px;
  text-align: start;
  border-radius: calc(var(--radius) * 1.4);
  border: 2px solid ${({ $checked }) => ($checked ? "var(--primary)" : "var(--border)")};
  background: ${({ $checked }) => ($checked ? "var(--accent)" : "var(--card)")};
  color: var(--foreground);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  .emoji {
    font-size: 1.8rem;
  }

  strong {
    font-size: 1.02rem;
  }

  small {
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }
`

const Tick = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 2px solid ${({ $checked }) => ($checked ? "var(--primary)" : "var(--input)")};
  background: ${({ $checked }) => ($checked ? "var(--primary)" : "transparent")};
  color: var(--primary-foreground);
`

export default function Day2Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day2")
  const data = participant.day2
  const feedback = getDay2Feedback(data)

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          eyebrow="יום 2"
          title="הצלחת שלי"
          lead="בואו נסתכל על ארוחה אחת כמו שהיא באמת."
        />

        <Section>
          <SectionTitle>מה יש בצלחת?</SectionTitle>
          <Grid>
            {COMPONENTS.map((c) => (
              <PlateCard
                key={c.key}
                type="button"
                role="checkbox"
                aria-checked={data[c.key]}
                $checked={data[c.key]}
                onClick={() => updateSection("day2", { [c.key]: !data[c.key] })}
              >
                <Tick $checked={data[c.key]} aria-hidden>
                  {data[c.key] && <Check size={16} strokeWidth={3} />}
                </Tick>
                <span className="emoji" aria-hidden>
                  {c.emoji}
                </span>
                <strong>{c.title}</strong>
                <small>{c.examples}</small>
              </PlateCard>
            ))}
          </Grid>
        </Section>

        <DoneButton onClick={() => void complete()}>סיימתי ✓</DoneButton>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard key={feedback.id} title={feedback.title} body={feedback.body} />
              <CompletionMessage />
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>
    </PageShell>
  )
}
