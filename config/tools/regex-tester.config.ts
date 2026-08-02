import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { RegexTester } from "@/components/tools/RegexTester";

const schema = z.object({
  pattern: z.string().min(1, "Enter a regular expression"),
  flags: z.string(),
  testString: z.string(),
});
export type RegexTesterInput = z.infer<typeof schema>;
export interface RegexMatch { match: string; index: number; groups: string[] }
export interface RegexTesterOutput { matches: RegexMatch[]; error?: string }

function compute(input: RegexTesterInput): RegexTesterOutput {
  try {
    const re = new RegExp(input.pattern, input.flags.includes("g") ? input.flags : input.flags + "g");
    const matches: RegexMatch[] = [];
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(input.testString)) !== null && guard < 1000) {
      matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      if (m[0] === "") re.lastIndex++;
      guard++;
    }
    return { matches };
  } catch (err) {
    return { matches: [], error: err instanceof Error ? err.message : "Invalid regular expression" };
  }
}

export const regexTesterTool: ToolConfig<RegexTesterInput, RegexTesterOutput> = {
  id: "regex-tester",
  slug: "regex-tester",
  title: "Regex Tester",
  shortDescription: "Test regular expressions against sample text and see every match highlighted.",
  longDescription:
    "Regular expressions are powerful but notoriously hard to get right on the first try -- a pattern that looks correct can silently match too much, too little, or nothing at all. This tester runs your pattern against real sample text using JavaScript's native regex engine (the same one in Node.js and every browser), so what works here works identically in your actual code.\n\nEvery match is listed with its exact position in the string and any captured groups, so you can immediately see whether your pattern is behaving as intended -- including edge cases like overlapping or zero-length matches.\n\nSupports all standard JavaScript regex flags (g, i, m, s, u, y). Nothing you enter is sent anywhere; matching happens instantly in your browser as you type.",
  category: "developer-tools",
  icon: "Regex",
  isFeatured: true,
  seo: {
    metaTitle: "Regex Tester - Test Regular Expressions Online Free",
    metaDescription: "Free online regex tester. Test JavaScript regular expressions against sample text with instant match highlighting.",
    keywords: ["regex tester", "regular expression tester", "regex online", "javascript regex tester", "test regex pattern"],
  },
  inputSchema: schema,
  compute,
  component: RegexTester,
  faq: [
    { question: "Which regex flavor does this use?", answer: "This uses JavaScript's native RegExp engine, the same one used in Node.js and browsers -- so patterns tested here behave identically when used in actual JS/TS code." },
    { question: "What do the flags (g, i, m, s) mean?", answer: "g = global (find all matches, not just the first), i = case-insensitive, m = multiline (^ and $ match line boundaries), s = dotall (. matches newlines too)." },
    { question: "Why does my pattern match zero times when I expect matches?", answer: "Common causes: forgetting to escape special characters (. * + ? need \\\\ before them to match literally), or an anchor (^ or $) that doesn't align with where you expect it to given your flags." },
    { question: "What are capture groups used for?", answer: "Parentheses in a pattern create a capture group, letting you extract a specific sub-part of each match -- shown separately in the results here so you can verify your groups are capturing what you intend." },
  ],
  relatedToolSlugs: ["json-formatter", "case-converter"],
  exampleInput: { pattern: "\\b\\w+@\\w+\\.\\w+\\b", flags: "gi", testString: "Contact us at hello@example.com or support@example.org" },
};
