import { Fragment } from "react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
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
import { Timeline, TimelineConnector } from "@/components/layout/Timeline"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import day1Image from "@/assets/day1.webp"
import { EatingPointFields } from "./EatingPointFields"
import { getDay1Feedback } from "./feedback"
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

export default function Day1Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day1")
  const coach = useCoachPublicInfo(participant.coachSlug)
  const data = participant.day1
  const feedback = getDay1Feedback(data, coach?.longGapHours)

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          day={1}
          image={day1Image}
          title="הסדר שלי"
          lead="היום מציירים תמונה אמיתית של היום שלכם. בלי שיפוטים ובלי תפריט מושלם."
        />

        <WhyItMatters>
          <Subtle style={{ margin: 0 }}>
            ימים עם סדר מרגישים אחרת. סדר הוא לא תפריט קפדני, אלא כמה נקודות אכילה שאפשר לסמוך
            עליהן. היום נמפה איפה הן נמצאות אצלכם, ואיפה קשה להחזיק אותן. אין תשובה נכונה, יש רק
            תמונה אמיתית.
          </Subtle>
        </WhyItMatters>

        <Section>
          <SectionTitle>נקודות האכילה שלי</SectionTitle>
          <Subtle style={{ margin: 0 }}>
            מלאו מה אכלתם או מה אתם מתכננים לאכול היום. אפשר לחזור ולעדכן עד הערב. נקודה שלא
            הייתה? אפשר לדלג.
          </Subtle>
          <Notes>
            <li>הנקודות: בוקר, ביניים, צהריים, אחר הצהריים, ערב, ונשנושים בין לבין.</li>
            <li>אפשר לכתוב בקצרה (עד 60 תווים).</li>
          </Notes>
          <Timeline>
            {MEALS.map((meal) => (
              <Fragment key={meal.key}>
                <li>
                  <PointCard emoji={meal.emoji} title={meal.label}>
                    <EatingPointFields
                      id={meal.key}
                      value={data[meal.key]}
                      foodLabel="מה בערך?"
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
          <SectionTitle>הנקודה הקשה</SectionTitle>
          <Question>איפה הכי קשה לכם לשמור על הסדר היום?</Question>
          <HardestMomentPicker
            value={data.hardestMoment}
            onChange={(hardestMoment) => updateSection("day1", { hardestMoment })}
          />
        </TaskBox>

        <Section>
          <Subtle style={{ margin: 0 }}>
            <strong>תכנון והתארגנות:</strong> לתכנן בערך מה נאכל היום, ולוודא שיש בבית את מה שצריך
            או שאפשר לקנות אותו בקלות.
          </Subtle>
        </Section>

        <Section>
          <DoneButton disabled={!data.hardestMoment} onClick={() => void complete()}>
            סיימתי ✓
          </DoneButton>
          {!data.hardestMoment && <DoneHint>כדי לסיים, בחרו איפה הכי קשה היום (או שאין נקודה קשה)</DoneHint>}
        </Section>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard title={feedback.title} body={feedback.body} />
              <CompletionMessage />
              <Extras>
                <CompletionProgress percent={33} />
                <TomorrowCard>
                  מחר: הצלחת שלי. נבנה יחד צלחת מהיום האמיתי שלכם. הקישור יגיע אליכם בוואטסאפ בבוקר.
                </TomorrowCard>
                <Subtle style={{ margin: 0 }}>אפשר לחזור ולערוך את התשובות עד סוף היום.</Subtle>
                <QuestionButton phone={coach?.phone} />
              </Extras>
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} disclaimer />
      </PageInner>
    </PageShell>
  )
}
