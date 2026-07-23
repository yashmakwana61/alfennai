import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { WordCounter } from "@/components/tools/WordCounter";

const schema = z.object({ text: z.string() });
export type WordCounterInput = z.infer<typeof schema>;
export interface WordCounterOutput {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

function compute(input: WordCounterInput): WordCounterOutput {
  const text = input.text;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? (text.match(/[.!?]+(?=\s|$)/g)?.length ?? (text.trim() ? 1 : 0)) : 0;
  const paragraphs = text.trim() ? text.split(/\n{2,}/).filter((p) => p.trim()).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTimeMinutes };
}

export const wordCounterTool: ToolConfig<WordCounterInput, WordCounterOutput> = {
  id: "word-counter",
  slug: "word-counter",
  title: "Word Counter",
  shortDescription: "Count words, characters, sentences and estimated reading time.",
  longDescription:
    "The Word Counter analyzes your text in real time, reporting word count, character count (with and without spaces), sentence count, paragraph count and an estimated reading time based on 200 words per minute.",
  category: "text-tools",
  icon: "Type",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "Word Counter - Count Words & Characters Free",
    metaDescription: "Free word counter. Count words, characters, sentences, paragraphs and reading time instantly.",
    keywords: ["word counter", "character counter", "count words online"],
  },
  inputSchema: schema,
  compute,
  component: WordCounter,
  faq: [{ question: "How is reading time calculated?", answer: "Based on an average adult reading speed of 200 words per minute, rounded up to the nearest minute." }],
  relatedToolSlugs: ["character-counter", "case-converter"],
  exampleInput: { text: "The quick brown fox jumps over the lazy dog." },
};
