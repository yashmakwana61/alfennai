import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";

const schema = z.object({
  mode: z.enum(["of", "isWhatPercent", "percentChange"]),
  x: z.number(),
  y: z.number(),
});

export type PercentageInput = z.infer<typeof schema>;
export interface PercentageOutput {
  result: number;
  label: string;
}

function compute(input: PercentageInput): PercentageOutput {
  switch (input.mode) {
    case "of":
      return { result: (input.x / 100) * input.y, label: `${input.x}% of ${input.y}` };
    case "isWhatPercent":
      return { result: (input.x / input.y) * 100, label: `${input.x} is what % of ${input.y}` };
    case "percentChange":
      return { result: ((input.y - input.x) / Math.abs(input.x)) * 100, label: `% change from ${input.x} to ${input.y}` };
  }
}

export const percentageCalculatorTool: ToolConfig<PercentageInput, PercentageOutput> = {
  id: "percentage-calculator",
  slug: "percentage-calculator",
  title: "Percentage Calculator",
  shortDescription: "Calculate percentages, percentage of a number, and percentage change.",
  longDescription:
    "The Percentage Calculator handles the three most common percentage problems: finding X% of a number, figuring out what percent one number is of another, and computing percentage increase or decrease between two values.",
  category: "calculators",
  icon: "Percent",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "Percentage Calculator - Free Online Percent Calculator",
    metaDescription: "Free percentage calculator. Find X% of Y, what percent X is of Y, and percentage change instantly.",
    keywords: ["percentage calculator", "percent calculator", "percentage change calculator"],
  },
  inputSchema: schema,
  compute,
  component: PercentageCalculator,
  faq: [
    { question: "How do I calculate percentage increase?", answer: "Use the 'percentage change' mode: enter the original value as X and the new value as Y. A positive result is an increase, negative is a decrease." },
  ],
  relatedToolSlugs: ["discount-calculator", "gst-calculator"],
  exampleInput: { mode: "of", x: 20, y: 150 },
};
