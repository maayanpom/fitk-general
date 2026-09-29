import { createEmptyDay1, type Day1Data } from "@/days/day1/types"

// Which meal the participant is evaluating for day 2 - "" means unanswered.
export type Day2MealChoice = "morning" | "lunch" | "afternoon" | "evening" | "between" | ""

export type Day2Data = {
  mealChosen: Day2MealChoice
  protein: boolean
  vegetables: boolean
  carbs: boolean
  fat: boolean
  completedAt: string
}

export type Day3MomentChoice = "morning" | "lunchWork" | "afternoon" | "evening" | "weekend" | "other" | ""
export type Day3HappensChoice =
  | "skip"
  | "grabWhatever"
  | "quickStanding"
  | "screen"
  | "orderIn"
  | "largeAmount"
  | "other"
  | ""
// Shared taxonomy: what would help (question 3) and the weekly experiment
// use the same categories - the experiment defaults to whatever was picked
// for "what would help", and can be changed independently from there.
export type Day3HelpChoice =
  | "readyMade"
  | "reminder"
  | "protein"
  | "drink"
  | "planAhead"
  | "smallHelp"
  | "other"
  | ""

export type Day3Data = {
  momentChoice: Day3MomentChoice
  happensChoice: Day3HappensChoice
  helpChoice: Day3HelpChoice
  extraNote: string
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
  // Which coach owns this participant - set when a personal /start/:code
  // link is opened (the coach herself never needs this on her own session).
  coachSlug: string
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
  mealChosen: "",
  protein: false,
  vegetables: false,
  carbs: false,
  fat: false,
  completedAt: "",
})

const emptyDay3 = (): Day3Data => ({
  momentChoice: "",
  happensChoice: "",
  helpChoice: "",
  extraNote: "",
  completedAt: "",
})

const emptyToolbox = (): ToolboxData => ({
  selectedTools: [],
  fiveMinuteMeal: "",
  bagSnack: "",
  homeChecklist: [],
  completedAt: "",
})

// Fills in any section/field missing from older saved data.
export function normalizeParticipant(p: Participant): Participant {
  return {
    ...p,
    coachSlug: p.coachSlug ?? "",
    day1: { ...createEmptyDay1(), ...p.day1 },
    day2: { ...emptyDay2(), ...p.day2 },
    day3: { ...emptyDay3(), ...p.day3 },
    toolbox: { ...emptyToolbox(), ...p.toolbox },
  }
}
