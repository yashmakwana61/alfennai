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
    "The Regex Tester runs your regular expression against a test string using JavaScript's native regex engine, listing every match with its position and any captured groups — ideal for debugging patterns before using them in code.",
  category: "developer-tools",
  icon: "Regex",
  isFeatured: true,
  seo: {
    metaTitle: "Regex Tester - Test Regular Expressions Online Free",
    metaDescription: "Free online regex tester. Test JavaScript regular expressions against sample text with instant match highlighting.",
    keywords: ["regex tester", "regular expression tester", "regex online"],
  },
  inputSchema: schema,
  compute,
  component: RegexTester,
  faq: [{ question: "Which regex flavor does this use?", answer: "This uses JavaScript's native RegExp engine, the same one used in Node.js and browsers." }],
  relatedToolSlugs: ["json-formatter", "case-converter"],
  exampleInput: { pattern: "\\b\\w+@\\w+\\.\\w+\\b", flags: "gi", testString: "Contact us at hello@example.com or support@example.org" },
};
