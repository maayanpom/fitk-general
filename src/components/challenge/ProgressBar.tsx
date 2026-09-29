import styled from "styled-components"

const Bar = styled.div`
  position: fixed;
  top: 0;
  inset-inline: 0;
  z-index: 30;
  padding: 10px 16px 12px;
  background: rgb(251 246 239 / 0.94);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--border);
`

const Inner = styled.div`
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--deep);
  line-height: 1.2;
`

const Track = styled.div`
  height: 8px;
  border-radius: 999px;
  background: var(--lavender);
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: var(--primary);
`

// Space the fixed bar takes up, so page content starts below it.
const Spacer = styled.div`
  height: 30px;
  margin-bottom: -12px;
`

const PERCENT = { 1: 33, 2: 66, 3: 100 } as const

export function ProgressBar({ day }: { day: 1 | 2 | 3 }) {
  const percent = PERCENT[day]
  return (
    <>
      <Bar>
        <Inner>
          <Labels>
            <span>יום {day} מתוך 3</span>
            <span>{percent}%</span>
          </Labels>
          <Track
            role="progressbar"
            aria-label={`יום ${day} מתוך 3`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <Fill style={{ width: `${percent}%` }} />
          </Track>
        </Inner>
      </Bar>
      <Spacer aria-hidden />
    </>
  )
}
