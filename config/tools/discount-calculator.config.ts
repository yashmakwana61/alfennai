import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { DiscountCalculator } from "@/components/tools/DiscountCalculator";

const schema = z.object({
  originalPrice: z.number().positive("Enter a price greater than 0"),
  discountPercent: z.number().min(0).max(100),
});

export type DiscountInput = z.infer<typeof schema>;
export interface DiscountOutput {
  finalPrice: number;
  savedAmount: number;
}

function compute(input: DiscountInput): DiscountOutput {
  const savedAmount = (input.originalPrice * input.discountPercent) / 100;
  return { finalPrice: input.originalPrice - savedAmount, savedAmount };
}

export const discountCalculatorTool: ToolConfig<DiscountInput, DiscountOutput> = {
  id: "discount-calculator",
  slug: "discount-calculator",
  title: "Discount Calculator",
  shortDescription: "Calculate the final price and amount saved after a percentage discount.",
  longDescription:
    "The Discount Calculator takes an original price and a discount percentage and instantly shows the discounted price and the exact amount you save, useful for shopping, sales planning and budgeting.",
  category: "calculators",
  icon: "Tag",
  isFeatured: true,
  seo: {
    metaTitle: "Discount Calculator - Calculate Sale Price Free",
    metaDescription: "Free discount calculator. Find the final price and savings after any percentage discount instantly.",
    keywords: ["discount calculator", "sale price calculator", "percent off calculator"],
  },
  inputSchema: schema,
  compute,
  component: DiscountCalculator,
  formulas: [{ label: "Final price", expression: "Final = Price × (1 − Discount% / 100)", explanation: "The discount percentage is subtracted from 100% and multiplied by the original price." }],
  faq: [{ question: "Can I stack multiple discounts?", answer: "This calculator applies one discount at a time. For stacked discounts, apply the result of one calculation as the original price for the next." }],
  relatedToolSlugs: ["percentage-calculator", "margin-calculator"],
  exampleInput: { originalPrice: 2000, discountPercent: 25 },
};
