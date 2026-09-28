import { Lock } from "lucide-react"
import { Link } from "react-router-dom"
import styled from "styled-components"

const Footer = styled.footer`
  display: flex;
  justify-content: center;
  padding-top: 8px;
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

export function PageFooter() {
  return (
    <Footer>
      <PolicyLink to="/privacy-policy">
        <Lock size={14} />
        מדיניות פרטיות
      </PolicyLink>
    </Footer>
  )
}
