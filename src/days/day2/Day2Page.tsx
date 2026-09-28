import { Check } from "lucide-react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton } from "@/components/challenge/DoneButton"
import { FeedbackCard } from "@/components/challenge/FeedbackCard"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Day2MealChoice } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"
import { MEAL_OPTIONS } from "./content"
import { getDay2Feedback } from "./feedback"

type PlateComponent = "protein" | "vegetables" | "carbs" | "fat"

const COMPONENTS: { key: PlateComponent; emoji: string; title: string; examples: string }[] = [
  { key: "protein", emoji: "🍗", title: "מקור חלבון", examples: "עוף, דג, בשר, ביצים, גבינות, טופו, קטניות" },
  { key: "vegetables", emoji: "🥗", title: "ירקות או פרי", examples: "סלט, ירקות מבושלים, פרי" },
  { key: "carbs", emoji: "🍞", title: "מקור פחמימה", examples: "לחם, אורז, תפוח אדמה, פסטה, דגנים, קטניות" },
  { key: "fat", emoji: "🥑", title: "מקור שומן לפי הצורך", examples: "אבוקדו, טחינה, שמן זית, אגוזים" },
]

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Options = styled(RadioGroup)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const Pill = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--border);
  background: var(--card);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:has([data-state="checked"]) {
    border-color: var(--primary);
    background: var(--accent);
    color: var(--accent-foreground);
  }

  &:has(:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
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

const Notes = styled.ul`
  margin: 0;
  padding-inline-start: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--muted-foreground);
  font-size: 0.9rem;
  line-height: 1.5;
`

const Tip = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: calc(var(--radius) * 1.2);
  background: var(--secondary);
  color: var(--secondary-foreground);
  font-size: 0.92rem;
  line-height: 1.6;
`

const Extras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`

const ProgressLine = styled.p`
  margin: 0;
  font-weight: 600;
  color: var(--primary);
`

const Teaser = styled.p`
  margin: 0;
  color: var(--secondary-foreground);
  line-height: 1.6;
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
          lead="היום מסתכלים על ארוחה אחת כמו שהיא באמת, בלי לשפוט."
        />

        <Section>
          <SectionTitle>מה זו צלחת מאוזנת?</SectionTitle>
          <Subtle style={{ margin: 0 }}>
            צלחת מאוזנת היא לא כלל נוקשה אלא כיוון: מקור חלבון, ירקות או פרי, מקור פחמימה וקצת
            שומן. כך קל יותר להרגיש שבעים לאורך זמן. לא צריך שהכול יופיע בכל ארוחה. המטרה היא
            להבין מה בדרך כלל יש בצלחת, ומה בדרך כלל חסר.
          </Subtle>
        </Section>

        <Section>
          <SectionTitle>בחרו ארוחה אחת</SectionTitle>
          <Subtle style={{ margin: 0 }}>בחרו ארוחה אחת מהיום או מאתמול, והסתכלו עליה בכנות.</Subtle>
          <Options
            value={data.mealChosen}
            onValueChange={(v) => updateSection("day2", { mealChosen: v as Day2MealChoice })}
            aria-label="בחרו ארוחה אחת"
          >
            {MEAL_OPTIONS.map((option) => (
              <Pill key={option.value}>
                <RadioGroupItem value={option.value} />
                {option.label}
              </Pill>
            ))}
          </Options>
        </Section>

        <Section>
          <SectionTitle>מה יש בצלחת?</SectionTitle>
          <Subtle style={{ margin: 0 }}>סמנו כל מה שהיה בארוחה.</Subtle>
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
          <Subtle style={{ margin: 0 }}>
            קטניות (חומוס, עדשים, שעועית) אפשר לסמן גם כחלבון וגם כפחמימה.
          </Subtle>
        </Section>

        <Section>
          <SectionTitle>איך משלימים צלחת בלי מאמץ</SectionTitle>
          <Notes>
            <li>חסר חלבון? ביצה, גבינה, יוגורט, טונה או קטניות מספיקים.</li>
            <li>חסרים ירקות? מלפפון או עגבנייה חתוכים בצד, גם בלי לבשל.</li>
            <li>חסרה פחמימה? פרוסת לחם או פרי. אין צורך לוותר עליה.</li>
          </Notes>
        </Section>

        <Tip>🍽️ ארוחה מהירה או מוכנה היא גם ארוחה. מספיק להשלים בה מרכיב אחד.</Tip>

        <DoneButton onClick={() => void complete()}>סיימתי ✓</DoneButton>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard title={feedback.title} body={feedback.body} />
              <CompletionMessage />
              <Extras>
                <Subtle style={{ margin: 0 }}>אין צורך שכל ארוחה תהיה מושלמת.</Subtle>
                <ProgressLine>הפרופיל שלכם: 66%</ProgressLine>
                <Teaser>מחר: הפתרון שלי. נבחר רגע אחד ונמצא לו פתרון קטן.</Teaser>
              </Extras>
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>
    </PageShell>
  )
}
