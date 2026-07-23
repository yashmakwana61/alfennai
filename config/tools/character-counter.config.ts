import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { CharacterCounter } from "@/components/tools/CharacterCounter";

const schema = z.object({ text: z.string(), limit: z.number().int().min(0).optional() });
export type CharacterCounterInput = z.infer<typeof schema>;
export interface CharacterCounterOutput {
  total: number;
  noSpaces: number;
  digits: number;
  letters: number;
  remaining?: number;
}

function compute(input: CharacterCounterInput): CharacterCounterOutput {
  const total = input.text.length;
  const noSpaces = input.text.replace(/\s/g, "").length;
  const digits = (input.text.match(/[0-9]/g) ?? []).length;
  const letters = (input.text.match(/[a-zA-Z]/g) ?? []).length;
  const remaining = input.limit !== undefined ? input.limit - total : undefined;
  return { total, noSpaces, digits, letters, remaining };
}

export const characterCounterTool: ToolConfig<CharacterCounterInput, CharacterCounterOutput> = {
  id: "character-counter",
  slug: "character-counter",
  title: "Character Counter",
  shortDescription: "Count characters with an optional limit, like for tweets or SMS.",
  longDescription:
    "The Character Counter tracks total characters, letters and digits in real time, with an optional character limit — useful for tweets, meta descriptions, SMS messages and form fields with strict length constraints.",
  category: "text-tools",
  icon: "Hash",
  seo: {
    metaTitle: "Character Counter - Count Characters Online Free",
    metaDescription: "Free character counter with optional limit tracking. Count letters, digits and total characters instantly.",
    keywords: ["character counter", "character count online", "letter counter"],
  },
  inputSchema: schema,
  compute,
  component: CharacterCounter,
  faq: [{ question: "Does it count emoji correctly?", answer: "Characters are counted using standard JavaScript string length, which counts most emoji as 2 characters (surrogate pairs)." }],
  relatedToolSlugs: ["word-counter", "case-converter"],
  exampleInput: { text: "Hello, AlfennAI!", limit: 280 },
};
