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
    "The GST Calculator computes Goods and Services Tax for any amount and rate. Choose whether your entered amount already includes GST or not, and get an instant breakdown of base price, GST amount and total price.",
  category: "finance",
  icon: "Receipt",
  isFeatured: true,
  seo: {
    metaTitle: "GST Calculator - Calculate GST Amount Online Free",
    metaDescription: "Free GST calculator. Calculate GST inclusive or exclusive amounts instantly for any rate.",
    keywords: ["gst calculator", "gst calculation", "tax calculator india"],
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
  ],
  relatedToolSlugs: ["percentage-calculator", "discount-calculator"],
  exampleInput: { amount: 10000, gstRate: 18, mode: "exclusive" },
};
