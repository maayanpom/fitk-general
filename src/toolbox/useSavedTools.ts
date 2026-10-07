import { useParticipant } from "@/data/participantContext"

export const MIN_TOOLS = 2
export const MAX_TOOLS = 4
export const TOOLS_LIMIT_EVENT = "toolbox:limit"

export function useSavedTools() {
  const { participant, updateSection } = useParticipant()
  const selected = participant.toolbox.selectedTools

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      updateSection("toolbox", { selectedTools: selected.filter((t) => t !== id) })
    } else if (selected.length >= MAX_TOOLS) {
      // Soft message instead of an error; the page listens for this.
      window.dispatchEvent(new Event(TOOLS_LIMIT_EVENT))
    } else {
      updateSection("toolbox", { selectedTools: [...selected, id] })
    }
  }

  return { selected, isSaved: (id: string) => selected.includes(id), toggle }
}
