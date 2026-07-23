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
    "Body Mass Index (BMI) is the most widely used screening measure for classifying weight ranges, used by doctors, insurers and health organizations worldwide. This calculator applies the standard WHO formula to your weight and height and instantly tells you which of the four standard categories -- underweight, normal, overweight, or obese -- your result falls into.\n\nBMI works the same way regardless of units: enter your weight in kilograms and height in centimeters, and the calculation divides weight by height-in-meters squared. The categories used here (below 18.5 underweight, 18.5-24.9 normal, 25-29.9 overweight, 30+ obese) match the WHO's standard adult BMI classification.\n\nBMI is a fast, useful screening number, but it's a starting point rather than a full picture -- it doesn't distinguish muscle mass from fat, and doesn't account for age, sex, or body frame. Athletes and very muscular people, for example, often show a higher BMI despite low body fat.",
  category: "healthcare",
  icon: "HeartPulse",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "BMI Calculator - Body Mass Index Calculator Free",
    metaDescription: "Free BMI calculator. Calculate your Body Mass Index and weight category instantly from weight and height.",
    keywords: ["bmi calculator", "body mass index calculator", "bmi chart", "bmi calculator kg cm", "healthy weight calculator"],
  },
  inputSchema: schema,
  compute,
  component: BmiCalculator,
  formulas: [{ label: "BMI formula", expression: "BMI = Weight(kg) / Height(m)²", explanation: "Weight in kilograms divided by height in meters squared." }],
  faq: [
    { question: "Is BMI accurate for everyone?", answer: "BMI is a general screening tool and doesn't account for muscle mass, bone density, or body composition, so it may not be accurate for athletes, older adults, or pregnant people. Consult a healthcare professional for a full assessment." },
    { question: "What is a healthy BMI range?", answer: "For most adults, the WHO defines 18.5 to 24.9 as the normal/healthy weight range. This applies broadly across adult ages but is a general guideline, not an individual medical assessment." },
    { question: "Does BMI differ for men and women?", answer: "The standard BMI formula and category thresholds are the same for adult men and women. Body composition differences aren't reflected in the number itself, which is one of the main limitations of BMI as a metric." },
    { question: "Can I use pounds and inches instead of kg and cm?", answer: "This calculator expects kilograms and centimeters. To convert: 1 lb = 0.4536 kg, and 1 inch = 2.54 cm." },
  ],
  relatedToolSlugs: ["age-calculator"],
  exampleInput: { weightKg: 70, heightCm: 175 },
};
