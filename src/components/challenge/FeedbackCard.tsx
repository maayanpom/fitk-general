import type { ReactNode } from "react"
import styled from "styled-components"

const Wrap = styled.section`
  padding: 20px 18px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--card);
  border: 1.5px solid var(--primary);
  box-shadow: 0 8px 24px -14px oklch(0.55 0.12 35 / 0.45);
  animation: rise 0.35s ease-out;

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 700;
`

const Body = styled.p`
  margin: 0;
  line-height: 1.7;
  color: var(--secondary-foreground);
`

type Props = {
  title: ReactNode
  body: ReactNode
}

export function FeedbackCard({ title, body }: Props) {
  return (
    <Wrap role="status">
      <Title>{title}</Title>
      <Body>{body}</Body>
    </Wrap>
  )
}
