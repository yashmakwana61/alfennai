import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { RandomGenerator } from "@/components/tools/RandomGenerator";

const schema = z.object({
  min: z.number(),
  max: z.number(),
  count: z.number().int().min(1).max(100),
  allowDuplicates: z.boolean(),
});
export type RandomGeneratorInput = z.infer<typeof schema>;
export interface RandomGeneratorOutput { numbers: number[]; error?: string }

function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function compute(input: RandomGeneratorInput): RandomGeneratorOutput {
  if (input.min > input.max) return { numbers: [], error: "Min must be less than or equal to max" };
  const range = input.max - input.min + 1;
  if (!input.allowDuplicates && input.count > range) {
    return { numbers: [], error: `Cannot generate ${input.count} unique numbers from a range of only ${range}` };
  }

  if (input.allowDuplicates) {
    return { numbers: Array.from({ length: input.count }, () => secureRandomInt(input.min, input.max)) };
  }

  const pool: number[] = [];
  for (let n = input.min; n <= input.max; n++) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { numbers: pool.slice(0, input.count) };
}

export const randomGeneratorTool: ToolConfig<RandomGeneratorInput, RandomGeneratorOutput> = {
  id: "random-generator",
  slug: "random-generator",
  title: "Random Number Generator",
  shortDescription: "Generate cryptographically random numbers within any range.",
  longDescription:
    "The Random Number Generator produces one or many random integers within a chosen range, using your browser's cryptographically secure random number generator, with an option to disallow duplicates.",
  category: "generators",
  icon: "Dice5",
  seo: {
    metaTitle: "Random Number Generator - Free Online RNG",
    metaDescription: "Free random number generator. Generate one or many random numbers within any range instantly.",
    keywords: ["random number generator", "rng online", "random number picker"],
  },
  inputSchema: schema,
  compute,
  component: RandomGenerator,
  faq: [{ question: "Is this suitable for lotteries or draws?", answer: "It uses a cryptographically secure random source, making it suitable for fair random selection in casual contexts like giveaways or team assignments." }],
  relatedToolSlugs: ["uuid-generator", "password-generator"],
  exampleInput: { min: 1, max: 100, count: 5, allowDuplicates: false },
};
