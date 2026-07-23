import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { RemoveDuplicateLines } from "@/components/tools/RemoveDuplicateLines";

const schema = z.object({ text: z.string().min(1, "Enter text"), caseSensitive: z.boolean(), trimLines: z.boolean() });
export type RemoveDuplicateLinesInput = z.infer<typeof schema>;
export interface RemoveDuplicateLinesOutput { result: string; removedCount: number }

function compute(input: RemoveDuplicateLinesInput): RemoveDuplicateLinesOutput {
  const lines = input.text.split("\n");
  const seen = new Set<string>();
  const output: string[] = [];
  for (const line of lines) {
    const processed = input.trimLines ? line.trim() : line;
    const key = input.caseSensitive ? processed : processed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(processed);
    }
  }
  return { result: output.join("\n"), removedCount: lines.length - output.length };
}

export const removeDuplicateLinesTool: ToolConfig<RemoveDuplicateLinesInput, RemoveDuplicateLinesOutput> = {
  id: "remove-duplicate-lines",
  slug: "remove-duplicate-lines",
  title: "Remove Duplicate Lines",
  shortDescription: "Remove duplicate lines from a list, keeping the first occurrence of each.",
  longDescription:
    "This tool scans your text line by line and removes duplicates, keeping only the first occurrence of each unique line — useful for cleaning email lists, log files, or any line-based data.",
  category: "text-tools",
  icon: "ListX",
  seo: {
    metaTitle: "Remove Duplicate Lines - Deduplicate Text Free",
    metaDescription: "Free tool to remove duplicate lines from text. Deduplicate lists instantly, case-sensitive or not.",
    keywords: ["remove duplicate lines", "deduplicate text", "remove duplicates online"],
  },
  inputSchema: schema,
  compute,
  component: RemoveDuplicateLines,
  faq: [{ question: "Does line order change?", answer: "No. The original order is preserved; only later duplicates of an already-seen line are removed." }],
  relatedToolSlugs: ["text-cleaner", "word-counter"],
  exampleInput: { text: "apple\nbanana\napple\ncherry\nBanana", caseSensitive: false, trimLines: true },
};
