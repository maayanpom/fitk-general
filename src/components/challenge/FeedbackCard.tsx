import type { ReactNode } from "react"
import styled from "styled-components"

const Wrap = styled.section`
  padding: 20px 18px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--selected);
  border: 1.5px solid var(--primary);
  box-shadow: 0 8px 24px -14px oklch(0.35 0.08 300 / 0.45);
  animation: rise 0.45s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
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
  white-space: pre-line;
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
