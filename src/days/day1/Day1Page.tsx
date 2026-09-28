import { Fragment } from "react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DayHeader } from "@/components/challenge/DayHeader"
import { DoneButton } from "@/components/challenge/DoneButton"
import { FeedbackCard } from "@/components/challenge/FeedbackCard"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import {
  Eyebrow,
  PageInner,
  PageShell,
  SectionTitle,
  Subtle,
} from "@/components/layout/PageShell"
import { Timeline, TimelineConnector } from "@/components/layout/Timeline"
import { useParticipant } from "@/data/participantContext"
import { EatingPointFields } from "./EatingPointFields"
import { HardestMomentPicker } from "./HardestMomentPicker"
import { PointCard } from "./PointCard"
import { SnacksCard } from "./SnacksCard"
import { MEALS } from "./types"

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TaskBox = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--secondary);
`

const Question = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
`

export default function Day1Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day1")
  const data = participant.day1

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          eyebrow="יום 1"
          title="הסדר שלי"
          lead="היום לא מחפשים תפריט מושלם. מסתכלים על היום האמיתי."
        />

        <Section>
          <SectionTitle>נקודות האכילה שלי</SectionTitle>
          <Timeline>
            {MEALS.map((meal) => (
              <Fragment key={meal.key}>
                <li>
                  <PointCard emoji={meal.emoji} title={meal.label}>
                    <EatingPointFields
                      id={meal.key}
                      value={data[meal.key]}
                      foodLabel="מה בערך אכלתי?"
                      onChange={(value) => updateSection("day1", { [meal.key]: value })}
                    />
                  </PointCard>
                </li>
                <TimelineConnector />
              </Fragment>
            ))}
            <li>
              <SnacksCard
                snacks={data.additionalSnacks}
                onChange={(additionalSnacks) => updateSection("day1", { additionalSnacks })}
              />
            </li>
          </Timeline>
        </Section>

        <TaskBox>
          <div>
            <Eyebrow>המשימה היחידה</Eyebrow>
            <SectionTitle>רגע לעצור ולהסתכל על היום שלי</SectionTitle>
          </div>
          <Question>איפה היה לי הכי קשה היום?</Question>
          <HardestMomentPicker
            value={data.hardestMoment}
            onChange={(hardestMoment) => updateSection("day1", { hardestMoment })}
          />
        </TaskBox>

        <Section>
          <DoneButton disabled={!data.hardestMoment} onClick={() => void complete()}>
            סיימתי ✓
          </DoneButton>
          {!data.hardestMoment && (
            <Subtle style={{ textAlign: "center" }}>יש לבחור איפה היה הכי קשה כדי לסיים</Subtle>
          )}
        </Section>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard
                title="זיהית את הרגע שבו הכי קשה לך."
                body="עצם הזיהוי של נקודת הקושי נותן לנו משהו קונקרטי לעבוד איתו. לא צריך לשנות את כל היום – אפשר להתחיל מרגע אחד."
              />
              <CompletionMessage />
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>
    </PageShell>
  )
}
