import { Lock } from "lucide-react"
import { Link } from "react-router-dom"
import styled from "styled-components"

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  text-align: center;
`

const Disclaimer = styled.p`
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.8rem;
  line-height: 1.5;
`

const PolicyLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted-foreground);
  font-size: 0.85rem;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: var(--foreground);
  }
`

export function PageFooter({
  coachSlug,
  disclaimer,
}: {
  coachSlug: string
  disclaimer?: boolean
}) {
  return (
    <Footer>
      {disclaimer && <Disclaimer>תוכן חינוכי ואינו מהווה ייעוץ רפואי או תזונתי.</Disclaimer>}
      <PolicyLink to={coachSlug ? `/${coachSlug}/privacy-policy` : "/privacy-policy"}>
        <Lock size={14} />
        מדיניות פרטיות
      </PolicyLink>
    </Footer>
  )
}
