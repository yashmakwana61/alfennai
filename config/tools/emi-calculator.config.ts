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
  intro: [
    "An EMI (Equated Monthly Installment) is the fixed amount you pay your lender every month until the loan is fully repaid. Each installment covers that month's interest plus a slice of the principal.",
    "Enter the loan amount, the annual interest rate and the tenure in months to see your monthly EMI, the total interest you will pay, and the total repayment — whether it is a home loan, car loan or personal loan.",
  ],
  longDescription:
    "The EMI Calculator uses the standard reducing-balance formula to compute your Equated Monthly Installment for any loan amount, interest rate and tenure. Under reducing balance, each month's interest is charged only on the outstanding principal — so early installments are mostly interest while later ones mostly repay principal — yet the monthly EMI stays constant throughout. The calculator divides your annual rate by 12 to get the monthly rate, applies it over the tenure in months, and also shows the total interest paid across the whole loan and the total repayment (principal plus interest). A zero-interest loan is handled directly as principal divided by months.",
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
    { question: "What is EMI?", answer: "EMI stands for Equated Monthly Installment: a fixed monthly payment that covers both interest and principal repayment, so the loan is fully repaid by the end of the tenure." },
    { question: "How is EMI calculated?", answer: "With the reducing-balance formula EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the tenure in months. Interest each month is charged only on the outstanding balance." },
    { question: "Is this a reducing balance or flat rate EMI?", answer: "This uses the standard reducing balance method used by almost all banks and lenders." },
    { question: "Does a longer tenure reduce my EMI?", answer: "Yes, spreading the same loan over more months lowers each EMI — but you pay interest for longer, so the total interest and total repayment go up." },
    { question: "Does a lower interest rate reduce total interest?", answer: "Yes. Even a small rate difference compounds over the tenure: a lower rate cuts both the EMI and the total interest paid." },
    { question: "What is the difference between EMI, total interest and total repayment?", answer: "EMI is what you pay each month. Total interest is the sum of all interest across the tenure. Total repayment is principal plus total interest — the full amount the loan costs you." },
    { question: "Is this calculator an estimate?", answer: "Yes. It computes principal and interest exactly per the formula, but real loans add processing fees, penalties and lender-specific rounding, so confirm the sanction letter before borrowing. Fees are not included — add them separately to get your total loan cost." },
  ],
  relatedToolSlugs: ["loan-calculator", "percentage-calculator"],
  contentSections: [
    {
      heading: "Worked example",
      paragraphs: [
        "Loan of ₹5,00,000 at 9.5% annual interest over 60 months: the monthly EMI is about ₹10,501, the total interest is about ₹1,30,056, and the total repayment is about ₹6,30,056.",
        "With a 0% interest rate the math is trivial — ₹1,20,000 over 12 months is exactly ₹10,000 a month with zero total interest — and the calculator handles that case directly instead of dividing by zero.",
      ],
    },
    {
      heading: "How tenure, rate and principal move the numbers",
      paragraphs: [
        "Principal scales everything proportionally: double the loan amount at the same rate and tenure and the EMI doubles. Rate and tenure are non-linear — a longer tenure always lowers the EMI but raises total interest, while a higher rate raises both.",
        "To compare full loan offers including how lenders structure principal and charges, use the [loan calculator](/tools/finance/loan-calculator). To work out rate differences or down-payment percentages yourself, use the [percentage calculator](/tools/calculators/percentage-calculator).",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This is an estimate for principal plus interest only — not a loan approval, lender offer or financial advice.",
        "Processing fees, prepayment penalties, insurance and lender rounding are not included.",
        "No amortization (month-by-month) schedule is shown — only the EMI, total interest and total repayment.",
        "Floating-rate loans can change EMI or tenure mid-loan; this calculator assumes a fixed rate throughout.",
      ],
    },
  ],
  exampleInput: { principal: 500000, annualRate: 9.5, tenureMonths: 60 },
};
