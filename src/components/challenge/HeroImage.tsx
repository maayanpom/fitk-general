import type { ReactNode } from "react"
import styled from "styled-components"

const Figure = styled.header`
  position: relative;
  height: 220px;
  overflow: hidden;
  border-radius: calc(var(--radius) * 1.8);
  color: #fff;
  background: var(--deep);

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 18px 18px 20px;
  background: linear-gradient(
    to top,
    rgb(43 33 64 / 0.86) 0%,
    rgb(43 33 64 / 0.4) 50%,
    rgb(43 33 64 / 0) 100%
  );

  h1 {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 800;
    line-height: 1.2;
    color: #fff;
  }
`

const Badge = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  min-width: 56px;
  height: 56px;
  padding: 0 8px;
  border-radius: 18px;
  background: var(--lavender);
  color: var(--deep);
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
`

type Props = {
  image: string
  badge: ReactNode
  title: string
}

export function HeroImage({ image, badge, title }: Props) {
  return (
    <Figure>
      <img src={image} alt="" fetchPriority="high" decoding="async" />
      <Overlay>
        <Badge aria-hidden>{badge}</Badge>
        <h1>{title}</h1>
      </Overlay>
    </Figure>
  )
}
