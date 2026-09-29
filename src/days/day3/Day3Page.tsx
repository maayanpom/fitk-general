import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { ChoiceGroup, ChoicePill } from "@/components/challenge/ChoicePill"
import { CompletionProgress } from "@/components/challenge/CompletionProgress"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton, DoneHint } from "@/components/challenge/DoneButton"
import { CommunityInvite, QuestionButton } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { WhyItMatters } from "@/components/challenge/WhyItMatters"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import day3Image from "@/assets/day3.webp"
import { HAPPENS_OPTIONS, HELP_OPTIONS, MOMENT_OPTIONS } from "./content"

const DEFAULT_DELIVERY_TEXT = "הסיכום האישי שלכם יישלח אליכם בוואטסאפ עד 24 שעות."

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

const Celebration = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: var(--primary);
  color: var(--primary-foreground);
  text-align: center;
  animation: reveal 0.6s ease-out both;

  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.96);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 800;
    line-height: 1.4;
    color: var(--primary-foreground);
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.6;
  }
`

const Chips = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  li {
    padding: 10px 16px;
    border-radius: 999px;
    background: var(--selected);
    border: 1.5px solid var(--lavender);
    color: var(--deep);
    font-weight: 600;
    line-height: 1.4;
  }
`

const KeyLine = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.5;
  color: var(--deep);
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
            לעיתים קרובות הקושי באוכל קשור לרגע ולא לכוח רצון: מתי שאנחנו עייפים, רעבים או לחוצים,
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
              כשזה קורה, מה בדרך כלל קורה אצלי?
            </QuestionLabel>
            <ChoiceGroup
              value={data.happensChoice}
              onValueChange={(v) =>
                updateSection("day3", { happensChoice: v as Day3HappensChoice })
              }
              aria-label="כשזה קורה, מה בדרך כלל קורה אצלי?"
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
          <Chips>
            <li>רעב חזק</li>
            <li>עייפות</li>
            <li>סביבה (מה זמין לי באותו רגע)</li>
            <li>הרגל של שעה קבועה</li>
          </Chips>
          <KeyLine>לרוב מספיק לשנות אחד מהם.</KeyLine>
        </Section>

        <DoneButton disabled={!data.momentChoice} onClick={() => void complete()}>
          סיימתי ✓
        </DoneButton>
        {!data.momentChoice && <DoneHint>כדי לסיים, בחרו את הרגע הקשה בשאלה הראשונה</DoneHint>}

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <CompletionProgress percent={100} />

              <CompletionMessage />

              <Celebration>
                <h2>🎉 סיימתם את שלושת הימים, וזה לא מובן מאליו.</h2>
                <p>{coach?.summaryDeliveryText?.trim() || DEFAULT_DELIVERY_TEXT}</p>
              </Celebration>

              <CommunityInvite communityUrl={coach?.communityUrl} />

              <QuestionButton phone={coach?.phone} />
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>
    </PageShell>
  )
}
