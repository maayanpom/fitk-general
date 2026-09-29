import type { ReactNode } from "react"
import styled from "styled-components"
import { Card } from "@/components/ui/card"

const Wrap = styled(Card)`
  padding: 16px;
  gap: 14px;
  box-shadow: 0 1px 2px oklch(0.3 0.06 300 / 0.06), 0 6px 18px -10px oklch(0.3 0.06 300 / 0.18);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Emoji = styled.span`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--secondary);
  font-size: 1.15rem;
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
`

type Props = {
  emoji: string
  title: string
  children: ReactNode
}

export function PointCard({ emoji, title, children }: Props) {
  return (
    <Wrap>
      <Header>
        <Emoji aria-hidden>{emoji}</Emoji>
        <Title>{title}</Title>
      </Header>
      {children}
    </Wrap>
  )
}
