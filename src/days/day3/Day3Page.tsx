import { Link } from "react-router-dom"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { ChoiceGroup, ChoicePill } from "@/components/challenge/ChoicePill"
import { CompletionProgress } from "@/components/challenge/CompletionProgress"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton } from "@/components/challenge/DoneButton"
import { CommunityInvite } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { WhyItMatters } from "@/components/challenge/WhyItMatters"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import day3Image from "@/assets/day3.jpg"
import { day2MissingLabel, HAPPENS_OPTIONS, HELP_OPTIONS, MOMENT_OPTIONS } from "./content"
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

const QuestionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--card);
  box-shadow: 0 1px 2px oklch(0.3 0.06 300 / 0.06), 0 6px 18px -10px oklch(0.3 0.06 300 / 0.18);
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
  background: linear-gradient(160deg, #EDE4FA, #D8C9F0);
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

export default function Day3Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day3")
  const coach = useCoachPublicInfo(participant.coachSlug)
  const data = participant.day3

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          day={3}
          image={day3Image}
          title="הפתרון שלי"
          lead="היום בוחרים רגע אחד קשה, ומוצאים לו פתרון קטן שמתאים לחיים האמיתיים."
        />

        <WhyItMatters>
          <Subtle style={{ margin: 0 }}>
            לעיתים קרובות הקושי באוכל קשור לרגע ולא לכוח רצון: מתי אנחנו עייפים, רעבים או לחוצים,
            ומה זמין לנו באותו רגע. כשמבינים מה קורה ברגע הזה, אפשר לשנות דבר קטן אחד במקום לשנות
            הכול.
          </Subtle>
        </WhyItMatters>

        <Section>
          <SectionTitle>שלוש בחירות לרגע אחד</SectionTitle>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>1</StepNumber>
              הרגע ביום שבו הכי קשה לי לאכול כמו שהייתי רוצה:
            </QuestionLabel>
            <ChoiceGroup
              value={data.momentChoice}
              onValueChange={(v) => updateSection("day3", { momentChoice: v as Day3MomentChoice })}
              aria-label="הרגע ביום שבו הכי קשה לי לאכול כמו שהייתי רוצה"
            >
              {MOMENT_OPTIONS.map((o) => (
                <ChoicePill key={o.value} value={o.value}>
                  {o.label}
                </ChoicePill>
              ))}
            </ChoiceGroup>
          </QuestionCard>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>2</StepNumber>
              כשזה קורה, בדרך כלל אני:
            </QuestionLabel>
            <ChoiceGroup
              value={data.happensChoice}
              onValueChange={(v) =>
                updateSection("day3", { happensChoice: v as Day3HappensChoice })
              }
              aria-label="כשזה קורה, בדרך כלל אני"
            >
              {HAPPENS_OPTIONS.map((o) => (
                <ChoicePill key={o.value} value={o.value}>
                  {o.label}
                </ChoicePill>
              ))}
            </ChoiceGroup>
          </QuestionCard>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>3</StepNumber>
              מה היה עוזר לי ברגע הזה:
            </QuestionLabel>
            <ChoiceGroup
              value={data.helpChoice}
              onValueChange={(v) => updateSection("day3", { helpChoice: v as Day3HelpChoice })}
              aria-label="מה היה עוזר לי ברגע הזה"
            >
              {HELP_OPTIONS.map((o) => (
                <ChoicePill key={o.value} value={o.value}>
                  {o.label}
                </ChoicePill>
              ))}
            </ChoiceGroup>
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
                  <li>מיום 1: {getDay1Feedback(participant.day1, coach?.longGapHours).body}</li>
                  <li>מיום 2: בצלחת שבדקתם חסר בדרך כלל: {day2MissingLabel(participant.day2)}.</li>
                  <li>
                    מיום 3: הרגע הקשה הוא{" "}
                    {MOMENT_OPTIONS.find((o) => o.value === data.momentChoice)?.label ?? "-"}, ומה
                    שיעזור לכם:{" "}
                    {HELP_OPTIONS.find((o) => o.value === data.helpChoice)?.label ?? "-"}.
                  </li>
                </Summary>
                <CompletionProgress percent={100} />
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
