import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { ProfitCalculator } from "@/components/tools/ProfitCalculator";

const schema = z.object({
  costPrice: z.number().positive("Enter a cost price greater than 0"),
  sellingPrice: z.number().nonnegative(),
});

export type ProfitInput = z.infer<typeof schema>;
export interface ProfitOutput {
  profitOrLoss: number;
  percent: number;
  isProfit: boolean;
}

function compute(input: ProfitInput): ProfitOutput {
  const diff = input.sellingPrice - input.costPrice;
  return { profitOrLoss: Math.abs(diff), percent: Math.abs((diff / input.costPrice) * 100), isProfit: diff >= 0 };
}

export const profitCalculatorTool: ToolConfig<ProfitInput, ProfitOutput> = {
  id: "profit-calculator",
  slug: "profit-calculator",
  title: "Profit Calculator",
  shortDescription: "Calculate profit or loss amount and percentage from cost and selling price.",
  longDescription:
    "The Profit Calculator compares your cost price and selling price to determine whether you made a profit or a loss, and shows both the exact amount and the percentage relative to your cost.",
  category: "business-tools",
  icon: "TrendingUp",
  isFeatured: true,
  seo: {
    metaTitle: "Profit Calculator - Profit & Loss Percentage Free",
    metaDescription: "Free profit calculator. Calculate profit or loss amount and percentage from cost and selling price.",
    keywords: ["profit calculator", "profit loss calculator", "profit percentage calculator"],
  },
  inputSchema: schema,
  compute,
  component: ProfitCalculator,
  formulas: [{ label: "Profit %", expression: "Profit% = (Selling − Cost) / Cost × 100", explanation: "A negative result indicates a loss." }],
  faq: [{ question: "What's the difference between profit percentage and margin?", answer: "Profit percentage here is relative to cost price. Margin (see the Margin Calculator) is relative to selling price/revenue instead." }],
  relatedToolSlugs: ["margin-calculator", "discount-calculator"],
  exampleInput: { costPrice: 800, sellingPrice: 1000 },
};
