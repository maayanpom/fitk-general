import { MessageCircle, Users } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { COMMUNITY_URL, personalFeedbackUrl } from "@/config"

const LinkButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
`

export function PersonalFeedbackButton({ firstName }: { firstName?: string }) {
  return (
    <LinkButton variant="outline" asChild>
      <a href={personalFeedbackUrl(firstName)} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        לקבלת פידבק אישי
      </a>
    </LinkButton>
  )
}

const Invite = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px 18px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--secondary);
  text-align: center;

  h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    line-height: 1.65;
    color: var(--secondary-foreground);
  }
`

export function CommunityInvite() {
  return (
    <Invite>
      <h3>רוצים להמשיך איתי גם אחרי האתגר?</h3>
      <p>
        בקהילה שלי אני משתפת טיפים פשוטים וישימים שיעזרו לכם לשמור על אורח חיים מאוזן גם
        בשגרה האמיתית.
      </p>
      <LinkButton asChild>
        <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
          <Users />
          הצטרפו לקהילת הטיפים שלי
        </a>
      </LinkButton>
    </Invite>
  )
}
