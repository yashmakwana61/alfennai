import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { LoanCalculator } from "@/components/tools/LoanCalculator";

const schema = z.object({
  loanAmount: z.number().positive("Enter a loan amount greater than 0"),
  downPayment: z.number().min(0),
  annualRate: z.number().min(0).max(50),
  tenureYears: z.number().positive().max(50),
});

export type LoanInput = z.infer<typeof schema>;
export interface LoanOutput {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  principalFinanced: number;
}

function compute(input: LoanInput): LoanOutput {
  const principalFinanced = Math.max(input.loanAmount - input.downPayment, 0);
  const r = input.annualRate / 12 / 100;
  const n = input.tenureYears * 12;
  const monthlyPayment =
    r === 0 ? principalFinanced / n : (principalFinanced * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalCost = monthlyPayment * n + input.downPayment;
  const totalInterest = totalCost - input.loanAmount;
  return { monthlyPayment, totalInterest, totalCost, principalFinanced };
}

export const loanCalculatorTool: ToolConfig<LoanInput, LoanOutput> = {
  id: "loan-calculator",
  slug: "loan-calculator",
  title: "Loan Calculator",
  shortDescription: "Calculate monthly payment, total interest and total cost for any loan.",
  longDescription:
    "The Loan Calculator factors in a down payment alongside loan amount, interest rate and tenure to give you the true monthly payment and total cost of borrowing — useful for auto loans, personal loans and mortgages alike.",
  category: "finance",
  icon: "Wallet",
  seo: {
    metaTitle: "Loan Calculator - Monthly Payment & Total Cost Free",
    metaDescription: "Free loan calculator with down payment support. Calculate monthly payment, total interest and total cost.",
    keywords: ["loan calculator", "monthly payment calculator", "loan interest calculator"],
  },
  inputSchema: schema,
  compute,
  component: LoanCalculator,
  faq: [{ question: "How is this different from the EMI Calculator?", answer: "This calculator additionally accounts for a down payment reducing the financed principal, useful for auto and home loans." }],
  relatedToolSlugs: ["emi-calculator", "gst-calculator"],
  exampleInput: { loanAmount: 1500000, downPayment: 300000, annualRate: 8.5, tenureYears: 15 },
};
