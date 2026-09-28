import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { SalaryCalculator } from "@/components/tools/SalaryCalculator";
import {
  MAX_INPUT_AMOUNT,
  calculateSalary,
  type FinancialYear,
  type SalaryTaxResult,
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
    basicAnnual: amountField("Basic salary").optional().default(0),
    hraAnnual: amountField("HRA").optional().default(0),
    otherAllowancesAnnual: amountField("Other allowances").optional().default(0),
    bonusAnnual: amountField("Bonus / variable pay").optional().default(0),
    employeePfAnnual: amountField("Employee PF").optional().default(0),
    professionalTaxAnnual: amountField("Professional tax").optional().default(0),
    otherDeductionsAnnual: amountField("Other deductions").optional().default(0),
    regime: z.enum(["new", "old"]),
    financialYear: z.enum(["2024-25", "2025-26", "2026-27"]),
  })
  .superRefine((data, ctx) => {
    const components =
      (data.basicAnnual ?? 0) + (data.hraAnnual ?? 0) + (data.otherAllowancesAnnual ?? 0) + (data.bonusAnnual ?? 0);
    if (components > data.annualCtc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Salary components add up to more than the CTC — please check the values",
        path: ["basicAnnual"],
      });
    }
    const deductions =
      (data.employeePfAnnual ?? 0) + (data.professionalTaxAnnual ?? 0) + (data.otherDeductionsAnnual ?? 0);
    const gross = components > 0 ? Math.min(components, data.annualCtc) : data.annualCtc;
    if (deductions > gross) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Deductions are more than the gross salary — please check the values",
        path: ["otherDeductionsAnnual"],
      });
    }
  });

export type SalaryCalculatorInput = z.infer<typeof schema>;
export type SalaryCalculatorOutput = SalaryTaxResult;

function compute(input: SalaryCalculatorInput): SalaryCalculatorOutput {
  return calculateSalary({
    annualCtc: input.annualCtc,
    components: {
      basicAnnual: input.basicAnnual ?? 0,
      hraAnnual: input.hraAnnual ?? 0,
      otherAllowancesAnnual: input.otherAllowancesAnnual ?? 0,
      bonusAnnual: input.bonusAnnual ?? 0,
    },
    deductions: {
      employeePfAnnual: input.employeePfAnnual ?? 0,
      professionalTaxAnnual: input.professionalTaxAnnual ?? 0,
      otherDeductionsAnnual: input.otherDeductionsAnnual ?? 0,
    },
    regime: input.regime as TaxRegime,
    financialYear: input.financialYear as FinancialYear,
  });
}

export const salaryCalculatorTool: ToolConfig<SalaryCalculatorInput, SalaryCalculatorOutput> = {
  id: "salary-calculator",
  slug: "salary-calculator",
  title: "Salary Calculator India",
  shortDescription: "Estimate your monthly and annual take-home salary from CTC, deductions and tax regime.",
  longDescription:
    "A salary calculator estimates your in-hand pay from your Cost to Company (CTC). CTC is everything your employer spends on you in a year — including employer-side costs such as employer PF contributions, gratuity and insurance — so it is never the same as the amount credited to your bank account.\n\nYour gross salary is the part of CTC actually paid to you (basic salary plus HRA, allowances and bonus). From that, employee-side deductions such as your own PF contribution, professional tax and any other deductions are subtracted, along with an estimated income tax based on the financial year and tax regime you select. What remains is your estimated take-home (net) salary.\n\nThis tool gives an estimate, not an official tax calculation. Actual payslips differ because salary structures, exemptions (such as HRA or 80C deductions) and employer policies vary. Tax is computed with a simplified model — standard deduction only, no surcharge — for an individual below 60 years of age.",
  category: "finance",
  icon: "Wallet",
  isNew: true,
  seo: {
    metaTitle: "Salary Calculator India - Monthly & Annual Take-Home Estimate",
    metaDescription:
      "Free salary calculator for India. Estimate monthly and annual take-home pay from CTC, salary breakup, PF, deductions and tax regime.",
    keywords: [
      "salary calculator india",
      "take home salary calculator",
      "ctc to in hand salary",
      "monthly salary calculator",
      "in hand salary calculator india",
    ],
  },
  inputSchema: schema as unknown as z.ZodType<SalaryCalculatorInput>,
  compute,
  component: SalaryCalculator,
  formulas: [
    {
      label: "Gross salary",
      expression: "Gross = Basic + HRA + Allowances + Bonus (or CTC, if no breakup given)",
      explanation:
        "When you enter salary components they are summed; otherwise gross is assumed equal to CTC and shown as an assumption.",
    },
    {
      label: "Taxable income",
      expression: "Taxable income = Gross − Standard deduction",
      explanation:
        "Standard deduction is Rs 75,000 (new regime) or Rs 50,000 (old regime). No other exemptions are modelled.",
    },
    {
      label: "Take-home salary",
      expression: "Take-home = Gross − Employee deductions − Income tax",
      explanation:
        "Employee deductions are PF, professional tax and other deductions; income tax is slab tax minus 87A rebate (with marginal relief where applicable) plus 4% cess, divided by 12 for monthly figures.",
    },
  ],
  faq: [
    {
      question: "Is this an official tax calculation?",
      answer:
        "No. This is an estimate. Your actual payslip and tax liability depend on your salary structure, exemptions you claim (such as HRA or 80C deductions), and your employer's policies.",
    },
    {
      question: "Why is my take-home salary less than my CTC?",
      answer:
        "CTC includes employer-side costs such as employer PF, gratuity and insurance that are never paid to you, plus employee deductions (your PF, professional tax) and income tax are subtracted from your gross salary.",
    },
    {
      question: "Should I choose the new or old tax regime?",
      answer:
        "The new regime has lower slab rates and a higher rebate but almost no deductions; the old regime has higher rates but lets you claim deductions like 80C and HRA exemption. This calculator models standard deduction only, so compare both options here and verify with a tax advisor before opting.",
    },
    {
      question: "What happens if I leave basic salary and other components blank?",
      answer:
        "Gross salary is then assumed equal to your full CTC, and the result clearly labels this as an assumption. For a more accurate estimate, enter at least your basic salary breakup.",
    },
    {
      question: "Which financial year should I select?",
      answer:
        "Select the financial year in which you earn the salary — for salary earned between April 2026 and March 2027, choose FY 2026-27. Tax slabs and rebate limits can change between years, so the estimate follows the rules of the year you pick.",
    },
    {
      question: "Does this include professional tax and PF correctly?",
      answer:
        "Employee PF and professional tax you enter are subtracted as employee deductions. The calculator keeps them separate from employer contributions, which stay inside the CTC remainder and are never added to your take-home.",
    },
  ],
  relatedToolSlugs: ["percentage-calculator", "emi-calculator", "gst-calculator"],
  exampleInput: {
    annualCtc: 1200000,
    basicAnnual: 600000,
    hraAnnual: 300000,
    otherAllowancesAnnual: 240000,
    bonusAnnual: 60000,
    employeePfAnnual: 72000,
    professionalTaxAnnual: 2500,
    otherDeductionsAnnual: 0,
    regime: "new",
    financialYear: "2026-27",
  },
};
