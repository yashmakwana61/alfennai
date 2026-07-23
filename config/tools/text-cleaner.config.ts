import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { TextCleaner } from "@/components/tools/TextCleaner";

const schema = z.object({
  text: z.string().min(1, "Enter text to clean"),
  trimLines: z.boolean(),
  collapseSpaces: z.boolean(),
  removeEmptyLines: z.boolean(),
  stripPunctuation: z.boolean(),
});
export type TextCleanerInput = z.infer<typeof schema>;
export interface TextCleanerOutput { cleaned: string }

function compute(input: TextCleanerInput): TextCleanerOutput {
  let lines = input.text.split("\n");
  if (input.trimLines) lines = lines.map((l) => l.trim());
  if (input.removeEmptyLines) lines = lines.filter((l) => l.trim().length > 0);
  let cleaned = lines.join("\n");
  if (input.collapseSpaces) cleaned = cleaned.replace(/[ \t]+/g, " ");
  if (input.stripPunctuation) cleaned = cleaned.replace(/[.,/#!$%^&*;:{}=\-_`~()"'?]/g, "");
  return { cleaned };
}

export const textCleanerTool: ToolConfig<TextCleanerInput, TextCleanerOutput> = {
  id: "text-cleaner",
  slug: "text-cleaner",
  title: "Text Cleaner",
  shortDescription: "Trim whitespace, collapse spaces, remove empty lines and strip punctuation.",
  longDescription:
    "The Text Cleaner tidies up messy pasted text: trimming leading/trailing whitespace per line, collapsing repeated spaces, removing blank lines, and optionally stripping punctuation — configurable to exactly what you need.",
  category: "text-tools",
  icon: "Eraser",
  seo: {
    metaTitle: "Text Cleaner - Clean & Tidy Text Online Free",
    metaDescription: "Free text cleaner. Trim whitespace, collapse spaces, remove blank lines and strip punctuation instantly.",
    keywords: ["text cleaner", "remove extra spaces", "clean text online"],
  },
  inputSchema: schema,
  compute,
  component: TextCleaner,
  faq: [{ question: "Can I undo a cleaning operation?", answer: "The original text stays in the input box until you clear it, so you can adjust options and re-run as needed." }],
  relatedToolSlugs: ["remove-duplicate-lines", "word-counter"],
  exampleInput: { text: "  Hello   world  \n\n\n  This is   messy text.  ", trimLines: true, collapseSpaces: true, removeEmptyLines: true, stripPunctuation: false },
};
