import { createEmptyDay1, type Day1Data } from "@/days/day1/types"

export type Day2Data = {
  protein: boolean
  vegetables: boolean
  carbs: boolean
  fat: boolean
  completedAt: string
}

export type Day3Data = {
  difficultMoment: string
  whatUsuallyHappens: string
  whatIWishFor: string
  completedAt: string
}

export type ToolboxData = {
  selectedTools: string[]
  fiveMinuteMeal: string
  bagSnack: string
  homeChecklist: string[]
  completedAt: string
}

export type Participant = {
  participantId: string
  firstName: string
  day1: Day1Data
  day2: Day2Data
  day3: Day3Data
  toolbox: ToolboxData
  createdAt: string
  updatedAt: string
}

export type Section = "day1" | "day2" | "day3" | "toolbox"

const emptyDay2 = (): Day2Data => ({
  protein: false,
  vegetables: false,
  carbs: false,
  fat: false,
  completedAt: "",
})

const emptyDay3 = (): Day3Data => ({
  difficultMoment: "",
  whatUsuallyHappens: "",
  whatIWishFor: "",
  completedAt: "",
})

const emptyToolbox = (): ToolboxData => ({
  selectedTools: [],
  fiveMinuteMeal: "",
  bagSnack: "",
  homeChecklist: [],
  completedAt: "",
})

export function createParticipant(firstName: string): Participant {
  const now = new Date().toISOString()
  return {
    participantId: crypto.randomUUID(),
    firstName,
    day1: createEmptyDay1(),
    day2: emptyDay2(),
    day3: emptyDay3(),
    toolbox: emptyToolbox(),
    createdAt: now,
    updatedAt: now,
  }
}

// Fills in any section/field missing from older saved data.
export function normalizeParticipant(p: Participant): Participant {
  return {
    ...p,
    day1: { ...createEmptyDay1(), ...p.day1 },
    day2: { ...emptyDay2(), ...p.day2 },
    day3: { ...emptyDay3(), ...p.day3 },
    toolbox: { ...emptyToolbox(), ...p.toolbox },
  }
}
