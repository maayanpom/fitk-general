import styled, { keyframes } from "styled-components"

const grow = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`

const Wrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
  color: var(--deep);
`

const Track = styled.div`
  height: 12px;
  border-radius: 999px;
  background: var(--lavender);
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: var(--primary);
  transform-origin: right center;
  animation: ${grow} 0.9s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export function CompletionProgress({ percent }: { percent: 33 | 66 | 100 }) {
  return (
    <Wrap>
      <span>הפרופיל שלכם: {percent}%</span>
      <Track role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <Fill style={{ width: `${percent}%` }} />
      </Track>
    </Wrap>
  )
}
