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
  intro: [
    "Paste or type any text to get live counts of words, characters (with and without spaces), sentences, paragraphs and estimated reading time — no button to click.",
  ],
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
    { question: "How are words counted?", answer: "Text is split on whitespace: every run of non-whitespace characters counts as one word. Multiple spaces, tabs and newlines never inflate the count." },
    { question: "What is the difference between word count and character count?", answer: "Word count is the number of whitespace-separated tokens; character count is the number of characters. A 9-word sentence can be 44 characters — the two answer different questions, so this tool shows both." },
    { question: "Does the counter include spaces?", answer: "Both figures are shown: total characters including spaces, and characters with all whitespace removed." },
    { question: "How is reading time calculated?", answer: "Based on an average adult reading speed of 200 words per minute, rounded up to the nearest minute -- the same benchmark commonly used by blogging platforms and Medium-style reading time estimates." },
    { question: "How is a 'sentence' counted?", answer: "The counter looks for sentence-ending punctuation (. ! ?) followed by whitespace or the end of the text. Abbreviations with periods (like 'e.g.') can occasionally be counted as sentence breaks, so treat the count as a close estimate." },
    { question: "Can I use it for essays and assignments?", answer: "Yes — essays, applications, articles and assignments are the main use case. Just note that strict institutional counters may treat hyphenation or punctuation slightly differently, so allow a small margin under hard limits." },
    { question: "Is my text stored or uploaded anywhere?", answer: "No -- the count updates entirely in your browser as you type; nothing is sent to a server." },
  ],
  relatedToolSlugs: ["character-counter", "case-converter"],
  contentSections: [
    {
      heading: "Worked example",
      paragraphs: [
        "“The quick brown fox jumps over the lazy dog.” counts as 9 words, 44 characters, 36 characters without spaces, 1 sentence, 1 paragraph, and about 1 minute of reading time.",
        "For per-character limits (tweets, meta descriptions, form fields), the companion [character counter](/tools/text-tools/character-counter) breaks the same text down by letters, digits and remaining allowance.",
      ],
    },
    {
      heading: "How each metric is counted",
      list: [
        "Words: whitespace-separated tokens (hyphenated words like “well-known” count as one)",
        "Characters: every character including spaces; and the same total with all whitespace removed",
        "Sentences: runs ending in . ! or ? followed by whitespace or end of text",
        "Paragraphs: blocks separated by blank lines",
        "Reading time: words ÷ 200 per minute, rounded up, minimum 1 minute",
      ],
    },
    {
      heading: "Counting differs between platforms",
      paragraphs: [
        "Punctuation, extra whitespace, symbols and non-English scripts are handled differently by different platforms — there is no single universal counting standard. Treat close-to-limit counts as approximate and keep a margin where a platform enforces a hard maximum.",
      ],
    },
  ],
  exampleInput: { text: "The quick brown fox jumps over the lazy dog." },
};
