import styled from "styled-components"
import { Button } from "@/components/ui/button"

export const DoneButton = styled(Button).attrs({ size: "lg" })`
  width: 100%;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 999px;
`

// Explains why the button is disabled, so it never looks broken.
export const DoneHint = styled.p`
  margin: 8px 0 0;
  text-align: center;
  color: var(--muted-foreground);
  font-size: 1rem;
`
