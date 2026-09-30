import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { HraCalculator } from "@/components/tools/HraCalculator";
import {
  MAX_HRA_ANNUAL,
  calculateHra,
} from "@/lib/finance/hra-calculator";
import { formatINR } from "@/lib/finance/salary-calculator";

const amountField = (label: string) =>
  z.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} cannot be negative`).max(
    MAX_HRA_ANNUAL,
    `${label} looks too large — please check the value`
  );

const schema = z.object({
  basicAnnual: z
    .number({ invalid_type_error: "Basic salary must be a number" })
    .positive("Enter your annual basic salary greater than 0")
    .max(MAX_HRA_ANNUAL, "Basic salary looks too large — please check the value"),
  daEligibleAnnual: amountField("DA forming part of retirement benefits").optional().default(0),
  hraReceivedAnnual: amountField("HRA received").optional().default(0),
  rentPaidAnnual: amountField("Rent paid").optional().default(0),
  cityType: z.enum(["metro", "non-metro"]),
  taxRegime: z.enum(["old", "new"]),
  period: z.enum(["annual", "monthly"]),
});

export type HraToolInput = z.infer<typeof schema>;
export type HraToolOutput = ReturnType<typeof calculateHra> & { period: "annual" | "monthly" };

function compute(input: HraToolInput): HraToolOutput {
  const result = calculateHra({
    basicAnnual: input.basicAnnual,
    daEligibleAnnual: input.daEligibleAnnual ?? 0,
    hraReceivedAnnual: input.hraReceivedAnnual ?? 0,
    rentPaidAnnual: input.rentPaidAnnual ?? 0,
    cityType: input.cityType,
    taxRegime: input.taxRegime,
  });
  return { ...result, period: input.period };
}

/**
 * Worked example, computed with the same function as the calculator so the
 * numbers can never drift from the implementation.
 */
const workedExample = calculateHra({
  basicAnnual: 600000,
  daEligibleAnnual: 0,
  hraReceivedAnnual: 300000,
  rentPaidAnnual: 360000,
  cityType: "metro",
  taxRegime: "old",
});

export const hraCalculatorTool: ToolConfig<HraToolInput, HraToolOutput> = {
  id: "hra-calculator",
  slug: "hra-calculator",
  title: "HRA Calculator India",
  shortDescription: "Calculate HRA exemption and taxable HRA under the old tax regime from salary, rent and city type.",
  intro: [
    "House Rent Allowance (HRA) is the part of salary paid to employees living in rented accommodation. Under the old tax regime, a portion of it can be exempt from income tax under Section 10(13A).",
    "This calculator applies the official least-of-three rule to your basic salary, eligible DA, HRA received, rent paid and city type, showing the exempt amount and the taxable remainder.",
    "Under the new tax regime there is no Section 10(13A) exemption, so the calculator reports the full HRA as taxable. Results are estimates, not tax or legal advice.",
  ],
  longDescription:
    "HRA exemption is one of the most misunderstood salary-tax topics: it is not simply your full HRA, nor is it available in every tax regime. The old-regime rule takes the least of three amounts — actual HRA received, rent paid minus 10% of salary, and a location-based percentage of salary — and exempts only that least figure.\n\nThis calculator implements exactly that rule on the salary basis of Basic plus DA forming part of retirement benefits. It handles metro (50%) and non-metro (40%) locations, floors the rent-minus-10% component at zero, and reports which of the three limits was binding.\n\nSelect the new regime and the calculator correctly reports zero exemption instead of running the old-regime formula. Nothing here computes final income tax or take-home pay — those belong to the Salary Calculator.",
  category: "finance",
  icon: "House",
  isNew: true,
  seo: {
    metaTitle: "HRA Calculator India - Calculate HRA Exemption",
    metaDescription:
      "Calculate HRA exemption in India using HRA, rent, Basic Salary, DA and metro/non-metro status. See exempt and taxable HRA under the old tax regime.",
    keywords: [
      "hra calculator",
      "hra calculator india",
      "hra exemption calculator",
      "house rent allowance calculator",
      "hra tax exemption",
      "hra taxable amount",
    ],
  },
  inputSchema: schema as unknown as z.ZodType<HraToolInput>,
  compute,
  component: HraCalculator,
  formulas: [
    {
      label: "Salary basis",
      expression: "Salary for HRA = Basic salary + DA forming part of retirement benefits",
      explanation: "Only these two components count — never gross salary, CTC, bonus or other allowances.",
    },
    {
      label: "HRA exemption (old regime)",
      expression: "Exemption = min(HRA received, Rent − 10% of salary, 50%/40% of salary)",
      explanation: "The least of the three statutory limits; metro uses 50%, other locations 40%.",
    },
  ],
  contentSections: [
    {
      heading: "How HRA exemption is calculated",
      paragraphs: [
        "Under the old tax regime, HRA exemption under Section 10(13A) is the least of three amounts computed from your salary basis, HRA received and rent paid.",
        "The calculator evaluates all three limits, exempts the smallest, and treats the rest of your HRA as taxable salary income.",
      ],
    },
    {
      heading: "The three limits used in the calculation",
      paragraphs: [
        "First, the actual HRA you received — the exemption can never exceed what was paid to you. Second, rent paid minus 10% of your salary basis, floored at zero so low rents simply yield no exemption. Third, the location limit: half your salary basis in metro locations, 40% elsewhere.",
      ],
    },
    {
      heading: "HRA calculation for metro and non-metro cities",
      paragraphs: [
        "The only difference between the two city types is the location percentage: 50% of salary basis for specified metropolitan locations, 40% everywhere else.",
        "With ₹6,00,000 salary basis, ₹3,00,000 HRA and ₹3,60,000 rent, a metro location exempts ₹3,00,000 while a non-metro location exempts ₹2,40,000 — leaving ₹60,000 taxable.",
      ],
    },
    {
      heading: "HRA under the old and new tax regimes",
      paragraphs: [
        "Section 10(13A) HRA exemption exists only under the old tax regime. Select the new regime and this calculator reports zero exemption with the full HRA taxable, without running the old-regime formula.",
        "The calculator does not tell you which regime to choose and does not compare regimes — it only applies the HRA rule for the regime you select.",
      ],
    },
    {
      heading: "What counts as salary for HRA calculation",
      paragraphs: [
        "This calculator uses Basic Salary plus DA forming part of retirement benefits as the salary basis. It never substitutes gross salary, CTC, bonus or special allowances, and it does not model commission-based salary.",
        "CTC includes many items outside this salary basis — see the [CTC to in-hand salary calculator](/tools/finance/ctc-to-in-hand) for how CTC breaks down. Do not confuse this salary basis with the gratuity provision sometimes shown in CTC (see the [gratuity calculator](/tools/finance/gratuity-calculator)).",
      ],
    },
    {
      heading: "Example HRA calculation",
      paragraphs: [
        "Illustrative example computed by this calculator: basic salary ₹6,00,000 a year, no eligible DA, HRA received ₹3,00,000 a year, rent ₹3,60,000 a year, metro location, old regime.",
        `Salary basis ${formatINR(workedExample.salaryForHra)}. Actual HRA ${formatINR(workedExample.actualHraComponent)}. Rent minus 10% of salary is ${formatINR(workedExample.rentPaidAnnual)} − ${formatINR(workedExample.salaryForHra * 0.1)} = ${formatINR(workedExample.rentMinusTenPercentComponent)}. The 50% location limit is ${formatINR(workedExample.locationLimitComponent)}. HRA exemption is ${formatINR(workedExample.hraExemption)} and taxable HRA is ${formatINR(workedExample.taxableHra)}.`,
      ],
    },
    {
      heading: "Documents and rent-payment considerations",
      paragraphs: [
        "This calculator does not verify rent receipts, agreements or payment proof, and it makes no claim about documentation thresholds or filing requirements — those depend on current official guidance and your circumstances.",
        "Keep whatever rent records your employer or tax filing requires, independent of this estimate.",
      ],
    },
    {
      heading: "HRA calculator limitations",
      list: [
        "This is an estimate, not an official tax assessment or legal advice.",
        "It does not compute final income tax or take-home salary — see the [salary calculator](/tools/finance/salary-calculator) for broader estimation.",
        "It is separate from retirement contributions estimated with the [PF calculator](/tools/finance/pf-calculator).",
        "A revised salary changes the salary basis — increments are estimated with the [salary hike calculator](/tools/finance/salary-hike-calculator).",
        "Commission-based salary treatment is not modelled.",
        "Eligibility for the exemption itself (employment, accommodation, regime) is assumed as selected, not verified.",
      ],
    },
    {
      heading: "Sources & verification",
      paragraphs: [
        "The exemption structure follows Section 10(13A) of the Income-tax Act as restated in current Income Tax Department material (incometax.gov.in): least of actual HRA, rent minus 10% of salary, and the 50% metro / 40% non-metro location limit, available under the old regime only.",
        "This calculator is an independent estimate and is not affiliated with or endorsed by the government. Verify exemption claims against official guidance or a tax professional.",
      ],
    },
  ],
  faq: [
    {
      question: "What is HRA?",
      answer:
        "House Rent Allowance is the part of salary paid to employees living in rented accommodation. Under the old tax regime, part of it can be exempt from income tax under Section 10(13A).",
    },
    {
      question: "How is HRA exemption calculated?",
      answer:
        "Take the least of three amounts: actual HRA received, rent paid minus 10% of salary, and 50% (metro) or 40% (non-metro) of salary. That least figure is exempt; the rest of the HRA is taxable.",
    },
    {
      question: "What are the three limits used for HRA exemption?",
      answer:
        "Actual HRA received; rent paid minus 10% of Basic plus eligible DA (floored at zero); and the location limit of 50% or 40% of the same salary basis.",
    },
    {
      question: "What percentage applies to metro cities?",
      answer:
        "50% of the salary basis (Basic plus DA forming part of retirement benefits) for specified metropolitan locations.",
    },
    {
      question: "What percentage applies to non-metro cities?",
      answer:
        "40% of the salary basis for all other locations.",
    },
    {
      question: "Can I claim HRA exemption under the new tax regime?",
      answer:
        "No. Section 10(13A) HRA exemption is not available under the new tax regime — the full HRA is taxable there. This calculator reports exactly that when you select the new regime.",
    },
    {
      question: "What salary is used for HRA calculation?",
      answer:
        "Basic Salary plus DA forming part of retirement benefits only — not gross salary, CTC, bonus or other allowances.",
    },
    {
      question: "What happens if rent minus 10% of salary is negative?",
      answer:
        "It is treated as zero, which usually makes the exemption zero (unless actual HRA is also zero). Low rent relative to salary simply yields little or no exemption.",
    },
    {
      question: "Is the HRA calculator the same as an income-tax calculator?",
      answer:
        "No. It computes only the HRA exemption and taxable HRA amounts — not slab tax, rebate, cess or take-home salary.",
    },
    {
      question: "Is the result an official tax assessment?",
      answer:
        "No. It is a mathematical estimate under stated assumptions. Actual tax treatment depends on your employment, records and the applicable law.",
    },
  ],
  relatedToolSlugs: ["salary-calculator", "ctc-to-in-hand", "pf-calculator", "gratuity-calculator", "salary-hike-calculator"],
  exampleInput: {
    basicAnnual: 600000,
    daEligibleAnnual: 0,
    hraReceivedAnnual: 300000,
    rentPaidAnnual: 360000,
    cityType: "metro",
    taxRegime: "old",
    period: "annual",
  },
};
