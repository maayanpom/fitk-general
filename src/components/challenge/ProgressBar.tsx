import styled from "styled-components"
import { useParticipantState } from "@/data/participantContext"

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
  align-items: baseline;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--deep);
  line-height: 1.2;

  .status {
    font-weight: 500;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }
`

// Three segments, one per day: done = solid, current = medium, next = light.
const Segments = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`

const Segment = styled.div<{ $state: "done" | "current" | "next" }>`
  height: 8px;
  border-radius: 999px;
  background: ${({ $state }) =>
    $state === "done"
      ? "var(--primary)"
      : $state === "current"
        ? "color-mix(in oklab, var(--primary) 45%, var(--lavender))"
        : "var(--lavender)"};
  transition: background 0.6s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const STATUS_TEXT = { saving: "שומרים...", saved: "נשמר ✓" } as const

export function ProgressBar({ day }: { day: 1 | 2 | 3 }) {
  const { participant, syncState } = useParticipantState()
  const doneDays = [participant?.day1, participant?.day2, participant?.day3].map((d) =>
    Boolean(d?.completedAt),
  )
  const status = syncState === "saving" || syncState === "saved" ? STATUS_TEXT[syncState] : ""

  return (
    <>
      <Bar data-progress-bar="">
        <Inner>
          <Labels>
            <span>יום {day} מתוך 3</span>{" "}
            <span className="status" role="status" aria-live="polite">
              {status}
            </span>
          </Labels>
          <Segments
            role="progressbar"
            aria-label={`יום ${day} מתוך 3`}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={day}
            aria-valuetext={`יום ${day} מתוך 3`}
          >
            {([1, 2, 3] as const).map((d) => (
              <Segment
                key={d}
                $state={doneDays[d - 1] ? "done" : d === day ? "current" : "next"}
              />
            ))}
          </Segments>
        </Inner>
      </Bar>
      {/* Space the fixed bar takes up, so page content starts below it. */}
      <div aria-hidden style={{ height: 30, marginBottom: -12 }} />
    </>
  )
}
