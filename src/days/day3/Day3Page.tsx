import { useEffect } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton } from "@/components/challenge/DoneButton"
import { CommunityInvite } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import {
  day2MissingLabel,
  EXPERIMENTS,
  HAPPENS_OPTIONS,
  HELP_OPTIONS,
  momentChoiceFromDay1,
  MOMENT_OPTIONS,
} from "./content"
import { getDay1Feedback } from "../day1/feedback"

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StepNumber = styled.span`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--secondary);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 700;
`

const QuestionLabel = styled(Label)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
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

const QuestionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--card);
  box-shadow: 0 1px 2px oklch(0.4 0.05 50 / 0.06), 0 6px 18px -10px oklch(0.4 0.05 50 / 0.18);
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

const Summary = styled.ul`
  margin: 0;
  padding-inline-start: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: 1.6;
`

const Celebration = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: linear-gradient(160deg, oklch(0.94 0.05 70), oklch(0.9 0.06 40));
  text-align: center;

  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-weight: 500;
    line-height: 1.6;
  }

  a {
    height: 52px;
    border-radius: 999px;
    font-size: 1.05rem;
    font-weight: 700;
  }
`

const ProgressLine = styled.p`
  margin: 0;
  font-weight: 600;
  color: var(--primary);
  text-align: center;
`

export default function Day3Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day3")
  const coach = useCoachPublicInfo(participant.coachSlug)
  const data = participant.day3

  // Pre-selects question 1 from day 1's hard point, once, if nothing was
  // chosen yet - the participant can still change it afterward.
  useEffect(() => {
    if (data.momentChoice) return
    const fromDay1 = momentChoiceFromDay1(participant.day1.hardestMoment)
    if (fromDay1) updateSection("day3", { momentChoice: fromDay1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const effectiveExperiment = data.experimentChoice || data.helpChoice

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          eyebrow="יום 3"
          title="הפתרון שלי"
          lead="היום בוחרים רגע אחד קשה, ומוצאים לו פתרון קטן שמתאים לחיים האמיתיים."
        />

        <Section>
          <SectionTitle>למה דווקא הרגע הזה?</SectionTitle>
          <Subtle style={{ margin: 0 }}>
            לעיתים קרובות הקושי באוכל קשור לרגע ולא לכוח רצון: מתי אנחנו עייפים, רעבים או לחוצים,
            ומה זמין לנו באותו רגע. כשמבינים מה קורה ברגע הזה, אפשר לשנות דבר קטן אחד במקום לשנות
            הכול.
          </Subtle>
        </Section>

        <Section>
          <SectionTitle>שלוש בחירות לרגע אחד</SectionTitle>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>1</StepNumber>
              הרגע ביום שבו הכי קשה לי לאכול כמו שהייתי רוצה:
            </QuestionLabel>
            <Options
              value={data.momentChoice}
              onValueChange={(v) => updateSection("day3", { momentChoice: v as Day3MomentChoice })}
              aria-label="הרגע ביום שבו הכי קשה לי לאכול כמו שהייתי רוצה"
            >
              {MOMENT_OPTIONS.map((o) => (
                <Pill key={o.value}>
                  <RadioGroupItem value={o.value} />
                  {o.label}
                </Pill>
              ))}
            </Options>
          </QuestionCard>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>2</StepNumber>
              כשזה קורה, בדרך כלל אני:
            </QuestionLabel>
            <Options
              value={data.happensChoice}
              onValueChange={(v) =>
                updateSection("day3", { happensChoice: v as Day3HappensChoice })
              }
              aria-label="כשזה קורה, בדרך כלל אני"
            >
              {HAPPENS_OPTIONS.map((o) => (
                <Pill key={o.value}>
                  <RadioGroupItem value={o.value} />
                  {o.label}
                </Pill>
              ))}
            </Options>
          </QuestionCard>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>3</StepNumber>
              מה היה עוזר לי ברגע הזה:
            </QuestionLabel>
            <Options
              value={data.helpChoice}
              onValueChange={(v) => updateSection("day3", { helpChoice: v as Day3HelpChoice })}
              aria-label="מה היה עוזר לי ברגע הזה"
            >
              {HELP_OPTIONS.map((o) => (
                <Pill key={o.value}>
                  <RadioGroupItem value={o.value} />
                  {o.label}
                </Pill>
              ))}
            </Options>
          </QuestionCard>

          <QuestionCard>
            <Label htmlFor="day3-note">רוצים להוסיף משהו?</Label>
            <Input
              id="day3-note"
              maxLength={100}
              value={data.extraNote}
              onChange={(e) => updateSection("day3", { extraNote: e.target.value })}
            />
            <Subtle style={{ margin: 0 }}>לא צריך לכתוב מידע רפואי.</Subtle>
          </QuestionCard>
        </Section>

        <Section>
          <SectionTitle>הניסוי שלי לשבוע</SectionTitle>
          <Subtle style={{ margin: 0 }}>
            הצענו ניסוי לפי מה שסימנתם למעלה - אפשר להשאיר אותו ככה, או לבחור ניסוי אחר.
          </Subtle>
          <Options
            value={effectiveExperiment}
            onValueChange={(v) => updateSection("day3", { experimentChoice: v as Day3HelpChoice })}
            aria-label="הניסוי שלי לשבוע"
          >
            {HELP_OPTIONS.map((o) => (
              <Pill key={o.value}>
                <RadioGroupItem value={o.value} />
                {o.label}
              </Pill>
            ))}
          </Options>
          {effectiveExperiment && (
            <Subtle style={{ margin: 0 }}>"{EXPERIMENTS[effectiveExperiment]}"</Subtle>
          )}
        </Section>

        <Section>
          <SectionTitle>ארבעה דברים שיוצרים רגע קשה</SectionTitle>
          <Notes>
            <li>רעב חזק</li>
            <li>עייפות</li>
            <li>סביבה (מה זמין לי באותו רגע)</li>
            <li>הרגל של שעה קבועה</li>
          </Notes>
          <Subtle style={{ margin: 0 }}>לרוב מספיק לשנות אחד מהם.</Subtle>
        </Section>

        <DoneButton disabled={!data.momentChoice} onClick={() => void complete()}>
          סיימתי ✓
        </DoneButton>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <QuestionCard>
                <SectionTitle>הסיכום שלכם</SectionTitle>
                <Summary>
                  <li>מיום 1: {getDay1Feedback(participant.day1).body}</li>
                  <li>מיום 2: בצלחת שבדקתם חסר בדרך כלל: {day2MissingLabel(participant.day2)}.</li>
                  <li>
                    מיום 3: הרגע הקשה הוא{" "}
                    {MOMENT_OPTIONS.find((o) => o.value === data.momentChoice)?.label ?? "-"}, ומה
                    שיעזור לכם:{" "}
                    {HELP_OPTIONS.find((o) => o.value === data.helpChoice)?.label ?? "-"}.
                  </li>
                  <li>הניסוי שלי לשבוע: {effectiveExperiment ? EXPERIMENTS[effectiveExperiment] : "-"}</li>
                </Summary>
                <ProgressLine>הפרופיל שלכם: 100%</ProgressLine>
              </QuestionCard>

              <CompletionMessage />

              <Celebration>
                <h2>🎉 סיימתם את שלושת הימים!</h2>
                <p>
                  ועכשיו – ארגז כלים קטן שיעזור לכם גם בימים שבהם אין זמן, כוח או חשק להתעסק עם
                  אוכל.
                </p>
                <Button asChild size="lg">
                  <Link to="/toolbox">לארגז הכלים שלי →</Link>
                </Button>
              </Celebration>

              <CommunityInvite communityUrl={coach?.communityUrl} />

              <Subtle style={{ textAlign: "center" }}>
                סיימתם את שלושת הימים, וזה לא מובן מאליו. הסיכום האישי יישלח אליכם בוואטסאפ עד יום
                שישי.
              </Subtle>
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>
    </PageShell>
  )
}
