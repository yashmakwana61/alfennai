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
    "Whether you're hitting a strict word count for an assignment, staying under a character limit for a meta description or tweet, or just curious how long a piece will take to read, this counter analyzes your text live as you type -- no button to click, no waiting.\n\nBeyond the basic word count, it breaks down character count both with and without spaces, sentence count, paragraph count, and an estimated reading time based on a 200-words-per-minute average adult reading speed -- the same benchmark used by most publishing platforms.\n\nEverything updates instantly and locally in your browser; nothing you paste is ever sent anywhere, which matters if you're working with a draft you'd rather keep private.",
  category: "text-tools",
  icon: "Type",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "Word Counter - Count Words & Characters Free",
    metaDescription: "Free word counter. Count words, characters, sentences, paragraphs and reading time instantly.",
    keywords: ["word counter", "character counter", "count words online", "word count tool", "reading time calculator"],
  },
  inputSchema: schema,
  compute,
  component: WordCounter,
  faq: [
    { question: "How is reading time calculated?", answer: "Based on an average adult reading speed of 200 words per minute, rounded up to the nearest minute -- the same benchmark commonly used by blogging platforms and Medium-style reading time estimates." },
    { question: "How is a 'sentence' counted?", answer: "The counter looks for sentence-ending punctuation (. ! ?) followed by whitespace or the end of the text. Abbreviations with periods (like 'e.g.') can occasionally be counted as sentence breaks, so treat the count as a close estimate." },
    { question: "Does it count words separated by hyphens as one or two?", answer: "A hyphenated word like 'well-known' is counted as one word, since it contains no whitespace." },
    { question: "Is my text stored or uploaded anywhere?", answer: "No -- the count updates entirely in your browser as you type; nothing is sent to a server." },
  ],
  relatedToolSlugs: ["character-counter", "case-converter"],
  exampleInput: { text: "The quick brown fox jumps over the lazy dog." },
};
