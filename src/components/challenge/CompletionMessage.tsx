import { CircleCheck, RotateCw } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import { PersonalFeedbackButton } from "./links"

const Wrap = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;

  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary);
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
`

export function CompletionMessage() {
  const { participant, syncState, retrySync } = useParticipant()
  const coach = useCoachPublicInfo(participant.coachSlug)

  if (syncState === "error") {
    return (
      <Wrap>
        <p>התשובות נשמרו אצלך, אבל לא הצלחנו לשלוח אותן כרגע.</p>
        <Button variant="outline" onClick={() => void retrySync()}>
          <RotateCw />
          נסו שוב
        </Button>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <h3>
        <CircleCheck size={22} />
        המשימה הושלמה
      </h3>
      <p>
        <strong>התשובות שלך נשמרו ונשלחו אליי.</strong>
      </p>
      <p>אם תרצו, אתם מוזמנים לפנות אליי בפרטי ואשמח לתת לכם פידבק.</p>
      <PersonalFeedbackButton firstName={participant.firstName} phone={coach?.phone} />
    </Wrap>
  )
}
