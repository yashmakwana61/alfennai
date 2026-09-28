import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { CtcToInHandCalculator } from "@/components/tools/CtcToInHandCalculator";
import {
  calculateCtcToInHand,
  estimatePfContribution,
  resolveCtcBridge,
} from "@/lib/finance/ctc-to-in-hand";
import {
  MAX_INPUT_AMOUNT,
  formatINR,
  type FinancialYear,
  type TaxRegime,
} from "@/lib/finance/salary-calculator";

const amountField = (label: string) =>
  z.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} cannot be negative`).max(
    MAX_INPUT_AMOUNT,
    `${label} looks too large — please check the value`
  );

const schema = z
  .object({
    annualCtc: z
      .number({ invalid_type_error: "Annual CTC must be a number" })
      .positive("Enter your annual CTC greater than 0")
      .max(MAX_INPUT_AMOUNT, "Annual CTC looks too large — please check the value"),
    basicPct: z
      .number({ invalid_type_error: "Basic percentage must be a number" })
      .min(0, "Basic percentage cannot be negative")
      .max(100, "Basic salary cannot be more than 100% of CTC"),
    bonusAnnual: amountField("Bonus / variable pay").optional().default(0),
    includeEmployerPf: z.boolean(),
    employerPfManualAnnual: amountField("Employer PF").optional().default(0),
    includeGratuity: z.boolean(),
    gratuityManualAnnual: amountField("Gratuity").optional().default(0),
    otherEmployerAnnual: amountField("Other employer CTC components").optional().default(0),
    usePfCeiling: z.boolean(),
    pfCeilingAnnual: amountField("PF wage ceiling").optional().default(300000),
    employeePfManualAnnual: amountField("Employee PF").optional().default(0),
    professionalTaxAnnual: amountField("Professional tax").optional().default(0),
    otherDeductionsAnnual: amountField("Other deductions").optional().default(0),
    regime: z.enum(["new", "old"]),
    financialYear: z.enum(["2024-25", "2025-26", "2026-27"]),
  })
  .superRefine((data, ctx) => {
    const bridge = resolveCtcBridge({
      annualCtc: data.annualCtc,
      basicPct: data.basicPct,
      bonusAnnual: data.bonusAnnual ?? 0,
      includeEmployerPf: data.includeEmployerPf,
      employerPfManualAnnual: data.employerPfManualAnnual ?? 0,
      includeGratuity: data.includeGratuity,
      gratuityManualAnnual: data.gratuityManualAnnual ?? 0,
      otherEmployerAnnual: data.otherEmployerAnnual ?? 0,
      usePfCeiling: data.usePfCeiling,
      pfCeilingAnnual: data.pfCeilingAnnual ?? 300000,
      employeePfManualAnnual: data.employeePfManualAnnual ?? 0,
      professionalTaxAnnual: data.professionalTaxAnnual ?? 0,
      otherDeductionsAnnual: data.otherDeductionsAnnual ?? 0,
      regime: data.regime,
      financialYear: data.financialYear,
    });
    if (bridge.totalEmployerComponents >= data.annualCtc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employer-side components use up the entire CTC — please check the values",
        path: ["otherEmployerAnnual"],
      });
    }
    if ((data.bonusAnnual ?? 0) > bridge.grossCashAnnual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bonus cannot be larger than the gross cash salary — please check the values",
        path: ["bonusAnnual"],
      });
    }
    const autoEmployeePf =
      (data.employeePfManualAnnual ?? 0) > 0
        ? 0
        : estimatePfContribution(
            bridge.basicAnnual,
            data.usePfCeiling,
            data.pfCeilingAnnual ?? 300000
          );
    const deductions =
      autoEmployeePf +
      (data.employeePfManualAnnual ?? 0) +
      (data.professionalTaxAnnual ?? 0) +
      (data.otherDeductionsAnnual ?? 0);
    if (deductions > bridge.grossCashAnnual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Deductions are more than the gross cash salary — please check the values",
        path: ["otherDeductionsAnnual"],
      });
    }
  });

export type CtcToInHandToolInput = z.infer<typeof schema>;
export type CtcToInHandToolOutput = ReturnType<typeof calculateCtcToInHand>;

function compute(input: CtcToInHandToolInput): CtcToInHandToolOutput {
  return calculateCtcToInHand({
    annualCtc: input.annualCtc,
    basicPct: input.basicPct,
    bonusAnnual: input.bonusAnnual ?? 0,
    includeEmployerPf: input.includeEmployerPf,
    employerPfManualAnnual: input.employerPfManualAnnual ?? 0,
    includeGratuity: input.includeGratuity,
    gratuityManualAnnual: input.gratuityManualAnnual ?? 0,
    otherEmployerAnnual: input.otherEmployerAnnual ?? 0,
    usePfCeiling: input.usePfCeiling,
    pfCeilingAnnual: input.pfCeilingAnnual ?? 300000,
    employeePfManualAnnual: input.employeePfManualAnnual ?? 0,
    professionalTaxAnnual: input.professionalTaxAnnual ?? 0,
    otherDeductionsAnnual: input.otherDeductionsAnnual ?? 0,
    regime: input.regime as TaxRegime,
    financialYear: input.financialYear as FinancialYear,
  });
}

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculateCtcToInHand({
  annualCtc: 1200000,
  basicPct: 50,
  bonusAnnual: 0,
  includeEmployerPf: true,
  employerPfManualAnnual: 0,
  includeGratuity: true,
  gratuityManualAnnual: 0,
  otherEmployerAnnual: 0,
  usePfCeiling: true,
  pfCeilingAnnual: 300000,
  employeePfManualAnnual: 0,
  professionalTaxAnnual: 2500,
  otherDeductionsAnnual: 0,
  regime: "new",
  financialYear: "2026-27",
});

export const ctcToInHandTool: ToolConfig<CtcToInHandToolInput, CtcToInHandToolOutput> = {
  id: "ctc-to-in-hand",
  slug: "ctc-to-in-hand",
  title: "CTC to In-Hand Salary Calculator India",
  shortDescription: "Convert your annual CTC into estimated monthly in-hand salary, with employer PF, gratuity, bonus and tax regime.",
  intro: [
    "Your CTC is almost never the amount that reaches your bank account. Employer-side components such as employer PF and gratuity are part of CTC but are never paid to you as monthly cash — and your own PF, professional tax and income tax come off what remains.",
    "Enter your annual CTC and a few assumptions about its structure, and this calculator walks down the full bridge: CTC to gross cash salary, then to estimated in-hand pay after employee deductions and income tax.",
  ],
  longDescription:
    "An offer letter states a CTC, but your bank account receives in-hand salary — and the two can differ substantially. This calculator bridges the gap step by step: it first removes employer-side CTC components (employer PF contribution, gratuity provision and any other employer-side items) to reach your gross cash salary, then subtracts employee-side deductions (your PF, professional tax and other deductions) and an estimated income tax.\n\nEvery structural assumption is configurable: basic salary as a percentage of CTC, PF estimation with an optional wage ceiling, gratuity provision with manual override, and other employer components. Nothing about your employer's structure is guessed silently — estimates are always labelled.\n\nAs with all calculators here, the result is a simplified estimate for a salaried resident individual below 60, using the standard deduction only, with no HRA/80C modelling and no surcharge.",
  category: "finance",
  icon: "Wallet",
  isNew: true,
  seo: {
    metaTitle: "CTC to In-Hand Salary Calculator India - FY 2026-27",
    metaDescription:
      "Calculate your estimated monthly in-hand salary from CTC in India. Account for employer PF, gratuity, bonus, employee deductions and income tax for FY 2026-27.",
    keywords: [
      "ctc to in hand salary calculator",
      "ctc to in hand salary india",
      "ctc to monthly salary",
      "ctc to take home salary",
      "ctc salary breakup calculator",
      "12 lpa in hand salary",
      "10 lpa in hand salary",
    ],
  },
  inputSchema: schema as unknown as z.ZodType<CtcToInHandToolInput>,
  compute,
  component: CtcToInHandCalculator,
  formulas: [
    {
      label: "Gross cash salary",
      expression: "Gross cash = CTC − Employer PF − Gratuity − Other employer components",
      explanation: "Employer-side items are part of CTC but never paid to you as cash.",
    },
    {
      label: "Take-home salary",
      expression: "Take-home = Gross cash − Employee PF − Professional tax − Other deductions − Income tax",
      explanation: "Income tax uses the same simplified regime/FY engine as the Salary Calculator.",
    },
    {
      label: "Monthly figures",
      expression: "Average monthly = Take-home ÷ 12; Regular monthly = (Take-home − Bonus) ÷ 12",
      explanation: "Annual bonus is paid separately, so the regular month excludes it.",
    },
  ],
  contentSections: [
    {
      heading: "How CTC is converted to in-hand salary",
      paragraphs: [
        "The conversion has two stages. First, employer-side CTC components — employer PF, gratuity provision and other employer items — are subtracted from CTC to reach your gross cash salary, the envelope your monthly pay actually comes from.",
        "Second, employee-side deductions (your PF contribution, professional tax and any other deductions) and an estimated income tax are subtracted from gross cash salary. What remains is your estimated in-hand (take-home) salary. For a broader take-home estimate built around salary breakup and both tax regimes, use the [salary calculator](/tools/finance/salary-calculator).",
      ],
    },
    {
      heading: "What is included in CTC?",
      paragraphs: [
        "CTC (Cost to Company) is everything your employer spends on you in a year. Besides the cash salary paid to you, it can include the employer's PF contribution, a gratuity provision, insurance premiums, employer NPS contributions, and annual variable pay or bonus.",
        "Because these components vary widely between employers, this calculator asks you to confirm or adjust each one rather than assuming a universal salary structure.",
      ],
    },
    {
      heading: "CTC vs gross salary vs in-hand salary",
      table: {
        headers: ["Term", "Meaning"],
        rows: [
          ["CTC", "Your employer's total annual cost: cash salary plus employer-side components."],
          ["Gross cash salary", "CTC minus employer PF, gratuity and other employer components — your actual pay envelope."],
          ["Employee deductions", "Your PF, professional tax and other deductions, plus estimated income tax."],
          ["In-hand salary", "Gross cash minus deductions and tax, shown as annual take-home and average monthly."],
        ],
      },
    },
    {
      heading: "How employer PF and gratuity affect in-hand salary",
      paragraphs: [
        "Employer PF (12% of basic up to the applicable wage ceiling) and the gratuity provision (basic × 15/26) sit inside CTC but are never paid to you as monthly cash, so both directly reduce the gross cash salary derived from a given CTC. A CTC gratuity provision is not the same as the statutory payout — see the [gratuity calculator](/tools/finance/gratuity-calculator).",
        "Your own PF contribution works the other way: it comes out of gross cash salary and further reduces take-home. The calculator keeps the two strictly separate and lets you override either amount. Estimate both sides with the [PF calculator](/tools/finance/pf-calculator).",
      ],
    },
    {
      heading: "How bonus and variable pay affect monthly salary",
      paragraphs: [
        "Annual bonus is part of CTC but is typically paid once or twice a year, not every month. Dividing it by 12 would overstate your regular monthly payslip.",
        "This calculator therefore shows an average monthly take-home (annual ÷ 12) alongside a regular monthly figure that excludes the bonus, with the bonus kept visible as its own annual line. Monthly cash flow depends on when your employer actually pays variable compensation. If your package changed through an increment, the [salary hike calculator](/tools/finance/salary-hike-calculator) shows how the revised salary was derived.",
      ],
    },
    {
      heading: "Example: ₹12 LPA CTC to in-hand salary",
      paragraphs: [
        "Illustrative example using this calculator's default assumptions: CTC ₹12,00,000 with basic at 50% of CTC, employer PF and gratuity included as estimated, no bonus and no other employer components, professional tax ₹2,500, new regime, FY 2026-27.",
        `Employer PF ${formatINR(workedExample.employerPfAnnual)} and gratuity provision ${formatINR(workedExample.gratuityAnnual)} leave a gross cash salary of ${formatINR(workedExample.grossCashAnnual)}. After employee PF ${formatINR(workedExample.employeePfAnnual)}, professional tax ${formatINR(workedExample.professionalTaxAnnual)} and estimated income tax ${formatINR(workedExample.incomeTax)}, the estimated annual in-hand salary is ${formatINR(workedExample.takeHomeAnnual)} — an average of ${formatINR(workedExample.averageMonthlyInHand)} a month.`,
      ],
    },
    {
      heading: "What this calculator includes",
      list: [
        "Annual CTC with configurable basic-salary percentage",
        "Employer PF estimate (12% of basic, optional wage ceiling, manual override)",
        "Gratuity provision estimate (basic × 15/26, can be switched off or overridden)",
        "Other employer-side CTC components and annual bonus / variable pay",
        "Employee PF, professional tax and other deductions",
        "New and old tax regimes across FY 2024-25, FY 2025-26 and FY 2026-27",
        "Estimated income tax with standard deduction, rebate and cess",
        "Average and regular monthly in-hand figures with a full CTC bridge",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This is a simplified estimate, not payroll or tax-filing software.",
        "It assumes a salaried resident individual below 60 years of age.",
        "Basic percentage, PF, gratuity and other components are assumptions — confirm them against your offer letter.",
        "HRA exemption and 80C/80D deductions are not modeled.",
        "Surcharge on high incomes is not included.",
        "Bonus timing varies by employer; the regular monthly figure is indicative.",
      ],
    },
  ],
  faq: [
    {
      question: "What is CTC?",
      answer:
        "CTC (Cost to Company) is your employer's total annual cost for you: cash salary plus employer-side items such as employer PF, gratuity provision, insurance and bonus. It is not the amount credited to your bank account.",
    },
    {
      question: "How do I calculate in-hand salary from CTC?",
      answer:
        "Subtract employer-side components (employer PF, gratuity, other employer items) from CTC to get gross cash salary, then subtract employee deductions (your PF, professional tax, other deductions) and estimated income tax. This calculator performs that full bridge for you.",
    },
    {
      question: "Why is in-hand salary lower than CTC?",
      answer:
        "Two layers reduce it: employer-side CTC components that are never paid as cash, and employee deductions plus income tax taken from the remaining gross cash salary.",
    },
    {
      question: "What is the difference between CTC and gross salary?",
      answer:
        "CTC includes employer-side costs; gross (cash) salary is CTC minus employer PF, gratuity and other employer components — the envelope your monthly pay comes from.",
    },
    {
      question: "Is employer PF included in CTC?",
      answer:
        "Usually yes — most Indian offer letters include the employer's 12% PF contribution in CTC. This calculator includes it by default (12% of basic up to a configurable wage ceiling) but lets you switch it off or enter the exact amount.",
    },
    {
      question: "Is gratuity included in CTC?",
      answer:
        "Often yes — many employers show an annual gratuity provision (around basic × 15/26) inside CTC. It is a provision, not monthly cash you receive. This calculator includes it by default but lets you switch it off or override it.",
    },
    {
      question: "Does bonus reduce monthly in-hand salary?",
      answer:
        "Bonus included in CTC raises your annual take-home but typically arrives as a lump sum, not in every month's pay. The calculator shows an average monthly figure plus a regular monthly figure excluding bonus.",
    },
    {
      question: "Which financial year should I select?",
      answer:
        "Select the year you earn the salary — for salary earned between April 2026 and March 2027, choose FY 2026-27. The estimate follows that year's slabs, rebate and standard deduction.",
    },
    {
      question: "Is this an official tax calculation?",
      answer:
        "No. This is a simplified estimate using standard deduction only, with no HRA/80C modelling and no surcharge. Actual payroll and tax liability depend on your salary structure and exemptions.",
    },
    {
      question: "Why does my payslip differ from this calculator?",
      answer:
        "Real payslips reflect your employer's exact structure, exemption claims, TDS timing and bonus payout schedule. If a line differs, check the corresponding assumption — especially basic percentage, PF, gratuity and bonus.",
    },
  ],
  relatedToolSlugs: ["salary-calculator", "pf-calculator", "gratuity-calculator", "salary-hike-calculator", "hra-calculator"],
  exampleInput: {
    annualCtc: 1200000,
    basicPct: 50,
    bonusAnnual: 0,
    includeEmployerPf: true,
    employerPfManualAnnual: 0,
    includeGratuity: true,
    gratuityManualAnnual: 0,
    otherEmployerAnnual: 0,
    usePfCeiling: true,
    pfCeilingAnnual: 300000,
    employeePfManualAnnual: 0,
    professionalTaxAnnual: 2500,
    otherDeductionsAnnual: 0,
    regime: "new",
    financialYear: "2026-27",
  },
};
