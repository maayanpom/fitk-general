import type { ComponentType } from "react"
import Day1Page from "@/days/day1/Day1Page"
import Day2Page from "@/days/day2/Day2Page"
import Day3Page from "@/days/day3/Day3Page"
import ToolboxPage from "@/toolbox/ToolboxPage"

export type ChallengePage = {
  slug: string
  title: string
  Component: ComponentType
}

// Participant-facing pages. Each one is standalone - there is no navigation between them.
export const PAGES: ChallengePage[] = [
  { slug: "challenge-day-1", title: "יום 1 – הסדר שלי", Component: Day1Page },
  { slug: "challenge-day-2", title: "יום 2 – הצלחת שלי", Component: Day2Page },
  { slug: "challenge-day-3", title: "יום 3 – הפתרון שלי", Component: Day3Page },
  { slug: "toolbox", title: "ארגז הכלים שלי לימים עמוסים", Component: ToolboxPage },
]
