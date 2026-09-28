import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { PfCalculator } from "@/components/tools/PfCalculator";
import {
  DEFAULT_CEILING_MONTHLY,
  MAX_CEILING_MONTHLY,
  MAX_MONTHLY_WAGE,
  MAX_RATE_PCT,
  calculatePf,
} from "@/lib/finance/pf-calculator";
import { formatINR } from "@/lib/finance/salary-calculator";

const schema = z.object({
  monthlyWage: z
    .number({ invalid_type_error: "Basic salary / PF wage must be a number" })
    .positive("Enter your basic salary / PF wage greater than 0")
    .max(MAX_MONTHLY_WAGE, "Wage looks too large — please check the value"),
  employeeRatePct: z
    .number({ invalid_type_error: "Employee rate must be a number" })
    .min(0, "Employee rate cannot be negative")
    .max(MAX_RATE_PCT, "Employee rate cannot exceed 100%"),
  employerRatePct: z
    .number({ invalid_type_error: "Employer rate must be a number" })
    .min(0, "Employer rate cannot be negative")
    .max(MAX_RATE_PCT, "Employer rate cannot exceed 100%"),
  applyCeiling: z.boolean(),
  ceilingMonthly: z
    .number({ invalid_type_error: "Wage ceiling must be a number" })
    .min(0, "Wage ceiling cannot be negative")
    .max(MAX_CEILING_MONTHLY, "Wage ceiling looks too large — please check the value"),
});

export type PfToolInput = z.infer<typeof schema>;
export type PfToolOutput = ReturnType<typeof calculatePf>;

function compute(input: PfToolInput): PfToolOutput {
  return calculatePf({
    monthlyWage: input.monthlyWage,
    employeeRatePct: input.employeeRatePct,
    employerRatePct: input.employerRatePct,
    applyCeiling: input.applyCeiling,
    ceilingMonthly: input.ceilingMonthly,
  });
}

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculatePf({
  monthlyWage: 50000,
  employeeRatePct: 12,
  employerRatePct: 12,
  applyCeiling: true,
  ceilingMonthly: 25000,
});

export const pfCalculatorTool: ToolConfig<PfToolInput, PfToolOutput> = {
  id: "pf-calculator",
  slug: "pf-calculator",
  title: "PF Calculator India",
  shortDescription: "Estimate monthly employee and employer PF contributions from PF wage, rates and the wage ceiling.",
  intro: [
    "Provident Fund (PF/EPF) is a retirement saving where a share of your salary is set aside every month, with your employer adding its own contribution alongside yours.",
    "This calculator estimates both sides from your PF wage and contribution rates, applying the wage ceiling you select. Enter your basic salary (or PF wage), keep the default 12% rates or adjust them, and see monthly and annualized contributions instantly.",
    "The result is an estimate: actual PF treatment depends on EPF/EPS scheme rules, your PF wage, and your employer's payroll policy.",
  ],
  longDescription:
    "Employee Provident Fund contributions are calculated on your PF wage — typically basic salary plus dearness allowance — not on your full CTC or gross salary. A contribution rate (conventionally 12%) is applied to the PF wage for both you and your employer, optionally capped by a wage ceiling.\n\nThis calculator models exactly that: it takes your PF wage, applies each side's rate to the wage used after the ceiling, and shows monthly plus annualized figures. It does not model interest, withdrawals, pension benefits or tax — those belong to separate tools.\n\nBecause the official wage ceiling changed from ₹15,000 to ₹25,000 per month effective 17 September 2026, the ceiling here is a configurable assumption with that date disclosed, not a claim about every month of the financial year.",
  category: "finance",
  icon: "PiggyBank",
  isNew: true,
  seo: {
    metaTitle: "PF Calculator India - Calculate Employee & Employer PF",
    metaDescription:
      "Free PF calculator for India. Estimate monthly employee and employer EPF contributions from PF wage, rates and wage ceiling.",
    keywords: [
      "pf calculator",
      "epf calculator",
      "pf contribution calculator",
      "employee pf calculator",
      "employer pf contribution calculator",
      "provident fund calculator india",
      "pf wage ceiling calculator",
      "pf deduction calculator",
    ],
  },
  inputSchema: schema,
  compute,
  component: PfCalculator,
  formulas: [
    {
      label: "PF wage used",
      expression: "Wage used = min(PF wage, ceiling) when ceiling is on; otherwise PF wage",
      explanation: "The ceiling caps the wage on which the percentage applies — it is not itself the contribution.",
    },
    {
      label: "Monthly contributions",
      expression: "Employee PF = Wage used × Employee rate ÷ 100; Employer = Wage used × Employer rate ÷ 100",
      explanation: "Each side is computed independently from the same wage used.",
    },
  ],
  contentSections: [
    {
      heading: "How PF contribution is calculated",
      paragraphs: [
        "Take the PF wage used for the month and multiply it by the contribution rate: wage used × 12 ÷ 100 gives each side's monthly contribution at the conventional 12% rate.",
        "The combined monthly contribution is simply the employee and employer figures added together. Annualized figures multiply each monthly amount by 12 and are labelled as estimates.",
      ],
    },
    {
      heading: "Employee PF vs employer PF",
      paragraphs: [
        "Employee PF is deducted from your salary — it directly reduces the cash you receive each month. Employer PF is paid by your employer on top of your salary and never passes through your bank account, though it often appears inside CTC — see how it fits into the full package with the [CTC to in-hand salary calculator](/tools/finance/ctc-to-in-hand).",
        "This calculator shows both separately so the take-home impact (your side only) is never confused with the employer's cost. For the full take-home picture including income tax, use the [salary calculator](/tools/finance/salary-calculator).",
      ],
    },
    {
      heading: "What is PF wage?",
      paragraphs: [
        "PF wage is the wage amount on which PF is actually calculated — typically basic salary plus dearness allowance. It is usually smaller than gross salary and much smaller than CTC, because allowances outside basic pay are generally not PF wages.",
        "This calculator operates on the PF wage you enter. It never assumes CTC or gross salary equals PF wage.",
      ],
      table: {
        headers: ["Term", "Meaning"],
        rows: [
          ["CTC", "Employer's total compensation cost."],
          ["Gross salary", "Salary before employee deductions."],
          ["Basic salary", "One salary component, usually the PF base."],
          ["PF wage", "Wage amount used for the PF calculation."],
          ["Employee PF", "Employee-side contribution and salary deduction."],
          ["Employer contribution", "Employer-side contribution, not employee cash."],
        ],
      },
    },
    {
      heading: "What is the EPF wage ceiling?",
      paragraphs: [
        "The wage ceiling caps the monthly wage on which the standard PF calculation applies. For years it was ₹15,000 per month; the government enhanced it to ₹25,000 per month with effect from 17 September 2026.",
        "The ceiling is not a contribution amount and does not mean everyone contributes exactly 12% of ₹25,000 — it caps the wage base, and actual applicability depends on the employee's circumstances and the employer's policy under the scheme rules. This calculator therefore keeps the ceiling configurable, defaulting to the current ₹25,000 rule.",
        "Because the change took effect mid-financial-year, this calculator estimates one representative current month and does not reconstruct individual months before 17 September 2026.",
      ],
    },
    {
      heading: "PF calculation example",
      paragraphs: [
        "Illustrative example using the calculator's default assumptions: PF wage ₹50,000 a month, 12% rates on both sides, ₹25,000 monthly ceiling applied.",
      ],
      table: {
        headers: ["Item", "Amount"],
        rows: [
          ["PF wage entered", `${formatINR(workedExample.wageEntered)}/month`],
          ["Ceiling", `${formatINR(workedExample.ceilingMonthly)}/month`],
          ["PF wage used", `${formatINR(workedExample.wageUsed)}/month`],
          ["Employee contribution at 12%", `${formatINR(workedExample.employeeMonthly)}/month`],
          ["Employer contribution at 12%", `${formatINR(workedExample.employerMonthly)}/month`],
          ["Combined contribution", `${formatINR(workedExample.combinedMonthly)}/month`],
          ["Annualized combined", `${formatINR(workedExample.combinedAnnualized)}/year`],
        ],
      },
    },
    {
      heading: "Why PF may differ from your salary",
      paragraphs: [
        "PF is calculated on PF wage, not on CTC or gross salary, so a large CTC with a modest basic produces a modest PF. Different employers also structure basic pay differently, and payroll policies on ceilings and voluntary contributions vary.",
        "If your payslip PF differs from this estimate, compare the PF wage and ceiling your employer actually used against the assumptions above. Comparing pay before and after an increment? Calculate the raise with the [salary hike calculator](/tools/finance/salary-hike-calculator), then review the PF assumptions here.",
      ],
    },
    {
      heading: "What this PF calculator includes",
      list: [
        "Monthly PF wage entered by you (basic salary / PF wage)",
        "Configurable employee and employer contribution rates (0–100%)",
        "Optional monthly wage ceiling, defaulting to the current ₹25,000 rule",
        "PF wage used after the ceiling, shown separately",
        "Monthly employee, employer and combined contributions",
        "Annualized equivalents, clearly labelled as estimates",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This is a simplified estimate, not an official EPFO calculation.",
        "Actual PF treatment depends on applicable EPF/EPS scheme rules and employer payroll policy.",
        "PF and gratuity are separate employment-related calculations — gratuity is estimated with the [gratuity calculator](/tools/finance/gratuity-calculator).",
        "PF wage may not equal basic salary in every case.",
        "Employer-side statutory allocation may involve EPS or other components — no EPF/EPS split is modeled.",
        "No EPF interest, maturity, withdrawal or pension-benefit calculation.",
        "No tax or full take-home calculation.",
        "The current-month estimate does not reconstruct FY 2026-27 months before 17 September 2026.",
      ],
    },
  ],
  faq: [
    {
      question: "What is PF?",
      answer:
        "Provident Fund (PF/EPF) is a retirement savings scheme where a percentage of salary is contributed every month by both the employee and the employer, building a long-term corpus with interest.",
    },
    {
      question: "How is employee PF calculated?",
      answer:
        "Multiply the PF wage used by the employee rate: for example, ₹25,000 × 12 ÷ 100 = ₹3,000 a month. The result is deducted from salary.",
    },
    {
      question: "How is employer PF calculated?",
      answer:
        "The same way, with the employer rate: PF wage used × employer rate ÷ 100. The employer's share does not come out of your salary, though statutory allocation between EPF and EPS may apply outside this estimate.",
    },
    {
      question: "What percentage of salary goes to PF?",
      answer:
        "Conventionally 12% each from employee and employer, applied to PF wage (usually basic plus DA) up to the applicable ceiling — but rates and wage treatment can vary, so both rates are editable here.",
    },
    {
      question: "What is the PF wage ceiling?",
      answer:
        "A cap on the monthly wage used for the standard PF calculation. Only the wage up to the ceiling counts when the ceiling is applied; it is not itself anyone's contribution.",
    },
    {
      question: "What is the current EPFO wage ceiling in 2026?",
      answer:
        "₹25,000 per month with effect from 17 September 2026, raised from ₹15,000 per month. This calculator defaults to the current rule but keeps it configurable, and estimates a representative current month rather than earlier months.",
    },
    {
      question: "Is PF calculated on basic salary?",
      answer:
        "Usually PF wage is basic salary plus dearness allowance, which is why this calculator asks for that figure — not CTC or gross salary. Confirm with your payslip what your employer treats as PF wage.",
    },
    {
      question: "Is employer PF part of CTC?",
      answer:
        "Typically yes — offer letters commonly include the employer's PF contribution in CTC even though it is never paid to you as cash. Your own PF contribution is the part deducted from salary.",
    },
    {
      question: "Does employee PF reduce take-home salary?",
      answer:
        "Yes. Employee PF is deducted before salary reaches you, so take-home falls by that amount (before considering other deductions and tax). The employer share does not reduce your take-home.",
    },
    {
      question: "Does this calculator calculate EPF interest or pension?",
      answer:
        "No. It estimates monthly contributions only — no interest accumulation, maturity value, withdrawals, or EPS pension benefits.",
    },
  ],
  relatedToolSlugs: ["salary-calculator", "ctc-to-in-hand", "salary-hike-calculator", "gratuity-calculator", "hra-calculator"],
  exampleInput: {
    monthlyWage: 50000,
    employeeRatePct: 12,
    employerRatePct: 12,
    applyCeiling: true,
    ceilingMonthly: DEFAULT_CEILING_MONTHLY,
  },
};
