import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { EmiCalculator } from "@/components/tools/EmiCalculator";

const schema = z.object({
  principal: z.number().positive("Enter a loan amount greater than 0"),
  annualRate: z.number().min(0).max(50),
  tenureMonths: z.number().int().positive().max(600),
});

export type EmiInput = z.infer<typeof schema>;
export interface EmiOutput {
  emi: number;
  totalPayment: number;
  totalInterest: number;
}

function compute(input: EmiInput): EmiOutput {
  const r = input.annualRate / 12 / 100;
  const n = input.tenureMonths;
  const emi =
    r === 0
      ? input.principal / n
      : (input.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - input.principal;
  return { emi, totalPayment, totalInterest };
}

export const emiCalculatorTool: ToolConfig<EmiInput, EmiOutput> = {
  id: "emi-calculator",
  slug: "emi-calculator",
  title: "EMI Calculator",
  shortDescription: "Calculate your monthly loan EMI, total interest and total repayment.",
  longDescription:
    "The EMI Calculator uses the standard reducing-balance formula to compute your Equated Monthly Installment for any loan amount, interest rate and tenure. It also shows total interest paid over the loan and the total amount repaid.",
  category: "finance",
  icon: "Landmark",
  isFeatured: true,
  seo: {
    metaTitle: "EMI Calculator - Loan EMI, Interest & Total Payment",
    metaDescription: "Free EMI calculator. Calculate monthly loan installment, total interest and total repayment instantly.",
    keywords: ["emi calculator", "loan emi", "monthly installment calculator"],
  },
  inputSchema: schema,
  compute,
  component: EmiCalculator,
  formulas: [
    {
      label: "EMI formula",
      expression: "EMI = P × r × (1+r)^n / ((1+r)^n − 1)",
      explanation: "P = principal, r = monthly interest rate (annual rate ÷ 12 ÷ 100), n = tenure in months.",
    },
  ],
  faq: [
    { question: "Is this a reducing balance or flat rate EMI?", answer: "This uses the standard reducing balance method used by almost all banks and lenders." },
    { question: "Does it include processing fees?", answer: "No, this calculates principal and interest only. Add any fees separately to get your total cost of the loan." },
  ],
  relatedToolSlugs: ["loan-calculator", "gst-calculator"],
  exampleInput: { principal: 500000, annualRate: 9.5, tenureMonths: 60 },
};
