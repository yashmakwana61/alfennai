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
    "Percentages come up constantly -- working out a discount, checking exam scores, comparing growth between two periods -- but the three common percentage problems each use a different formula, which is where most manual calculation mistakes happen. This calculator handles all three in one place.\n\n\"X% of Y\" answers questions like \"what is 20% of 150?\" -- useful for tips, discounts, and commission. \"X is what percent of Y\" flips that around: if you scored 42 out of 60, what percentage is that? And \"percentage change\" tells you the percent increase or decrease between an original value and a new one -- the calculation behind revenue growth, price changes, or year-over-year comparisons.\n\nJust select the calculation type, enter your two numbers, and get an instant, exact result -- no need to remember which formula applies to which situation.",
  category: "calculators",
  icon: "Percent",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "Percentage Calculator - Free Online Percent Calculator",
    metaDescription: "Free percentage calculator. Find X% of Y, what percent X is of Y, and percentage change instantly.",
    keywords: ["percentage calculator", "percent calculator", "percentage change calculator", "percentage increase calculator", "what percent of"],
  },
  inputSchema: schema,
  compute,
  component: PercentageCalculator,
  faq: [
    { question: "How do I calculate percentage increase?", answer: "Use the 'percentage change' mode: enter the original value as X and the new value as Y. A positive result is an increase, negative is a decrease." },
    { question: "What's the formula for 'X is what percent of Y'?", answer: "Divide X by Y and multiply by 100: (X / Y) × 100. For example, 42 out of 60 is (42/60) × 100 = 70%." },
    { question: "How do I find 20% of a number?", answer: "Use 'X% of Y' mode with X = 20 and Y = your number. The formula is (20/100) × Y." },
    { question: "Why is percentage change based on the original value, not the average?", answer: "Percentage change measures relative movement from a starting point, so it's always calculated against the original (X) value, not an average of the two -- this is the standard convention used in finance and statistics." },
  ],
  relatedToolSlugs: ["discount-calculator", "gst-calculator"],
  exampleInput: { mode: "of", x: 20, y: 150 },
};
