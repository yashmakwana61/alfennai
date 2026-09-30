import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { GstCalculator } from "@/components/tools/GstCalculator";

const schema = z.object({
  amount: z.number().positive("Enter an amount greater than 0"),
  gstRate: z.number().min(0).max(100),
  mode: z.enum(["exclusive", "inclusive"]),
});

export type GstInput = z.infer<typeof schema>;
export interface GstOutput {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
}

function compute(input: GstInput): GstOutput {
  if (input.mode === "exclusive") {
    const gstAmount = (input.amount * input.gstRate) / 100;
    return { baseAmount: input.amount, gstAmount, totalAmount: input.amount + gstAmount };
  }
  const baseAmount = input.amount / (1 + input.gstRate / 100);
  const gstAmount = input.amount - baseAmount;
  return { baseAmount, gstAmount, totalAmount: input.amount };
}

export const gstCalculatorTool: ToolConfig<GstInput, GstOutput> = {
  id: "gst-calculator",
  slug: "gst-calculator",
  title: "GST Calculator",
  shortDescription: "Calculate GST amount and total price, inclusive or exclusive of tax.",
  intro: [
    "The one choice that decides every GST number: does your amount already include tax, or is tax still to be added? Pick the wrong direction and the base price, tax amount and total all come out wrong.",
    "Select “Exclusive of GST” to add tax on top of a base price, or “Inclusive of GST” to split a tax-inclusive total (such as an MRP) back into base price and tax.",
  ],
  longDescription:
    "Goods and Services Tax (GST) calculations trip people up in one specific way: whether the amount you have already includes tax or not. Get that wrong and every downstream number -- invoice totals, margins, tax filings -- is off. This calculator handles both directions correctly.\n\nIf you have a base price and need to add GST on top (exclusive), it calculates the tax amount and adds it to give you the final price. If you already have a GST-inclusive amount -- say, an MRP or a total invoice figure -- and need to know how much of that is the base price versus the tax component, the calculator extracts that split for you using the correct inclusive formula (dividing by 1 + rate/100, not simply subtracting the percentage).\n\nWorks for any GST rate -- 5%, 12%, 18%, 28%, or any custom rate -- making it useful beyond India's standard slabs for any percentage-based tax calculation.",
  category: "finance",
  icon: "Receipt",
  isFeatured: true,
  seo: {
    metaTitle: "GST Calculator - Calculate GST Amount Online Free",
    metaDescription: "Free GST calculator. Calculate GST inclusive or exclusive amounts instantly for any rate.",
    keywords: ["gst calculator", "gst calculation", "tax calculator india", "gst calculator online", "reverse gst calculator"],
  },
  inputSchema: schema,
  compute,
  component: GstCalculator,
  formulas: [
    { label: "Exclusive of GST", expression: "GST = Amount × Rate / 100", explanation: "Added on top of the base amount." },
    { label: "Inclusive of GST", expression: "Base = Amount / (1 + Rate/100)", explanation: "Extracted from a tax-inclusive total." },
  ],
  faq: [
    { question: "How do I add GST to a price?", answer: "Choose “Exclusive of GST”, enter the base price and the rate. The calculator adds Amount × Rate / 100 on top — for example, ₹10,000 at 18% gives ₹1,800 GST and a ₹11,800 total." },
    { question: "How do I remove GST from an inclusive price?", answer: "Choose “Inclusive of GST” and enter the total. The calculator divides by (1 + Rate/100) to recover the base — for example, ₹11,800 at 18% splits into a ₹10,000 base and ₹1,800 GST." },
    { question: "What's the difference between inclusive and exclusive GST?", answer: "Exclusive means GST is added on top of your entered amount. Inclusive means your entered amount already contains GST, and the calculator extracts the base price." },
    { question: "Why can't I just subtract the percentage for inclusive GST?", answer: "Because the percentage was applied to the base price, not the total. Subtracting 18% directly from a GST-inclusive total overstates the tax removed -- you need to divide by (1 + rate/100) to correctly reverse the calculation." },
    { question: "What are the standard GST rates in India?", answer: "The common slabs are 5%, 12%, 18% and 28%, depending on the category of goods or services. This calculator works with any rate you enter, not just these four — but it does not decide which slab applies to your product." },
    { question: "What is the difference between CGST/SGST and IGST?", answer: "For sales within a state, GST is generally split equally into CGST and SGST (for example, 18% becomes 9% + 9%). For inter-state sales it is charged as IGST at the full rate. This calculator shows the combined GST amount only — it does not split it into components." },
    { question: "Can I use this for VAT or other percentage-based taxes?", answer: "Yes -- the underlying math (adding or extracting a percentage-based tax) is the same regardless of what the tax is called in your country." },
  ],
  relatedToolSlugs: ["percentage-calculator", "discount-calculator"],
  contentSections: [
    {
      heading: "Worked example",
      paragraphs: [
        "Adding GST: ₹10,000 base at 18% exclusive gives ₹1,800 GST and a ₹11,800 total. Removing GST: ₹11,800 inclusive at 18% splits back into a ₹10,000 base and ₹1,800 GST — the exact mirror of the first calculation.",
        "For a quick percentage sanity-check on either figure, use the [percentage calculator](/tools/calculators/percentage-calculator); for price reductions before tax, use the [discount calculator](/tools/calculators/discount-calculator).",
      ],
    },
    {
      heading: "CGST and SGST versus IGST",
      paragraphs: [
        "As a general rule, intra-state sales split GST into CGST and SGST (each half the headline rate), while inter-state sales charge IGST at the full headline rate. The amount of tax is the same either way in this calculator — only its administrative split differs.",
        "This page shows the combined GST amount, base amount and total. It does not produce CGST/SGST/IGST breakups or filing-ready returns.",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This calculator accepts whatever rate you enter — it does not determine which GST slab legally applies to a product or service. Verify classification against current CBIC guidance or a tax professional.",
        "Rates and slabs can change; the common 5%, 12%, 18% and 28% slabs are examples, not legal advice.",
        "No CGST/SGST/IGST split, input-tax-credit, rounding-as-per-invoice-rules or filing treatment is modelled.",
      ],
    },
  ],
  exampleInput: { amount: 10000, gstRate: 18, mode: "exclusive" },
};
