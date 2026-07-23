import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { DateDifference } from "@/components/tools/DateDifference";

const schema = z.object({
  startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid start date" }),
  endDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid end date" }),
});

export type DateDiffInput = z.infer<typeof schema>;
export interface DateDiffOutput {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  businessDays: number;
}

function compute(input: DateDiffInput): DateDiffOutput {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const [earlier, later] = start <= end ? [start, end] : [end, start];

  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(later.getFullYear(), later.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);

  let businessDays = 0;
  const cursor = new Date(earlier);
  for (let i = 0; i < totalDays; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) businessDays++;
  }

  return { years, months, days, totalDays, totalWeeks, businessDays };
}

export const dateDifferenceTool: ToolConfig<DateDiffInput, DateDiffOutput> = {
  id: "date-difference",
  slug: "date-difference",
  title: "Date Difference Calculator",
  shortDescription: "Calculate the exact number of days, weeks, months and years between two dates.",
  longDescription:
    "The Date Difference Calculator finds the precise span between any two dates — in years, months, days, total days, total weeks and business days (excluding weekends) — useful for project planning, deadlines and legal timelines.",
  category: "calculators",
  icon: "CalendarRange",
  isTrending: true,
  seo: {
    metaTitle: "Date Difference Calculator - Days Between Dates Free",
    metaDescription: "Free date difference calculator. Find days, weeks, months and years between two dates instantly.",
    keywords: ["date difference calculator", "days between dates", "date calculator"],
  },
  inputSchema: schema,
  compute,
  component: DateDifference,
  faq: [{ question: "Does it count weekends in business days?", answer: "No, business days exclude Saturdays and Sundays. Public holidays are not accounted for." }],
  relatedToolSlugs: ["age-calculator", "time-calculator"],
  exampleInput: { startDate: "2026-01-01", endDate: "2026-12-31" },
};
