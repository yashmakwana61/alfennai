import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { SalaryCalculator } from "@/components/tools/SalaryCalculator";
import {
  MAX_INPUT_AMOUNT,
  calculateSalary,
  formatINR,
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

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculateSalary({
  annualCtc: 1200000,
  components: {
    basicAnnual: 600000,
    hraAnnual: 300000,
    otherAllowancesAnnual: 240000,
    bonusAnnual: 60000,
  },
  deductions: { employeePfAnnual: 72000, professionalTaxAnnual: 2500, otherDeductionsAnnual: 0 },
  regime: "new",
  financialYear: "2026-27",
});

export const salaryCalculatorTool: ToolConfig<SalaryCalculatorInput, SalaryCalculatorOutput> = {
  id: "salary-calculator",
  slug: "salary-calculator",
  title: "Salary Calculator India",
  shortDescription: "Calculate your estimated monthly and annual take-home salary from CTC, salary breakup, employee deductions and tax regime.",
  intro: [
    "A ₹12,00,000 CTC rarely means ₹1,00,000 reaching your bank account every month. CTC includes employer-side costs such as employer PF contributions, gratuity and insurance — money your employer spends on you but never pays to you.",
    "This calculator converts CTC into an estimated monthly and annual take-home salary. Enter your CTC and, if you know it, your salary breakup; add employee deductions such as PF and professional tax; then pick a tax regime and financial year.",
    "The result is a simplified estimate covering FY 2024-25 through FY 2026-27. Actual salary structures and exemptions vary by employer, so your payslip may differ.",
  ],
  longDescription:
    "A salary calculator estimates your in-hand pay from your Cost to Company (CTC). CTC is everything your employer spends on you in a year — including employer-side costs such as employer PF contributions, gratuity and insurance — so it is never the same as the amount credited to your bank account.\n\nYour gross salary is the part of CTC actually paid to you (basic salary plus HRA, allowances and bonus). From that, employee-side deductions such as your own PF contribution, professional tax and any other deductions are subtracted, along with an estimated income tax based on the financial year and tax regime you select. What remains is your estimated take-home (net) salary.\n\nThis tool gives an estimate, not an official tax calculation. Actual payslips differ because salary structures, exemptions (such as HRA or 80C deductions) and employer policies vary. Tax is computed with a simplified model — standard deduction only, no surcharge — for an individual below 60 years of age.",
  category: "finance",
  icon: "Wallet",
  isNew: true,
  seo: {
    metaTitle: "Salary Calculator India - CTC to In-Hand Salary",
    metaDescription:
      "Free salary calculator for India. Convert CTC to estimated monthly in-hand salary for FY 2026-27 with salary breakup, PF, deductions and new or old tax regime.",
    keywords: [
      "salary calculator india",
      "in hand salary calculator",
      "take home salary calculator",
      "ctc to in hand salary",
      "ctc to monthly salary",
      "monthly salary calculator",
      "salary breakup calculator",
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
      question: "What is a salary calculator?",
      answer:
        "A salary calculator estimates your in-hand (take-home) pay from your CTC and salary breakup. It subtracts employee deductions and an estimated income tax from your gross salary to show what you may receive monthly and annually.",
    },
    {
      question: "How do I calculate in-hand salary from CTC?",
      answer:
        "Enter your annual CTC, add your salary breakup if you know it (basic, HRA, allowances, bonus), enter employee deductions such as PF and professional tax, then select a tax regime and financial year. The calculator shows your estimated monthly and annual take-home salary.",
    },
    {
      question: "Why is in-hand salary lower than CTC?",
      answer:
        "CTC bundles employer-side costs such as employer PF, gratuity and insurance that are never paid to you. Your own PF contribution, professional tax and income tax are then subtracted from your gross salary, leaving a smaller take-home amount.",
    },
    {
      question: "What is the difference between CTC and gross salary?",
      answer:
        "CTC is your employer's total annual cost for you. Gross salary is the part actually paid to you — basic plus HRA, allowances and bonus. If you skip the breakup, this calculator assumes gross salary equals your full CTC and labels that as an assumption.",
    },
    {
      question: "Which financial year should I select?",
      answer:
        "Select the financial year in which you earn the salary — for salary earned between April 2026 and March 2027, choose FY 2026-27. Tax slabs and rebate limits can change between years, so the estimate follows the rules of the year you pick.",
    },
    {
      question: "Does this calculator include PF?",
      answer:
        "It includes the employee PF amount you enter as a deduction from take-home pay. Employer PF contributions are not entered separately — they stay inside the CTC remainder and are never added to your take-home.",
    },
    {
      question: "Does this calculator include HRA exemption?",
      answer:
        "No. HRA you enter is treated as salary paid to you; the HRA tax exemption is not calculated. If you claim HRA exemption, your actual tax may be lower than this estimate, especially under the old regime.",
    },
    {
      question: "Does it support the new and old tax regimes?",
      answer:
        "Yes. You can compare the new regime (lower slab rates, higher rebate, almost no deductions) with the old regime (higher rates, but deductions like 80C and HRA exemption exist outside this calculator) across FY 2024-25, FY 2025-26 and FY 2026-27.",
    },
    {
      question: "Is this an official tax calculation?",
      answer:
        "No. This is a simplified estimate. Your actual payslip and tax liability depend on your salary structure, exemptions you claim (such as HRA or 80C deductions), and your employer's policies.",
    },
    {
      question: "Can I use this calculator for my payslip?",
      answer:
        "You can use it to sanity-check a salary offer or payslip, but expect differences: real payroll applies your exact salary structure, exemptions, TDS and employer-specific components that a simplified estimate cannot reproduce.",
    },
  ],
  relatedToolSlugs: ["ctc-to-in-hand", "pf-calculator", "salary-hike-calculator"],
  contentSections: [
    {
      heading: "How CTC is converted to in-hand salary",
      paragraphs: [
        "The conversion follows four steps: CTC becomes gross salary, employee deductions come off, estimated income tax comes off, and what remains is your take-home salary. The exact relationship depends on your salary structure, which is why two people with the same CTC can take home different amounts.",
        "Gross salary is Basic + HRA + other allowances + bonus. If you do not enter a breakup, this calculator assumes gross salary equals your full CTC and labels that clearly as an assumption.",
        "Take-home salary is gross salary minus employee deductions (your PF, professional tax and any other deductions) minus estimated income tax. FY 2026-27 covers salary earned from 1 April 2026 through 31 March 2027 (AY 2027-28).",
        "Income tax here uses the new or old regime slabs for the selected year with the standard deduction, Section 87A rebate where applicable, and 4% cess — a simplified model, not a full tax computation.",
      ],
    },
    {
      heading: "What is CTC in salary?",
      paragraphs: [
        "CTC stands for Cost to Company: the total annual cost your employer associates with employing you.",
        "It can include components that never reach you as monthly cash, such as employer PF contributions, gratuity and insurance. That is why CTC should not automatically be treated as your annual take-home salary.",
      ],
    },
    {
      heading: "CTC vs gross salary vs in-hand salary",
      table: {
        headers: ["Term", "Meaning"],
        rows: [
          ["CTC", "Your employer's total annual cost for you, including employer-side components."],
          ["Gross salary", "The part of CTC paid to you: basic + HRA + allowances + bonus (or your full CTC, if you skip the breakup)."],
          ["Deductions", "Employee PF, professional tax and other deductions you enter, plus estimated income tax."],
          ["In-hand / take-home salary", "What remains after deductions and estimated tax, shown monthly and annually."],
        ],
      },
    },
    {
      heading: "Salary calculator example",
      paragraphs: [
        "Illustrative example using this calculator's simplified assumptions: CTC ₹12,00,000 with basic ₹6,00,000, HRA ₹3,00,000, other allowances ₹2,40,000, bonus ₹60,000, employee PF ₹72,000, professional tax ₹2,500 and no other deductions, under the new regime for FY 2026-27.",
        `Gross annual salary ${formatINR(workedExample.grossAnnual)}. After the ${formatINR(workedExample.standardDeduction)} standard deduction, taxable income is ${formatINR(workedExample.taxableIncome)}, on which the estimated income tax is ${formatINR(workedExample.incomeTax)} after the Section 87A rebate. After ${formatINR(workedExample.employeePfAnnual)} employee PF and ${formatINR(workedExample.professionalTaxAnnual)} professional tax, the estimated annual take-home is ${formatINR(workedExample.takeHomeAnnual)} — about ${formatINR(workedExample.takeHomeMonthly)} a month.`,
      ],
    },
    {
      heading: "What this salary calculator includes",
      list: [
        "Annual CTC in INR",
        "Salary breakup: basic salary, HRA, other allowances and bonus / variable pay",
        "Employee PF, professional tax and other deductions",
        "New and old tax regimes",
        "FY 2024-25, FY 2025-26 and FY 2026-27, with the standard deduction for each regime",
        "Estimated income tax with Section 87A rebate and 4% cess",
        "Monthly and annual take-home salary with a full breakup",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This is a simplified estimate, not payroll or tax-filing software.",
        "It assumes a salaried resident individual below 60 years of age.",
        "HRA exemption is not calculated.",
        "80C, 80D and other detailed deductions are not modeled.",
        "Professional tax reduces take-home pay but not taxable income in this model.",
        "Surcharge on high incomes is not included.",
        "Actual employer salary structures vary, so payslips may differ.",
      ],
    },
  ],
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
