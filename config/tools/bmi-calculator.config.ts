import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { BmiCalculator } from "@/components/tools/BmiCalculator";

const schema = z.object({
  weightKg: z.number().positive("Enter a valid weight"),
  heightCm: z.number().positive("Enter a valid height"),
});

export type BmiInput = z.infer<typeof schema>;
export interface BmiOutput {
  bmi: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
}

function compute(input: BmiInput): BmiOutput {
  const heightM = input.heightCm / 100;
  const bmi = input.weightKg / (heightM * heightM);
  let category: BmiOutput["category"] = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi, category };
}

export const bmiCalculatorTool: ToolConfig<BmiInput, BmiOutput> = {
  id: "bmi-calculator",
  slug: "bmi-calculator",
  title: "BMI Calculator",
  shortDescription: "Calculate your Body Mass Index and see your weight category.",
  longDescription:
    "The BMI Calculator computes Body Mass Index from your weight and height using the standard WHO formula, and classifies the result into underweight, normal, overweight or obese ranges.",
  category: "healthcare",
  icon: "HeartPulse",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "BMI Calculator - Body Mass Index Calculator Free",
    metaDescription: "Free BMI calculator. Calculate your Body Mass Index and weight category instantly from weight and height.",
    keywords: ["bmi calculator", "body mass index calculator", "bmi chart"],
  },
  inputSchema: schema,
  compute,
  component: BmiCalculator,
  formulas: [{ label: "BMI formula", expression: "BMI = Weight(kg) / Height(m)²", explanation: "Weight in kilograms divided by height in meters squared." }],
  faq: [
    { question: "Is BMI accurate for everyone?", answer: "BMI is a general screening tool and doesn't account for muscle mass, bone density, or body composition, so it may not be accurate for athletes, older adults, or pregnant people. Consult a healthcare professional for a full assessment." },
  ],
  relatedToolSlugs: ["age-calculator"],
  exampleInput: { weightKg: 70, heightCm: 175 },
};
