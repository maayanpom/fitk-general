import type { ReactNode } from "react"
import styled from "styled-components"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Participant } from "@/data/participant"
import { HARDEST_OPTIONS, MEALS } from "@/days/day1/types"
import { MEAL_OPTIONS } from "@/days/day2/content"
import { getDay2Feedback } from "@/days/day2/feedback"
import { describeChoices, HAPPENS_OPTIONS, HELP_OPTIONS, MOMENT_OPTIONS } from "@/days/day3/content"
import { TOOLS_BY_ID } from "@/toolbox/tools"
import { formatDateTime } from "./adminData"

const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: var(--muted);

  h3 {
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    font-size: 1rem;
    font-weight: 700;
  }

  h3 small {
    font-weight: 500;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px 12px;
    font-size: 0.92rem;
  }

  dt {
    color: var(--muted-foreground);
  }

  dd {
    margin: 0;
    white-space: pre-wrap;
  }
`

function Section({
  title,
  completedAt,
  children,
}: {
  title: string
  completedAt: string
  children: ReactNode
}) {
  return (
    <Block>
      <h3>
        {title}
        <small>{completedAt ? `הושלם ${formatDateTime(completedAt)}` : "לא הושלם"}</small>
      </h3>
      {children}
    </Block>
  )
}

const orDash = (value: string) => value.trim() || "—"
const yesNo = (value: boolean) => (value ? "✓" : "—")

export function ParticipantDetails({
  participant,
  onClose,
}: {
  participant: Participant | null
  onClose: () => void
}) {
  return (
    <Dialog open={Boolean(participant)} onOpenChange={(open) => !open && onClose()}>
      {participant && (
        <DialogContent dir="rtl" className="max-h-[90dvh] gap-4 overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{participant.firstName}</DialogTitle>
            <DialogDescription>
              תאריך הרשמה: {formatDateTime(participant.createdAt)} · עדכון אחרון{" "}
              {formatDateTime(participant.updatedAt)}
            </DialogDescription>
          </DialogHeader>

          <Section title="יום 1 – הסדר שלי" completedAt={participant.day1.completedAt}>
            <dl>
              {MEALS.map((meal) => (
                <Row
                  key={meal.key}
                  label={`${meal.emoji} ${meal.label}`}
                  value={formatPoint(participant.day1[meal.key])}
                />
              ))}
              {participant.day1.additionalSnacks
                .filter((s) => s.time || s.food)
                .map((snack, i) => (
                  <Row key={i} label={`🍪 נשנוש ${i + 1}`} value={formatPoint(snack)} />
                ))}
              <Row
                label="הכי קשה"
                value={
                  HARDEST_OPTIONS.find((o) => o.value === participant.day1.hardestMoment)?.label ??
                  "—"
                }
              />
            </dl>
          </Section>

          <Section title="יום 2 – הצלחת שלי" completedAt={participant.day2.completedAt}>
            <dl>
              <Row
                label="ארוחה שנבחרה"
                value={
                  MEAL_OPTIONS.find((o) => o.value === participant.day2.mealChosen)?.label ?? "—"
                }
              />
              <Row label="חלבון" value={yesNo(participant.day2.protein)} />
              <Row label="ירקות" value={yesNo(participant.day2.vegetables)} />
              <Row label="פחמימה" value={yesNo(participant.day2.carbs)} />
              <Row label="שומן" value={yesNo(participant.day2.fat)} />
              {participant.day2.completedAt && (
                <Row label="הפידבק שהתקבל" value={getDay2Feedback(participant.day2).title} />
              )}
            </dl>
          </Section>

          <Section title="יום 3 – הפתרון שלי" completedAt={participant.day3.completedAt}>
            <dl>
              <Row
                label="הרגע הקשה"
                value={describeChoices(MOMENT_OPTIONS, [participant.day3.momentChoice], participant.day3.momentOther) || "—"}
              />
              <Row
                label="בדרך כלל קורה"
                value={describeChoices(HAPPENS_OPTIONS, participant.day3.happensChoices, participant.day3.happensOther) || "—"}
              />
              <Row
                label="מה היה עוזר"
                value={describeChoices(HELP_OPTIONS, participant.day3.helpChoices, participant.day3.helpOther) || "—"}
              />
              <Row label="הדבר האחד" value={orDash(participant.day3.oneThing)} />
              <Row label="הוסיפו" value={orDash(participant.day3.extraNote)} />
            </dl>
          </Section>

          <Section title="ארגז הכלים" completedAt={participant.toolbox.completedAt}>
            <dl>
              <Row
                label="הכלים שנבחרו"
                value={
                  participant.toolbox.selectedTools
                    .map((id) => TOOLS_BY_ID[id] && `${TOOLS_BY_ID[id].emoji} ${TOOLS_BY_ID[id].name}`)
                    .filter(Boolean)
                    .join("\n") || "—"
                }
              />
              <Row label="ארוחת 5 דקות" value={orDash(participant.toolbox.fiveMinuteMeal)} />
              <Row label="בתיק היום" value={orDash(participant.toolbox.bagSnack)} />
              <Row
                label="תמיד יש בבית"
                value={participant.toolbox.homeChecklist.join(", ") || "—"}
              />
            </dl>
          </Section>
        </DialogContent>
      )}
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}

function formatPoint({ time, food }: { time: string; food: string }) {
  if (!time && !food) return "—"
  return [time, food].filter(Boolean).join(" · ")
}
