import { MessageCircle, Users } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { personalFeedbackUrl, whatsAppLinkForPhone } from "@/config"

const LinkButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
`

// "Have a question? Write me on WhatsApp", shown at the end of every day.
export function QuestionButton({ phone }: { phone: string | undefined }) {
  if (!phone) return null

  return (
    <LinkButton variant="outline" asChild>
      <a
        href={whatsAppLinkForPhone(phone, "היי, יש לי שאלה לגבי האתגר 🙂")}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle />
        שאלה? כתבו לי בוואטסאפ
      </a>
    </LinkButton>
  )
}

type PersonalFeedbackButtonProps = {
  firstName?: string
  // The owning coach's WhatsApp number - undefined while still loading, in
  // which case the button just doesn't render yet rather than showing a
  // broken link.
  phone: string | undefined
}

export function PersonalFeedbackButton({ firstName, phone }: PersonalFeedbackButtonProps) {
  if (!phone) return null

  return (
    <LinkButton variant="outline" asChild>
      <a href={personalFeedbackUrl(phone, firstName)} target="_blank" rel="noopener noreferrer">
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

// Renders nothing if the coach hasn't set a community link (still loading,
// or simply hasn't added one yet in her settings) - no broken/placeholder link.
export function CommunityInvite({ communityUrl }: { communityUrl: string | null | undefined }) {
  if (!communityUrl) return null

  return (
    <Invite>
      <h3>רוצים להמשיך איתי גם אחרי האתגר?</h3>
      <p>
        בקהילה שלי אני משתפת טיפים פשוטים וישימים שיעזרו לכם לשמור על אורח חיים מאוזן גם
        בשגרה האמיתית.
      </p>
      <LinkButton asChild>
        <a href={communityUrl} target="_blank" rel="noopener noreferrer">
          <Users />
          הצטרפו לקהילת הטיפים שלי
        </a>
      </LinkButton>
    </Invite>
  )
}
