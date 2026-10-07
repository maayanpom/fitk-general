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

// Day 3 answers. Question 1 is single choice, questions 2 and 3 allow several.
// "other" opens a short free-text field (the *Other fields).
export type Day3MomentChoice = "morning" | "lunchWork" | "afternoon" | "evening" | "weekend" | "other" | ""
export type Day3HappensChoice =
  | "skip"
  | "eatAvailable"
  | "veryHungry"
  | "eatFast"
  | "orderIn"
  | "other"
export type Day3HelpChoice =
  | "readyMade"
  | "quickMeal"
  | "proteinAvailable"
  | "takeAlong"
  | "shortPlan"
  | "noTimeSolution"
  | "other"

export type Day3Data = {
  momentChoice: Day3MomentChoice
  momentOther: string
  happensChoices: Day3HappensChoice[]
  happensOther: string
  helpChoices: Day3HelpChoice[]
  helpOther: string
  oneThing: string
  extraNote: string
  completedAt: string
}

export type ToolboxData = {
  selectedTools: string[]
  fiveMinuteMeal: string
  bagSnack: string
  homeChecklist: string[]
  // The chosen tool they most want to work this week ("unsure" when they don't know yet).
  anchorTool: string
  anchorNote: string
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
  momentOther: "",
  happensChoices: [],
  happensOther: "",
  helpChoices: [],
  helpOther: "",
  oneThing: "",
  extraNote: "",
  completedAt: "",
})

const emptyToolbox = (): ToolboxData => ({
  selectedTools: [],
  fiveMinuteMeal: "",
  bagSnack: "",
  homeChecklist: [],
  anchorTool: "",
  anchorNote: "",
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
