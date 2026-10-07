import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { ChoiceGroup, ChoicePill, MultiChoiceGroup, MultiChoicePill } from "@/components/challenge/ChoicePill"
import { CompletionProgress } from "@/components/challenge/CompletionProgress"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton, DoneHint } from "@/components/challenge/DoneButton"
import { CommunityInvite, QuestionButton } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import day3Image from "@/assets/day3.webp"
import { HAPPENS_OPTIONS, HELP_OPTIONS, MOMENT_OPTIONS } from "./content"

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
const OPENING =
  "הגענו ליום האחרון 🌿 ביומיים האחרונים הסתכלנו על איך היום שלך נראה ועל ארוחה אחת מתוכו. היום נבחר רגע אחד שקצת יותר קשה לך ונחשוב איך אפשר להפוך אותו לפשוט יותר."

const toggle = <T extends string>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

export default function Day3Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day3")
  const coach = useCoachPublicInfo(participant.coachSlug)
  const data = participant.day3
  const ready =
    Boolean(data.momentChoice) && data.happensChoices.length > 0 && data.helpChoices.length > 0

  return (
    <PageShell>
      <PageInner>
        <DayHeader day={3} image={day3Image} title="הפתרון שלי" lead={OPENING} />

        <Section>
          <SectionTitle>שלוש שאלות קצרות</SectionTitle>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>1</StepNumber>
              מתי זה קורה?
            </QuestionLabel>
            <ChoiceGroup
              value={data.momentChoice}
              onValueChange={(v) => updateSection("day3", { momentChoice: v as Day3MomentChoice })}
              aria-label="מתי זה קורה?"
            >
              {MOMENT_OPTIONS.map((o) => (
                <ChoicePill key={o.value} value={o.value}>
                  {o.label}
                </ChoicePill>
              ))}
            </ChoiceGroup>
            {data.momentChoice === "other" && (
              <Input
                aria-label="משהו אחר"
                placeholder="משהו אחר"
                maxLength={100}
                value={data.momentOther}
                onChange={(e) => updateSection("day3", { momentOther: e.target.value })}
              />
            )}
          </QuestionCard>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>2</StepNumber>
              מה בדרך כלל קורה שם?
            </QuestionLabel>
            <Subtle style={{ margin: 0 }}>אפשר לבחור כמה.</Subtle>
            <MultiChoiceGroup aria-label="מה בדרך כלל קורה שם?">
              {HAPPENS_OPTIONS.map((o) => (
                <MultiChoicePill
                  key={o.value}
                  checked={data.happensChoices.includes(o.value)}
                  onToggle={() =>
                    updateSection("day3", {
                      happensChoices: toggle<Day3HappensChoice>(data.happensChoices, o.value),
                    })
                  }
                >
                  {o.label}
                </MultiChoicePill>
              ))}
            </MultiChoiceGroup>
            {data.happensChoices.includes("other") && (
              <Input
                aria-label="משהו אחר"
                placeholder="משהו אחר"
                maxLength={100}
                value={data.happensOther}
                onChange={(e) => updateSection("day3", { happensOther: e.target.value })}
              />
            )}
          </QuestionCard>

          <QuestionCard>
            <QuestionLabel>
              <StepNumber aria-hidden>3</StepNumber>
              דמיינו שברגע הזה יש לכם משהו שעושה לכם קל. מה זה?
            </QuestionLabel>
            <Subtle style={{ margin: 0 }}>אפשר לבחור כמה.</Subtle>
            <MultiChoiceGroup aria-label="דמיינו שברגע הזה יש לכם משהו שעושה לכם קל. מה זה?">
              {HELP_OPTIONS.map((o) => (
                <MultiChoicePill
                  key={o.value}
                  checked={data.helpChoices.includes(o.value)}
                  onToggle={() =>
                    updateSection("day3", {
                      helpChoices: toggle<Day3HelpChoice>(data.helpChoices, o.value),
                    })
                  }
                >
                  {o.label}
                </MultiChoicePill>
              ))}
            </MultiChoiceGroup>
            {data.helpChoices.includes("other") && (
              <Input
                aria-label="משהו אחר"
                placeholder="משהו אחר"
                maxLength={100}
                value={data.helpOther}
                onChange={(e) => updateSection("day3", { helpOther: e.target.value })}
              />
            )}
          </QuestionCard>

          <QuestionCard>
            <Label htmlFor="day3-one-thing">
              עכשיו בחר/י את הדבר האחד שהכי היית רוצה שיהיה לך קל יותר בשבוע הקרוב.
            </Label>
            <Input
              id="day3-one-thing"
              maxLength={100}
              placeholder="רשות"
              value={data.oneThing}
              onChange={(e) => updateSection("day3", { oneThing: e.target.value })}
            />
          </QuestionCard>

          <QuestionCard>
            <Label htmlFor="day3-note">רוצים להוסיף משהו?</Label>
            <Input
              id="day3-note"
              maxLength={100}
              value={data.extraNote}
              onChange={(e) => updateSection("day3", { extraNote: e.target.value })}
            />
          </QuestionCard>
        </Section>

        <Section>
          <SectionTitle>דברים שיוצרים רגע קשה</SectionTitle>
          <Chips>
            <li>רעב חזק</li>
            <li>עייפות</li>
            <li>סביבה (מה זמין לי באותו רגע)</li>
            <li>הרגל של שעה קבועה</li>
            <li>מצב רגשי</li>
          </Chips>
          <KeyLine>עכשיו כבר יש לנו נקודה אחת שאפשר להתחיל להקל עליה 🌿</KeyLine>
        </Section>

        <DoneButton disabled={!ready} onClick={() => void complete()}>
          סיימתי ✓
        </DoneButton>
        {!ready && <DoneHint>כדי לסיים, ענו על שלוש השאלות (בשאלות 2 ו-3 מספיקה בחירה אחת)</DoneHint>}

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <CompletionProgress percent={100} />

              <CompletionMessage />

              <Celebration>
                <h2>מעולה ❤️</h2>
                <p>
                  עכשיו יש לנו את שלושת החלקים של התמונה: איך היום שלך נראה, איך נראית ארוחה אחת,
                  ואיפה הכי קשה לך ומה יכול להקל.
                </p>
                <p>אני אעבור על מה ששיתפת ואחזור אליך עם סיכום אישי וכלים שמתאימים לך.</p>
                <p>
                  התשובות שלך נשארות אצלי, ומשמשות רק לסיכום האישי שלך ולהצעה להמשך, אם תרצה.
                </p>
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
