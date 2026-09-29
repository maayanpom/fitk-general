import { Sunrise } from "lucide-react"
import styled from "styled-components"

const Card = styled.aside`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 18px;
  border-radius: calc(var(--radius) * 1.6);
  background: var(--primary);
  color: var(--primary-foreground);
  box-shadow: 0 10px 26px -14px oklch(0.3 0.06 300 / 0.5);

  svg {
    flex-shrink: 0;
  }

  p {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.5;
  }
`

export function TomorrowCard({ children }: { children: string }) {
  return (
    <Card>
      <Sunrise size={32} aria-hidden />
      <p>{children}</p>
    </Card>
  )
}
