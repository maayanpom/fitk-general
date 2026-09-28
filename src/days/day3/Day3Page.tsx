import { Link } from "react-router-dom"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton } from "@/components/challenge/DoneButton"
import { FeedbackCard } from "@/components/challenge/FeedbackCard"
import { CommunityInvite } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { PageInner, PageShell, SectionTitle } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Day3Data } from "@/data/participant"
import { useParticipant } from "@/data/participantContext"

type Field = Exclude<keyof Day3Data, "completedAt">

const QUESTIONS: { key: Field; label: string }[] = [
  { key: "difficultMoment", label: "הרגע ביום שבו הכי קשה לי לאכול כמו שהייתי רוצה:" },
  { key: "whatUsuallyHappens", label: "כשזה קורה, בדרך כלל אני:" },
  { key: "whatIWishFor", label: "מה הייתי רוצה שיהיה לי באותו רגע?" },
]

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const QuestionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--card);
  box-shadow: 0 1px 2px oklch(0.4 0.05 50 / 0.06), 0 6px 18px -10px oklch(0.4 0.05 50 / 0.18);

  label {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
  }

  textarea {
    min-height: 88px;
    background: var(--background);
    font-size: 1rem;
  }
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

export default function Day3Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day3")
  const data = participant.day3

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          eyebrow="יום 3"
          title="הפתרון שלי"
          lead="בואו ניקח רגע אחד שקשה לכם במיוחד ונבין מה באמת חסר בו."
        />

        <Section>
          <SectionTitle>שלוש שורות לרגע אחד</SectionTitle>
          {QUESTIONS.map((q, i) => (
            <QuestionCard key={q.key}>
              <Label htmlFor={q.key}>
                <StepNumber aria-hidden>{i + 1}</StepNumber>
                {q.label}
              </Label>
              <Textarea
                id={q.key}
                value={data[q.key]}
                onChange={(e) => updateSection("day3", { [q.key]: e.target.value })}
              />
            </QuestionCard>
          ))}
        </Section>

        <DoneButton disabled={!data.difficultMoment.trim()} onClick={() => void complete()}>
          סיימתי ✓
        </DoneButton>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard
                title="מעולה. זיהית רגע אמיתי מהיום שלך."
                body="עכשיו כבר אפשר לחשוב על פתרון שמתאים לחיים שלך – ולא לנסות להתאים את החיים לפתרון."
              />
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
              <CommunityInvite />
            </>
          )}
        </ResultArea>

        <PageFooter />
      </PageInner>
    </PageShell>
  )
}
