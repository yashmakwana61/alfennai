import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { AgeCalculator } from "@/components/tools/AgeCalculator";

const ageInputSchema = z.object({
  birthDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Enter a valid date",
  }),
  compareDate: z.string().optional(),
});

export type AgeInput = z.infer<typeof ageInputSchema>;

export interface AgeOutput {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  nextBirthdayInDays: number;
}

function computeAge(input: AgeInput): AgeOutput {
  const birth = new Date(input.birthDate);
  const compare = input.compareDate ? new Date(input.compareDate) : new Date();

  let years = compare.getFullYear() - birth.getFullYear();
  let months = compare.getMonth() - birth.getMonth();
  let days = compare.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(compare.getFullYear(), compare.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMs = compare.getTime() - birth.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);

  const nextBirthday = new Date(compare.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday.getTime() < compare.getTime()) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const nextBirthdayInDays = Math.ceil(
    (nextBirthday.getTime() - compare.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { years, months, days, totalDays, totalWeeks, nextBirthdayInDays };
}

export const ageCalculatorTool: ToolConfig<AgeInput, AgeOutput> = {
  id: "age-calculator",
  slug: "age-calculator",
  title: "Age Calculator",
  shortDescription: "Calculate your exact age in years, months and days from your date of birth.",
  longDescription:
    "The Age Calculator computes your precise age by comparing your date of birth against today's date (or any custom date). It accounts for varying month lengths and leap years to give an exact breakdown in years, months and days, along with total days lived and days remaining until your next birthday.",
  category: "calculators",
  icon: "Cake",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "Age Calculator - Calculate Your Exact Age Online Free",
    metaDescription:
      "Free online age calculator. Find your exact age in years, months and days from your date of birth instantly. Accurate and easy to use.",
    keywords: ["age calculator", "calculate age", "date of birth calculator", "how old am i"],
  },
  inputSchema: ageInputSchema,
  compute: computeAge,
  component: AgeCalculator,
  formulas: [
    {
      label: "Age in years",
      expression: "Age = CompareDate.Year - BirthDate.Year (adjusted for month/day)",
      explanation:
        "The calculator subtracts the birth year from the comparison year, then adjusts by one if the birth month/day hasn't occurred yet in the comparison year.",
    },
  ],
  faq: [
    {
      question: "How is age calculated exactly?",
      answer:
        "We calculate the full calendar difference between your birth date and the comparison date, accounting for the actual number of days in each month and leap years, so the result is precise down to the day.",
    },
    {
      question: "Can I calculate age as of a specific date, not today?",
      answer:
        "Yes. Enter a comparison date to see what your age was, or will be, on any specific day.",
    },
  ],
  relatedToolSlugs: ["date-difference", "time-calculator"],
  exampleInput: { birthDate: "1995-06-15" },
};
