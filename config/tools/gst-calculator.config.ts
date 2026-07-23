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
    { question: "What's the difference between inclusive and exclusive GST?", answer: "Exclusive means GST is added on top of your entered amount. Inclusive means your entered amount already contains GST, and the calculator extracts the base price." },
    { question: "Why can't I just subtract the percentage for inclusive GST?", answer: "Because the percentage was applied to the base price, not the total. Subtracting 18% directly from a GST-inclusive total overstates the tax removed -- you need to divide by (1 + rate/100) to correctly reverse the calculation." },
    { question: "What are the standard GST rates in India?", answer: "The common slabs are 5%, 12%, 18% and 28%, depending on the category of goods or services. This calculator works with any rate you enter, not just these four." },
    { question: "Can I use this for VAT or other percentage-based taxes?", answer: "Yes -- the underlying math (adding or extracting a percentage-based tax) is the same regardless of what the tax is called in your country." },
  ],
  relatedToolSlugs: ["percentage-calculator", "discount-calculator"],
  exampleInput: { amount: 10000, gstRate: 18, mode: "exclusive" },
};
