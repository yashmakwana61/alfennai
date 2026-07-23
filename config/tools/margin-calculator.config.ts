import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { MarginCalculator } from "@/components/tools/MarginCalculator";

const schema = z.object({
  cost: z.number().positive("Enter a cost greater than 0"),
  revenue: z.number().positive("Enter revenue greater than 0"),
});

export type MarginInput = z.infer<typeof schema>;
export interface MarginOutput {
  profit: number;
  marginPercent: number;
  markupPercent: number;
}

function compute(input: MarginInput): MarginOutput {
  const profit = input.revenue - input.cost;
  return {
    profit,
    marginPercent: (profit / input.revenue) * 100,
    markupPercent: (profit / input.cost) * 100,
  };
}

export const marginCalculatorTool: ToolConfig<MarginInput, MarginOutput> = {
  id: "margin-calculator",
  slug: "margin-calculator",
  title: "Margin Calculator",
  shortDescription: "Calculate profit margin and markup percentage from cost and revenue.",
  longDescription:
    "The Margin Calculator computes both gross margin (profit as a percentage of revenue) and markup (profit as a percentage of cost) — two related but different metrics often confused in pricing decisions.",
  category: "business-tools",
  icon: "PieChart",
  seo: {
    metaTitle: "Margin Calculator - Profit Margin & Markup Free",
    metaDescription: "Free margin calculator. Calculate profit margin and markup percentage from cost and revenue instantly.",
    keywords: ["margin calculator", "markup calculator", "profit margin calculator"],
  },
  inputSchema: schema,
  compute,
  component: MarginCalculator,
  formulas: [
    { label: "Margin", expression: "Margin% = (Revenue − Cost) / Revenue × 100", explanation: "Profit as a percentage of the selling price." },
    { label: "Markup", expression: "Markup% = (Revenue − Cost) / Cost × 100", explanation: "Profit as a percentage of the cost price." },
  ],
  faq: [{ question: "Why is markup always higher than margin?", answer: "Because markup divides profit by the smaller number (cost) while margin divides by the larger number (revenue), for the same profit amount." }],
  relatedToolSlugs: ["profit-calculator", "discount-calculator"],
  exampleInput: { cost: 800, revenue: 1000 },
};
