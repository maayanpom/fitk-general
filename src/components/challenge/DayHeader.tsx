import styled from "styled-components"
import { HeroImage } from "./HeroImage"
import { ProgressBar } from "./ProgressBar"

const Lead = styled.p`
  margin: 14px 0 0;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.7;
  color: var(--secondary-foreground);
`

type Props = {
  day: 1 | 2 | 3
  image: string
  title: string
  lead?: string
}

export function DayHeader({ day, image, title, lead }: Props) {
  return (
    <>
      <ProgressBar day={day} />
      <div>
        <HeroImage image={image} badge={day} title={title} />
        {lead && <Lead>{lead}</Lead>}
      </div>
    </>
  )
}
