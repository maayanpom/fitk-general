import { Check } from "lucide-react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { ChoiceGroup, ChoicePill } from "@/components/challenge/ChoicePill"
import { CompletionProgress } from "@/components/challenge/CompletionProgress"
import { DayHeader } from "@/components/challenge/DayHeader"
import { QuestionButton } from "@/components/challenge/links"
import { DoneButton, DoneHint } from "@/components/challenge/DoneButton"
import { FeedbackCard } from "@/components/challenge/FeedbackCard"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { TomorrowCard } from "@/components/challenge/TomorrowCard"
import { useCompletion } from "@/components/challenge/useCompletion"
import { WhyItMatters } from "@/components/challenge/WhyItMatters"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import type { Day2MealChoice } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import day2Image from "@/assets/day2.webp"
import { MEAL_OPTIONS } from "./content"
import { getDay2Feedback } from "./feedback"

type PlateComponent = "protein" | "vegetables" | "carbs" | "fat"

const COMPONENTS: { key: PlateComponent; emoji: string; title: string; examples: string }[] = [
  { key: "protein", emoji: "🍗", title: "מקור חלבון", examples: "עוף, דג, בשר, ביצים, גבינות, טופו, קטניות" },
  { key: "vegetables", emoji: "🥗", title: "ירקות", examples: "סלט, ירקות מבושלים" },
  { key: "carbs", emoji: "🍞", title: "מקור פחמימה", examples: "לחם, אורז, תפוח אדמה, פסטה, דגנים, קטניות, פרי" },
  { key: "fat", emoji: "🥑", title: "מקור שומן לפי הצורך", examples: "אבוקדו, טחינה, שמן זית, אגוזים" },
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
    font-size: 0.95rem;
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
  font-size: 1rem;
  line-height: 1.7;
`

const Extras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`

export default function Day2Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day2")
  const coach = useCoachPublicInfo(participant.coachSlug)
  const data = participant.day2
  const feedback = getDay2Feedback(data)

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          day={2}
          image={day2Image}
          title="הצלחת שלי"
          lead="היום מסתכלים על ארוחה אחת כמו שהיא באמת, בלי לשפוט."
        />

        <WhyItMatters title="למה זה חשוב: מה זו צלחת מאוזנת?">
          <Subtle style={{ margin: 0 }}>
            צלחת מאוזנת היא כלי חשוב לשמירה על אורח חיים בריא: מקור חלבון, ירקות, מקור פחמימה
            ושומן במידת הצורך. כך אנחנו רגועים שאנחנו יודעים שנתנו לגוף מה שהוא צריך, וקל לנו
            יותר להרגיש שבעים לאורך זמן. המטרה היא להבין מה בדרך כלל יש בצלחת, ומה בדרך כלל
            חסר.
          </Subtle>
        </WhyItMatters>

        <Section>
          <SectionTitle>בחרו ארוחה אחת</SectionTitle>
          <Subtle style={{ margin: 0 }}>בחרו ארוחה אחת מהיום או מאתמול, והסתכלו עליה בכנות.</Subtle>
          <ChoiceGroup
            value={data.mealChosen}
            onValueChange={(v) => updateSection("day2", { mealChosen: v as Day2MealChoice })}
            aria-label="בחרו ארוחה אחת"
          >
            {MEAL_OPTIONS.map((option) => (
              <ChoicePill key={option.value} value={option.value}>
                {option.label}
              </ChoicePill>
            ))}
          </ChoiceGroup>
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
        </Section>

        {!isCompleted && (
          <Section>
            <SectionTitle>איך משלימים צלחת בלי מאמץ</SectionTitle>
            <Notes>
              <li>חסר חלבון? ביצים, קוטג', יוגורט, טונה מספיקים.</li>
              <li>חסרים ירקות? מלפפון או עגבנייה חתוכים בצד, גם בלי לבשל.</li>
              <li>חסרה פחמימה? פרוסת לחם או פרי. אין צורך לוותר עליה.</li>
            </Notes>
          </Section>
        )}

        <DoneButton disabled={!data.mealChosen} onClick={() => void complete()}>
          סיימתי ✓
        </DoneButton>
        {!data.mealChosen && <DoneHint>כדי לסיים, בחרו ארוחה אחת</DoneHint>}

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard title={feedback.title} body={feedback.body} />
              <CompletionMessage />
              <Extras>
                <CompletionProgress percent={66} />
                <TomorrowCard>מחר: הפתרון שלי. נבחר רגע אחד ונמצא לו פתרון קטן.</TomorrowCard>
                <QuestionButton phone={coach?.phone} />
              </Extras>
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>
    </PageShell>
  )
}
