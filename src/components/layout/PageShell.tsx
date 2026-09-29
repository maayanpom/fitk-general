import styled from "styled-components"

export const PageShell = styled.main`
  min-height: 100dvh;
  padding: 32px 16px 56px;
  background:
    radial-gradient(120% 60% at 100% 0%, rgb(216 201 240 / 0.6), transparent 60%),
    var(--background);
`

export const PageInner = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

export const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--primary);
`

export const PageTitle = styled.h1`
  margin: 4px 0 0;
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.2;
`

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`

export const Subtle = styled.p`
  margin: 6px 0 0;
  color: var(--muted-foreground);
  font-size: 1rem;
  line-height: 1.7;
`
