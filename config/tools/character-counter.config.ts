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
  intro: [
    "Type or paste any text to see live character totals with an optional limit: total characters, characters without spaces, letters, digits and characters remaining.",
  ],
  longDescription:
    "The Character Counter tracks total characters, letters and digits in real time, with an optional character limit — useful for tweets, meta descriptions, SMS messages and form fields with strict length constraints. Every keystroke updates five figures at once: total characters including spaces, characters with whitespace removed, ASCII letters, digits, and — when you set a limit — how many characters remain. Characters are UTF-16 code units, so most emoji count as two, and the letters figure covers a–z/A–Z while accented or non-Latin scripts count in the totals. All counting happens locally in your browser as you type.",
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
  faq: [
    { question: "How are characters counted?", answer: "Every unit in the text counts: letters, digits, punctuation, spaces and line breaks. The total uses standard JavaScript string length." },
    { question: "Are spaces included?", answer: "Both totals are shown — characters with spaces and characters with all whitespace removed — so you can match whichever rule your platform uses." },
    { question: "What is the difference between characters with and without spaces?", answer: "“Characters” is the full length; “no spaces” strips all whitespace first. For “Hello, AlfennAI!” that is 16 versus 15." },
    { question: "Are punctuation marks counted?", answer: "Yes — punctuation counts toward the totals. Letters (a–z, A–Z) and digits (0–9) are additionally broken out as their own figures." },
    { question: "Does the tool support Unicode text?", answer: "Unicode text is accepted and counted, but note two details: characters are UTF-16 code units, so most emoji count as 2; and the letters figure covers ASCII a–z/A–Z only, so accented or non-Latin letters appear in the totals but not in the letters breakdown." },
    { question: "Does it count emoji correctly?", answer: "Characters are counted using standard JavaScript string length, which counts most emoji as 2 characters (surrogate pairs)." },
    { question: "Is my text processed locally?", answer: "Yes — counting runs entirely in your browser as you type; nothing is sent to a server or stored." },
  ],
  relatedToolSlugs: ["word-counter", "case-converter"],
  contentSections: [
    {
      heading: "Worked example",
      paragraphs: [
        "“Hello, AlfennAI!” with a 280-character limit counts as 16 characters total, 15 without spaces, 13 letters, 0 digits, and 264 remaining.",
        "For word-level stats on the same text — words, sentences, paragraphs and reading time — use the [word counter](/tools/text-tools/word-counter).",
      ],
    },
    {
      heading: "Practical uses",
      paragraphs: [
        "Social posts, titles, meta descriptions, SMS segments, form fields and developer strings all impose length limits in characters rather than words. Set the optional limit to watch the remaining allowance shrink as you type.",
      ],
    },
    {
      heading: "Important limitations",
      list: [
        "This counts characters, not bytes — byte length in UTF-8 can be larger and is not shown.",
        "No platform-specific limits are built in; limits change, so enter the current figure yourself.",
        "Letters covers ASCII a–z/A–Z only; other scripts count in the totals.",
      ],
    },
  ],
  exampleInput: { text: "Hello, AlfennAI!", limit: 280 },
};
