import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { SalaryHikeCalculator } from "@/components/tools/SalaryHikeCalculator";
import {
  MAX_HIKE_PCT,
  calculateHike,
} from "@/lib/finance/salary-hike-calculator";
import { MAX_INPUT_AMOUNT, formatINR } from "@/lib/finance/salary-calculator";

const schema = z.object({
  currentSalary: z
    .number({ invalid_type_error: "Current salary must be a number" })
    .positive("Enter your current salary greater than 0")
    .max(MAX_INPUT_AMOUNT, "Salary looks too large — please check the value"),
  hikePct: z
    .number({ invalid_type_error: "Hike percentage must be a number" })
    .min(0, "Hike percentage cannot be negative")
    .max(MAX_HIKE_PCT, `Hike percentage looks too large — the maximum is ${MAX_HIKE_PCT}%`),
  period: z.enum(["annual", "monthly"]),
});

export type SalaryHikeToolInput = z.infer<typeof schema>;
export type SalaryHikeToolOutput = ReturnType<typeof calculateHike>;

function compute(input: SalaryHikeToolInput): SalaryHikeToolOutput {
  return calculateHike({
    currentSalary: input.currentSalary,
    hikePct: input.hikePct,
    period: input.period,
  });
}

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculateHike({ currentSalary: 600000, hikePct: 10, period: "annual" });

export const salaryHikeTool: ToolConfig<SalaryHikeToolInput, SalaryHikeToolOutput> = {
  id: "salary-hike-calculator",
  slug: "salary-hike-calculator",
  title: "Salary Hike Calculator",
  shortDescription: "Calculate your revised salary after a percentage hike, with monthly and annual equivalents.",
  intro: [
    "A salary hike is a percentage increase on your current salary. A 10% hike on a ₹6,00,000 annual salary adds ₹60,000, taking you to ₹6,60,000 a year.",
    "Enter your current salary and hike percentage below to see your hike amount and revised salary, with monthly and annual equivalents side by side.",
  ],
  longDescription:
    "Appraisal season brings one key question: what does a percentage hike actually mean in rupees? This calculator answers it directly — enter your current salary and the hike percentage to get the absolute increase and your revised salary.\n\nIt works with both annual and monthly salaries and always shows the equivalent figures for the other period, so you can read the answer whichever way your offer letter states it.\n\nThis is a pure arithmetic estimate of the raise itself. It does not model income tax, PF, deductions or bonuses — your actual take-home pay after a hike depends on those, which the Salary Calculator can estimate separately.",
  category: "finance",
  icon: "TrendingUp",
  isNew: true,
  seo: {
    metaTitle: "Salary Hike Calculator - Calculate Revised Salary After Increment",
    metaDescription:
      "Free salary hike calculator for India. Calculate hike amount and revised salary in INR with monthly and annual equivalents after any percentage increment.",
    keywords: [
      "salary hike calculator",
      "salary increment calculator",
      "salary increase calculator",
      "hike percentage calculator",
      "revised salary calculator",
      "appraisal hike calculator",
      "calculate salary after hike",
    ],
  },
  inputSchema: schema,
  compute,
  component: SalaryHikeCalculator,
  formulas: [
    {
      label: "Hike amount",
      expression: "Hike amount = Current salary × Hike percentage ÷ 100",
      explanation: "The absolute rupee increase added to your salary.",
    },
    {
      label: "Revised salary",
      expression: "Revised salary = Current salary + Hike amount",
      explanation: "Your new salary after the increment, before any deductions.",
    },
  ],
  contentSections: [
    {
      heading: "How to calculate a salary hike",
      paragraphs: [
        "Take your current salary and multiply it by the hike percentage divided by 100 — that gives the hike amount in rupees. Add it to your current salary to get the revised salary.",
        "For example, a 10% hike on ₹6,00,000 a year adds ₹60,000, giving a revised salary of ₹6,60,000 a year. The calculator below does this instantly for any salary and percentage, including decimals.",
      ],
    },
    {
      heading: "Salary hike formula",
      paragraphs: [
        `Hike amount = current salary × hike percentage ÷ 100, and revised salary = current salary + hike amount. With current salary ${formatINR(workedExample.currentAnnual)} a year and a 10% hike, the hike amount is ${formatINR(workedExample.hikeAnnual)} and the revised salary is ${formatINR(workedExample.revisedAnnual)} a year — ${formatINR(workedExample.revisedMonthly)} a month.`,
      ],
    },
    {
      heading: "Salary hike example",
      paragraphs: [
        "Illustrative example computed by this calculator: current salary ₹6,00,000 a year with a 10% hike.",
      ],
      table: {
        headers: ["Metric", "Before hike", "Increase", "After hike"],
        rows: [
          [
            "Annual salary",
            formatINR(workedExample.currentAnnual),
            `+${formatINR(workedExample.hikeAnnual)}`,
            formatINR(workedExample.revisedAnnual),
          ],
          [
            "Monthly salary",
            formatINR(workedExample.currentMonthly),
            `+${formatINR(workedExample.hikeMonthly)}`,
            formatINR(workedExample.revisedMonthly),
          ],
        ],
      },
    },
    {
      heading: "How to calculate revised monthly salary",
      paragraphs: [
        "If your salary is stated monthly, apply the hike percentage to the monthly figure directly — a 10% hike on ₹50,000 a month gives ₹55,000 a month. Multiply by 12 for the annual equivalents.",
        "If your salary is stated annually, divide the revised annual salary by 12: ₹6,60,000 a year after a 10% hike equals ₹55,000 a month. The calculator shows both views automatically.",
      ],
    },
    {
      heading: "Salary hike vs salary increase percentage",
      paragraphs: [
        "Salary hike and salary increase percentage mean the same thing in appraisal conversations: the percentage added to your current salary. To check a percentage from two figures, divide the hike amount by the current salary and multiply by 100 — a ₹60,000 raise on ₹6,00,000 is a 10% hike.",
        "Note that a hike percentage applies to your gross salary figure, not directly to take-home pay: deductions and taxes mean the in-hand increase is usually smaller in percentage terms.",
      ],
    },
    {
      heading: "What this calculator includes",
      list: [
        "Current salary in INR (annual or monthly)",
        "Hike percentage from 0% up to 1000%, decimals allowed",
        "Hike amount in rupees",
        "Revised salary after the increment",
        "Automatic monthly and annual equivalents",
      ],
    },
    {
      heading: "What this calculator does not include",
      list: [
        "Income tax on the revised salary",
        "PF, professional tax, gratuity or other deductions",
        "Bonuses, variable pay or employer contributions",
        "Exact payslip amounts — payroll timing and components vary",
        "Take-home pay estimation (see the Salary Calculator for that)",
      ],
    },
  ],
  faq: [
    {
      question: "What is a salary hike?",
      answer:
        "A salary hike (increment) is a percentage increase applied to your current salary, usually decided during the annual appraisal cycle. A 10% hike multiplies your salary by 1.10.",
    },
    {
      question: "How do I calculate a salary hike percentage?",
      answer:
        "Divide the hike amount by your current salary and multiply by 100. For example, a ₹60,000 raise on a ₹6,00,000 salary is (60,000 ÷ 600,000) × 100 = 10%.",
    },
    {
      question: "How do I calculate salary after a hike?",
      answer:
        "Multiply your current salary by the hike percentage divided by 100 to get the hike amount, then add it to your current salary. Enter both numbers above for an instant result.",
    },
    {
      question: "What is the formula for a salary increment?",
      answer:
        "Hike amount = current salary × hike percentage ÷ 100, and revised salary = current salary + hike amount.",
    },
    {
      question: "How much is a 10% hike on my salary?",
      answer:
        "A 10% hike adds one-tenth of your salary: ₹60,000 on ₹6,00,000 a year (revised ₹6,60,000), or ₹5,000 on ₹50,000 a month (revised ₹55,000). Try your own figure in the calculator.",
    },
    {
      question: "How do I convert annual salary after a hike into monthly salary?",
      answer:
        "Divide the revised annual salary by 12. For example, ₹6,60,000 a year after a hike equals ₹55,000 a month. The calculator shows both automatically.",
    },
    {
      question: "Is salary hike the same as take-home increase?",
      answer:
        "No. The hike applies to your gross salary figure; PF, professional tax and income tax are then deducted, so the in-hand increase is usually smaller. Use the Salary Calculator to estimate take-home pay.",
    },
    {
      question: "Does a salary hike automatically increase CTC?",
      answer:
        "Usually the revised gross becomes the basis for a revised CTC, but CTC also contains employer-side components that may be recalculated. Confirm the new CTC with your employer rather than assuming it equals the revised salary.",
    },
    {
      question: "Can I use this calculator for monthly salary?",
      answer:
        "Yes. Select the Monthly period, enter your monthly salary and hike percentage, and you will get the revised monthly salary plus annual equivalents.",
    },
    {
      question: "Does this calculator include income tax and PF?",
      answer:
        "No. It calculates the mathematical raise only — no tax, PF, gratuity, deductions or bonuses. Your actual payslip after a hike depends on all of these.",
    },
  ],
  relatedToolSlugs: ["salary-calculator", "ctc-to-in-hand", "percentage-calculator"],
  exampleInput: { currentSalary: 600000, hikePct: 10, period: "annual" },
};
