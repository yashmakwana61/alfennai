import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { ProfessionalTaxCalculator } from "@/components/tools/ProfessionalTaxCalculator";
import {
  MAX_MONTHLY_SALARY,
  PT_RULES,
  calculateProfessionalTax,
} from "@/lib/finance/professional-tax-calculator";
import { formatINR } from "@/lib/finance/salary-calculator";

// Derived from the verified rule data so the selector can never drift from the engine.
const STATE_CODES = [...PT_RULES.map((r) => r.stateCode), "OTHER"] as unknown as [string, ...string[]];

const schema = z.object({
  stateCode: z.enum(STATE_CODES),
  monthlySalary: z
    .number({ invalid_type_error: "Monthly salary must be a number" })
    .positive("Enter your monthly salary greater than 0")
    .max(MAX_MONTHLY_SALARY, "Salary looks too large — please check the value"),
  gender: z.enum(["male", "female"]),
});

export type ProfessionalTaxToolInput = z.infer<typeof schema>;
export type ProfessionalTaxToolOutput = ReturnType<typeof calculateProfessionalTax>;

function compute(input: ProfessionalTaxToolInput): ProfessionalTaxToolOutput {
  return calculateProfessionalTax({
    stateCode: input.stateCode,
    monthlySalary: input.monthlySalary,
    gender: input.gender,
  });
}

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculateProfessionalTax({
  stateCode: "MH",
  monthlySalary: 30000,
  gender: "male",
});

export const professionalTaxCalculatorTool: ToolConfig<ProfessionalTaxToolInput, ProfessionalTaxToolOutput> = {
  id: "professional-tax-calculator",
  slug: "professional-tax-calculator",
  title: "Professional Tax Calculator India",
  shortDescription: "Estimate monthly and annual professional tax for salaried employees using verified state-specific rules.",
  intro: [
    "Professional tax is a state-level tax deducted from the salary of employed individuals. There is no single nationwide formula — every state sets its own slabs, and some states do not levy it at all.",
    "Select your state of employment and enter your monthly salary to see the applicable slab, monthly deduction and annual total wherever the rule has been verified against official sources.",
    "Only states with currently verified rules are calculated. Anything else is reported as not covered rather than approximated.",
  ],
  longDescription:
    "Professional tax differs by state in three ways: the salary slabs, the monthly amounts, and even the deduction rhythm — Maharashtra and Karnataka deduct a higher amount in February, while most other verified states deduct a uniform amount every month.\n\nThis calculator encodes each supported state as data (slabs, schedule and conditions) evaluated by one generic engine, and builds the annual total from an explicit 12-month schedule rather than assuming monthly × 12. States without a verified official rule resolve to a clear not-covered message with no fabricated amount.\n\nThe scope is salaried employment only: self-employed professional tax, employer registration and return filing are separate matters with their own rules.",
  category: "finance",
  icon: "Receipt",
  isNew: true,
  seo: {
    metaTitle: "Professional Tax Calculator India - State-Wise Salary Tax",
    metaDescription:
      "Calculate professional tax for salaried employees using state-specific salary slabs and deduction rules. See monthly and annual professional tax where verified.",
    keywords: [
      "professional tax calculator",
      "professional tax calculator india",
      "professional tax slab",
      "professional tax by state",
      "salary professional tax",
      "professional tax deduction",
      "professional tax maharashtra",
      "professional tax karnataka",
    ],
  },
  inputSchema: schema,
  compute,
  component: ProfessionalTaxCalculator,
  formulas: [
    {
      label: "Monthly professional tax",
      expression: "Monthly PT = slab amount for the salary band (February amount where the rule specifies one)",
      explanation: "Each state's slab table maps monthly salary to a fixed monthly deduction.",
    },
    {
      label: "Annual professional tax",
      expression: "Annual PT = sum of the 12 monthly schedule amounts",
      explanation: "The annual total follows the state's actual schedule — never a blind monthly × 12.",
    },
  ],
  contentSections: [
    {
      heading: "What is professional tax?",
      paragraphs: [
        "Professional tax is a tax levied by state governments on professions, trades, callings and employment. For salaried employees it is deducted from monthly salary by the employer and deposited with the state.",
        "It is separate from income tax: professional tax goes to the state exchequer under state law, within the constitutional ceiling that caps it per individual per year.",
      ],
    },
    {
      heading: "How professional tax is calculated",
      paragraphs: [
        "Find the salary band your monthly salary falls in, read off the fixed monthly deduction, and follow the state's monthly schedule across the year. Some states deduct the same amount every month; Maharashtra and Karnataka deduct a higher amount in February.",
        `For example, a male employee earning ${formatINR(workedExample.monthlySalary)} a month in Maharashtra falls in the top band: ${formatINR(workedExample.monthlyProfessionalTax)} in most months and ${formatINR(workedExample.februaryProfessionalTax)} in February, giving ${formatINR(workedExample.annualProfessionalTax)} for the year.`,
      ],
    },
    {
      heading: "Why professional tax differs by state",
      paragraphs: [
        "Each state writes its own law: exemption thresholds range from a few thousand rupees to ₹25,000 a month, monthly amounts range from around ₹100 to ₹300, and deduction rhythms differ.",
        "That is why the same salary can mean ₹2,500 a year in one state and nothing in another — and why this calculator refuses to guess for states it has not verified.",
      ],
    },
    {
      heading: "Monthly vs annual deduction",
      paragraphs: [
        "Most verified states deduct a uniform amount each month, so the annual total happens to equal twelve months. Maharashtra and Karnataka instead specify a higher February deduction within the same annual cap.",
        "The calculator builds every annual total from an explicit month-by-month schedule, so special months are handled exactly as the rule states.",
      ],
    },
    {
      heading: "Salary slab boundaries",
      paragraphs: [
        "Slab boundaries are exact: earning one rupee above a threshold moves you into the next band. For instance, ₹10,000 a month in West Bengal means no tax, while ₹10,001 means ₹110 a month; ₹25,000 in Karnataka means no tax, while higher salaries enter the top band.",
        "Enter your precise monthly salary — rounding it before calculating can land you in the wrong band.",
      ],
    },
    {
      heading: "State-specific rules",
      paragraphs: [
        "Maharashtra applies different exemption limits for men (₹7,500) and women (₹25,000), with the top band at ₹2,500 a year including a higher February deduction. Karnataka exempts salaries below ₹25,000 and applies ₹200 a month with ₹300 in February above it.",
        "West Bengal uses five graded bands from ₹110 to ₹200 a month; Gujarat, Andhra Pradesh and Telangana use simpler two- or three-band structures. Each rule's official source and effective date are recorded with the calculation data.",
      ],
    },
    {
      heading: "Who this calculator covers",
      paragraphs: [
        "This calculator estimates professional tax for salaried employment. Professional tax rules for self-employed persons, businesses and employer registration can differ.",
        "States currently covered: Maharashtra, Karnataka, West Bengal, Gujarat, Andhra Pradesh and Telangana. Tamil Nadu, Kerala and Madhya Pradesh use local-body-dependent or unverified scales and are marked as not covered rather than approximated.",
      ],
    },
    {
      heading: "Limitations and verification",
      list: [
        "This is an estimate, not an official assessment or compliance filing.",
        "Only the six verified states are calculated; everything else is reported as not covered.",
        "Rates follow the official sources recorded with each rule — re-verify against the state portal before payroll use, as rules can change.",
        "No filing deadlines, exemptions beyond the encoded slabs, or employer compliance workflows are modelled.",
        "Self-employed, business and registration-related professional tax is out of scope.",
      ],
    },
    {
      heading: "Sources & verification",
      paragraphs: [
        "Each supported state's slabs and deduction schedule follow that state's official profession-tax source, recorded with the rule and shown in the result (for example, the Maharashtra GST Department rate schedule, the Karnataka Commercial Taxes portal, and the West Bengal, Gujarat, Andhra Pradesh and Telangana commercial-tax schedules), verified on 2026-09-28.",
        "States without a verified official rule are reported as not covered rather than approximated. This calculator is an independent estimate and is not affiliated with any state government — re-verify against the state portal before payroll use.",
      ],
    },
  ],
  faq: [
    {
      question: "What is professional tax in India?",
      answer:
        "A state-level tax on professions, trades, callings and employment. For salaried employees it is deducted monthly from salary by the employer and paid to the state government.",
    },
    {
      question: "Is professional tax the same in every state?",
      answer:
        "No. Each state sets its own slabs, exemption limits and deduction rhythm — the same salary can mean different amounts, or nothing, in different states.",
    },
    {
      question: "Who pays professional tax?",
      answer:
        "Salaried employees pay it through employer deduction; the employer deposits it with the state. Self-employed persons and businesses follow separate enrolment rules not covered here.",
    },
    {
      question: "How is professional tax calculated?",
      answer:
        "Match your monthly salary to the state's slab band to get the monthly deduction, then follow the state's monthly schedule across the year. This calculator does that from verified state rules.",
    },
    {
      question: "Is professional tax deducted every month?",
      answer:
        "Generally yes for salaried employees, though the amount can vary by month: Maharashtra and Karnataka specify a higher deduction in February within the same annual total.",
    },
    {
      question: "Why can one month have a different deduction?",
      answer:
        "Because the state's rate schedule says so — Maharashtra and Karnataka set ₹300 for February and ₹200 for other months in the top band, reaching the annual figure exactly.",
    },
    {
      question: "Does every Indian state charge professional tax?",
      answer:
        "No. Several states and union territories do not levy it, and this calculator only computes amounts for states with verified rules — anything else is reported as not covered, never guessed.",
    },
    {
      question: "Is professional tax based on CTC or salary?",
      answer:
        "On monthly salary or wages as each state's rule defines it — not on CTC. Enter the salary figure your employer's payroll uses for the calculation.",
    },
    {
      question: "Does professional tax affect income tax?",
      answer:
        "Professional tax paid is generally deductible from salary income under income tax rules, but this calculator does not compute income tax — use the Salary Calculator for take-home estimation.",
    },
    {
      question: "Are these professional-tax calculations exact for every employee?",
      answer:
        "They follow the verified slab rules, but exemptions, payroll timing and employer-specific treatment can differ — confirm against the state portal and your payslip before relying on them.",
    },
  ],
  relatedToolSlugs: ["salary-calculator", "ctc-to-in-hand", "pf-calculator", "hra-calculator", "gratuity-calculator", "salary-hike-calculator"],
  exampleInput: { stateCode: "MH", monthlySalary: 30000, gender: "male" },
};
