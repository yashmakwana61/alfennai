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
  intro: [
    "Enter your date of birth to get your exact age in years, months and days — plus total days lived, total weeks, and days until your next birthday.",
    "Optionally set a comparison date to find your age on any specific day, past or future.",
  ],
  longDescription:
    "Wondering exactly how old you are -- not just in years, but down to the month and day? This free age calculator gives you a precise breakdown instantly: enter your date of birth, and optionally a specific date to measure against, and it works out your exact age.\n\nUnlike simple \"subtract the birth year\" math, this calculator accounts for the actual number of days in each month and for leap years, so the result is genuinely accurate -- not an approximation. That matters for anything where exact age counts: eligibility checks, legal age verification, insurance forms, or just settling an argument about who's older.\n\nBeyond your age in years, months and days, you also get your total number of days lived, total weeks, and exactly how many days remain until your next birthday. All calculations happen instantly in your browser -- your birth date is never sent anywhere.",
  category: "calculators",
  icon: "Cake",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "Age Calculator - Calculate Your Exact Age Online Free",
    metaDescription:
      "Free online age calculator. Find your exact age in years, months and days from your date of birth instantly. Accurate and easy to use.",
    keywords: ["age calculator", "calculate age", "date of birth calculator", "how old am i", "age calculator by date of birth", "exact age calculator"],
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
        "Yes. Enter a comparison date to see what your age was, or will be, on any specific day -- useful for figuring out age at a past event or a future eligibility date.",
    },
    {
      question: "Why does my age in years differ from what I expected?",
      answer:
        "If your birthday hasn't occurred yet this year relative to the comparison date, your age in completed years is one less than the current calendar year minus your birth year. This calculator handles that adjustment automatically.",
    },
    {
      question: "Does this account for leap years?",
      answer:
        "Yes. The calculation uses actual calendar dates (via JavaScript's native Date handling), so February 29th in leap years is counted correctly rather than assumed away.",
    },
    {
      question: "Is my birth date stored or sent anywhere?",
      answer:
        "No. The calculation runs entirely in your browser using JavaScript -- your date of birth is never transmitted to a server or stored.",
    },
  ],
  relatedToolSlugs: ["date-difference", "time-calculator"],
  contentSections: [
    {
      heading: "Worked example",
      paragraphs: [
        "Born 15 June 1995, measured as of 30 September 2026: 31 years, 3 months and 15 days old — 11,430 total days lived (1,632 weeks), with 258 days until the next birthday.",
        "Leap-day birthdays work too: born 29 February 2000 and measured on the same date, the result is 26 years, 7 months and 1 day, because February 29th in leap years is counted as a real calendar day.",
      ],
    },
    {
      heading: "Age math versus eligibility",
      paragraphs: [
        "Age calculation here is a mathematical date calculation: full calendar difference between two dates. Whether that age qualifies you for an exam, job, visa, pension or legal requirement depends on the authority's own rules and cutoff date — which this calculator does not know.",
        "Use the comparison date to test a cutoff: enter the authority's cutoff day (for example, “age as of 1 August”) rather than today. To measure the gap between any two dates directly, use the [date difference calculator](/tools/calculators/date-difference).",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This is date arithmetic, not legal advice — eligibility always follows the applicable authority's rules.",
        "Results depend on the comparison date; the default is today, so the same birth date gives a different answer tomorrow.",
        "Time zones and time-of-day are not modelled — dates are treated as whole calendar days.",
      ],
    },
  ],
  exampleInput: { birthDate: "1995-06-15" },
};
