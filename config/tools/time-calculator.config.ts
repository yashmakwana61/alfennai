import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { TimeCalculator } from "@/components/tools/TimeCalculator";

const schema = z.object({
  h1: z.number().min(0), m1: z.number().min(0).max(59), s1: z.number().min(0).max(59),
  h2: z.number().min(0), m2: z.number().min(0).max(59), s2: z.number().min(0).max(59),
  operation: z.enum(["add", "subtract"]),
});

export type TimeInput = z.infer<typeof schema>;
export interface TimeOutput {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  negative: boolean;
}

function compute(input: TimeInput): TimeOutput {
  const t1 = input.h1 * 3600 + input.m1 * 60 + input.s1;
  const t2 = input.h2 * 3600 + input.m2 * 60 + input.s2;
  let total = input.operation === "add" ? t1 + t2 : t1 - t2;
  const negative = total < 0;
  total = Math.abs(total);
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: Math.floor(total % 60),
    totalSeconds: total,
    negative,
  };
}

export const timeCalculatorTool: ToolConfig<TimeInput, TimeOutput> = {
  id: "time-calculator",
  slug: "time-calculator",
  title: "Time Calculator",
  shortDescription: "Add or subtract two durations in hours, minutes and seconds.",
  longDescription:
    "The Time Calculator adds or subtracts two time durations expressed in hours, minutes and seconds, returning the result normalized back into hours, minutes and seconds — useful for timesheets, video editing and scheduling.",
  category: "calculators",
  icon: "Clock",
  seo: {
    metaTitle: "Time Calculator - Add or Subtract Time Free",
    metaDescription: "Free time calculator. Add or subtract hours, minutes and seconds instantly.",
    keywords: ["time calculator", "add time calculator", "time duration calculator"],
  },
  inputSchema: schema,
  compute,
  component: TimeCalculator,
  faq: [{ question: "Can the result be negative?", answer: "Yes, if you subtract a larger duration from a smaller one, the result is shown as a negative duration." }],
  relatedToolSlugs: ["date-difference", "age-calculator"],
  exampleInput: { h1: 2, m1: 30, s1: 0, h2: 1, m2: 45, s2: 0, operation: "add" },
};
