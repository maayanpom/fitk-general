import { useParticipant } from "@/data/participantContext"

export function useSavedTools() {
  const { participant, updateSection } = useParticipant()
  const selected = participant.toolbox.selectedTools

  const toggle = (id: string) =>
    updateSection("toolbox", {
      selectedTools: selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id],
    })

  return { selected, isSaved: (id: string) => selected.includes(id), toggle }
}
