import { Fragment } from "react"
import { MessageCircle } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { whatsAppLinkForPhone } from "@/config"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
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

const WhatsAppButton = styled(Button)`
  height: 48px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
`

export default function Day1Page() {
  const { participant, updateSection } = useParticipant()
  const { isCompleted, complete, resultRef } = useCompletion("day1")
  const coach = useCoachPublicInfo(participant.coachSlug)
  const data = participant.day1
  const feedback = getDay1Feedback(data)

  return (
    <PageShell>
      <PageInner>
        <DayHeader
          eyebrow="יום 1"
          title="הסדר שלי"
          lead="היום מציירים תמונה אמיתית של היום שלכם. בלי שיפוטים ובלי תפריט מושלם."
        />

        <Section>
          <SectionTitle>למה סדר?</SectionTitle>
          <Subtle>
            ימים עם סדר מרגישים אחרת. סדר הוא לא תפריט קפדני, אלא כמה נקודות אכילה שאפשר לסמוך
            עליהן. היום נמפה איפה הן נמצאות אצלכם, ואיפה קשה להחזיק אותן. אין תשובה נכונה, יש רק
            תמונה אמיתית.
          </Subtle>
        </Section>

        <Section>
          <SectionTitle>נקודות האכילה שלי</SectionTitle>
          <Subtle style={{ margin: 0 }}>
            מלאו מה אכלתם או מה אתם מתכננים לאכול היום. אפשר לחזור ולעדכן עד הערב. נקודה שלא
            הייתה? אפשר לדלג.
          </Subtle>
          <Notes>
            <li>הנקודות: בוקר, ביניים, צהריים, אחר הצהריים, ערב, ונשנושים בין לבין.</li>
            <li>לכל נקודה: שעה ומה בערך.</li>
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
          <div>
            <Eyebrow>המשימה היחידה</Eyebrow>
            <SectionTitle>הנקודה הקשה</SectionTitle>
          </div>
          <Question>איפה הכי קשה לכם לשמור על הסדר היום?</Question>
          <HardestMomentPicker
            value={data.hardestMoment}
            onChange={(hardestMoment) => updateSection("day1", { hardestMoment })}
          />
        </TaskBox>

        <Section>
          <SectionTitle>שלושה דברים שעושים סדר ביום</SectionTitle>
          <Notes>
            <li>נקודת אכילה אחת קבועה שלא זזה, אפילו קטנה.</li>
            <li>משהו זמין מראש. כשאין מה לאכול בהישג יד, ההחלטה נעשית בלחץ.</li>
            <li>כוס מים ליד, כדי שהשתייה לא תלויה בזיכרון.</li>
          </Notes>
        </Section>

        <Tip>
          💡 בוקר עמוס? בחרו דבר אחד שאפשר להכין מראש בערב, או נקודה פשוטה אחת שאפשר לקחת בדרך.
        </Tip>

        <Tip>🔄 משהו לא הלך כמתוכנן? לא מפצים ולא מדלגים. חוזרים לנקודה הבאה כרגיל.</Tip>

        <Section>
          <DoneButton onClick={() => void complete()}>סיימתי ✓</DoneButton>
        </Section>

        <ResultArea ref={resultRef}>
          {isCompleted && (
            <>
              <FeedbackCard title={feedback.title} body={feedback.body} />
              <CompletionMessage />
              <Extras>
                <ProgressLine>הפרופיל שלכם: 33%</ProgressLine>
                <Teaser>
                  מחר: הצלחת שלי. נבנה יחד צלחת מהיום האמיתי שלכם. הקישור יגיע אליכם בוואטסאפ
                  בבוקר.
                </Teaser>
                <Subtle style={{ margin: 0 }}>אפשר לחזור ולערוך את התשובות עד סוף היום.</Subtle>
                {coach?.phone && (
                  <WhatsAppButton variant="outline" asChild>
                    <a
                      href={whatsAppLinkForPhone(coach.phone, "היי, יש לי שאלה לגבי האתגר 🙂")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle />
                      שאלה? כתבו לי בוואטסאפ
                    </a>
                  </WhatsAppButton>
                )}
              </Extras>
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} disclaimer />
      </PageInner>
    </PageShell>
  )
}
