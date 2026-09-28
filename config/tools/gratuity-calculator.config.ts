import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { GratuityCalculator } from "@/components/tools/GratuityCalculator";
import {
  MAX_MONTHLY_WAGE,
  MAX_RATE_DAYS,
  MAX_SERVICE_YEARS,
  STATUTORY_RATE_DAYS,
  calculateGratuity,
} from "@/lib/finance/gratuity-calculator";
import { formatINR } from "@/lib/finance/salary-calculator";

const schema = z.object({
  monthlyWage: z
    .number({ invalid_type_error: "Monthly wage must be a number" })
    .positive("Enter the monthly wage used for gratuity greater than 0")
    .max(MAX_MONTHLY_WAGE, "Wage looks too large — please check the value"),
  completedYears: z
    .number({ invalid_type_error: "Years of service must be a number" })
    .int("Years of service must be a whole number")
    .min(0, "Years of service cannot be negative")
    .max(MAX_SERVICE_YEARS, "Years of service look too large — please check the value"),
  additionalMonths: z
    .number({ invalid_type_error: "Additional months must be a number" })
    .int("Additional months must be a whole number")
    .min(0, "Additional months cannot be negative")
    .max(11, "Additional months must be between 0 and 11"),
  employeeType: z.enum(["regular", "fixed-term"]),
  useContractualRate: z.boolean(),
  contractualRateDays: z
    .number({ invalid_type_error: "Contractual rate must be a number" })
    .min(1, "Contractual rate must be at least 1 day")
    .max(MAX_RATE_DAYS, `Contractual rate cannot exceed ${MAX_RATE_DAYS} days`),
});

export type GratuityToolInput = z.infer<typeof schema>;
export type GratuityToolOutput = ReturnType<typeof calculateGratuity>;

function compute(input: GratuityToolInput): GratuityToolOutput {
  return calculateGratuity({
    monthlyWage: input.monthlyWage,
    completedYears: input.completedYears,
    additionalMonths: input.additionalMonths,
    employeeType: input.employeeType,
    useContractualRate: input.useContractualRate,
    contractualRateDays: input.contractualRateDays,
  });
}

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculateGratuity({
  monthlyWage: 50000,
  completedYears: 7,
  additionalMonths: 8,
  employeeType: "regular",
  useContractualRate: false,
  contractualRateDays: STATUTORY_RATE_DAYS,
});

export const gratuityCalculatorTool: ToolConfig<GratuityToolInput, GratuityToolOutput> = {
  id: "gratuity-calculator",
  slug: "gratuity-calculator",
  title: "Gratuity Calculator India",
  shortDescription: "Estimate gratuity from monthly wage and years of service using the 15/26 statutory formula.",
  intro: [
    "A gratuity calculator estimates the gratuity amount using the monthly wage relevant to gratuity, qualifying years of service, and the applicable calculation rate.",
    "Enter your gratuity-relevant monthly wage and service period below. The result is an estimate — not a guaranteed payout — so always check your employment terms and the applicable law.",
  ],
  longDescription:
    "Gratuity is a lump sum paid for long service, calculated at 15 days' wages for every qualifying year on the wages last drawn. For monthly-rated employees the statute converts this to monthly wage ÷ 26 × 15 per year of service.\n\nQualifying years follow a precise rule: only an extra part of the final year in excess of six months rounds up — six months exactly does not. Eligibility assumptions also differ: the standard estimate assumes five years of continuous service for regular employees, while fixed-term employees engaged directly by the employer can be eligible after one year under the contract.\n\nThis calculator implements that model with no legal advice attached: it shows the eligibility status, the formula breakdown, and the estimated amount, and it never applies a statutory maximum cap it cannot verify.",
  category: "finance",
  icon: "Award",
  isNew: true,
  seo: {
    metaTitle: "Gratuity Calculator India - Calculate Your Gratuity",
    metaDescription:
      "Calculate estimated gratuity in India from monthly wage and years of service. 15/26 formula, eligibility assumptions and current rules.",
    keywords: [
      "gratuity calculator india",
      "gratuity calculator",
      "gratuity calculation formula",
      "15/26 gratuity formula",
      "gratuity eligibility",
      "gratuity for 5 years",
      "fixed term gratuity",
    ],
  },
  inputSchema: schema,
  compute,
  component: GratuityCalculator,
  formulas: [
    {
      label: "Statutory gratuity formula",
      expression: "Gratuity = Monthly wage ÷ 26 × 15 × Qualifying years",
      explanation: "15 days' wages per qualifying year; the ÷ 26 converts a monthly wage to the daily basis.",
    },
    {
      label: "Qualifying years",
      expression: "Qualifying = Completed years + (extra months > 6 ? 1 : 0)",
      explanation: "Only a final-year part in excess of six months rounds up — six months exactly does not.",
    },
  ],
  contentSections: [
    {
      heading: "How the Gratuity Calculator Works",
      paragraphs: [
        "Enter the monthly wage relevant to gratuity, your completed years of service plus any extra months, and your employment type. The calculator converts the wage to a daily basis, determines qualifying years, checks the standard eligibility assumption, and produces the estimated amount.",
        "Every figure on the result — wage used, qualifying years, rate, daily basis and final amount — comes from the same calculation engine, so the breakdown always reconciles.",
      ],
    },
    {
      heading: "Gratuity Formula in India",
      paragraphs: [
        "The statutory formula pays 15 days' wages for every qualifying year of service, based on the wages last drawn. For monthly-rated employees, fifteen days' wages means the monthly wage divided by 26 and multiplied by 15.",
        "With a better contractual rate, the same structure applies with the agreed number of days instead of 15 — but that calculation is contractual, not statutory, and this calculator labels it accordingly.",
      ],
    },
    {
      heading: "How Years of Service Affect Gratuity",
      paragraphs: [
        "Only completed years count, plus one extra year when the leftover part of the final year exceeds six months. So 7 years 8 months gives 8 qualifying years, while 5 years 6 months stays at 5.",
        "The six-month line is strict: exactly six months never rounds up. This follows the statutory phrase part thereof in excess of six months.",
      ],
    },
    {
      heading: "What Monthly Wage Should You Use?",
      paragraphs: [
        "Use the monthly wage relevant to gratuity under the applicable wage definition — not automatically your Basic Salary label, gross salary, or CTC. Payroll labels differ between employers, and the statutory definition of wages can include or exclude components differently. PF uses its own wage and rate rules — see the [PF calculator](/tools/finance/pf-calculator).",
        "If you are unsure which figure your employer treats as gratuity wages, check your appointment letter or payroll records rather than guessing from CTC.",
      ],
    },
    {
      heading: "Gratuity Eligibility: Regular vs Fixed-Term Employees",
      paragraphs: [
        "The standard estimate assumes regular employees need five years of continuous service. Below that, the calculator reports the assumption as not met instead of presenting a payout as guaranteed.",
        "Fixed-term employees engaged directly by the employer can become eligible after one year of service under the contract, on a pro-rata basis, per the Labour Ministry's FAQs on the current framework effective 21 November 2025. This is distinct from contract labour supplied through a contractor, which follows a separate five-year continuous-service rule.",
      ],
    },
    {
      heading: "Gratuity and CTC: What Is the Difference?",
      paragraphs: [
        "Many offer letters show an annual gratuity provision inside CTC, but that provision is an employer's estimated yearly allocation — not the statutory payout, which is computed once from last-drawn wages and service at exit. Walk the full CTC-to-cash bridge with the [CTC to in-hand salary calculator](/tools/finance/ctc-to-in-hand).",
        "Never calculate statutory gratuity directly from CTC: CTC mixes cash salary with employer-side provisions that are not gratuity wages. For the broader salary and take-home picture, use the [salary calculator](/tools/finance/salary-calculator).",
      ],
    },
    {
      heading: "Example Gratuity Calculation",
      paragraphs: [
        "Illustrative example computed by this calculator: monthly wage ₹50,000 with 7 years and 8 months of regular service.",
        `Qualifying service is ${workedExample.qualifyingYears} years. Daily wage basis is ${formatINR(workedExample.dailyBasis)} (₹50,000 ÷ 26), and 15 days' wages are ${formatINR(workedExample.dailyBasis * STATUTORY_RATE_DAYS)} per year — giving an estimated gratuity of ${formatINR(workedExample.gratuityAmount)} (₹50,000 ÷ 26 × 15 × 8).`,
      ],
    },
    {
      heading: "Important Limitations and Assumptions",
      list: [
        "This is an estimate, not legal advice and not a guaranteed payout.",
        "Standard eligibility assumes five years of continuous service for regular employees.",
        "Fixed-term treatment assumes direct engagement under a contract of one year or more.",
        "Death/disablement exceptions are not modelled.",
        "No statutory maximum cap is applied — verify the currently notified ceiling.",
        "The wage you enter is assumed to be the gratuity-relevant wage.",
        "Better contractual terms, awards or settlements are modelled only if you enable them.",
        "A salary change does not automatically change gratuity the same way — increments are estimated with the [salary hike calculator](/tools/finance/salary-hike-calculator), while gratuity follows its own wage and service rules.",
        "Framework described is the Code on Social Security, 2020 position applicable from 21 November 2025.",
      ],
    },
  ],
  faq: [
    {
      question: "What is gratuity?",
      answer:
        "Gratuity is a lump-sum benefit paid for long service when employment ends, calculated from the wages last drawn and the qualifying years of service.",
    },
    {
      question: "How is gratuity calculated in India?",
      answer:
        "At 15 days' wages for every qualifying year of service. For monthly-rated employees that is monthly wage ÷ 26 × 15 × qualifying years.",
    },
    {
      question: "What is the 15/26 gratuity formula?",
      answer:
        "It converts a monthly wage to fifteen days' wages: divide the monthly wage by 26 working days, then multiply by 15. Multiply the result by qualifying years of service.",
    },
    {
      question: "Does six months of extra service count for gratuity?",
      answer:
        "No. Only a final-year part in excess of six months rounds up to an extra qualifying year — exactly six months does not.",
    },
    {
      question: "What happens if service exceeds six months in the final year?",
      answer:
        "Seven or more extra months add one qualifying year. For example, 7 years 8 months counts as 8 qualifying years.",
    },
    {
      question: "Is gratuity calculated on Basic Salary or CTC?",
      answer:
        "Neither automatically. It is calculated on the gratuity-relevant monthly wage, which can differ from Basic, gross salary and CTC labels. Never compute it directly from CTC.",
    },
    {
      question: "Is gratuity available after five years for every employee?",
      answer:
        "No. The standard assumption is five years of continuous service for regular employees, with separate rules for fixed-term employees, working journalists, seasonal establishments, and death or disablement cases.",
    },
    {
      question: "How is gratuity treated for fixed-term employees?",
      answer:
        "Fixed-term employees engaged directly by the employer can be eligible after one year of service under the contract, on a pro-rata basis. This differs from contract labour supplied through a contractor.",
    },
    {
      question: "Is gratuity part of CTC?",
      answer:
        "Offer letters often show a gratuity provision inside CTC, but that is an employer's estimated allocation — the statutory payout is computed separately at exit from last-drawn wages and service.",
    },
    {
      question: "Is the gratuity calculator's result legally guaranteed?",
      answer:
        "No. It is a mathematical estimate under stated assumptions. Actual entitlement depends on your employment terms, service records and the applicable law — verify with your employer or a legal advisor.",
    },
  ],
  relatedToolSlugs: ["salary-calculator", "ctc-to-in-hand", "pf-calculator", "salary-hike-calculator", "hra-calculator"],
  exampleInput: {
    monthlyWage: 50000,
    completedYears: 7,
    additionalMonths: 8,
    employeeType: "regular",
    useContractualRate: false,
    contractualRateDays: 15,
  },
};
