import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { CaseConverter } from "@/components/tools/CaseConverter";

const schema = z.object({
  text: z.string().min(1, "Enter text to convert"),
  targetCase: z.enum(["upper", "lower", "title", "sentence", "camel", "snake", "kebab"]),
});
export type CaseConverterInput = z.infer<typeof schema>;
export interface CaseConverterOutput { converted: string }

function words(text: string): string[] {
  return text.trim().split(/[\s_-]+|(?<=[a-z0-9])(?=[A-Z])/).filter(Boolean);
}

function compute(input: CaseConverterInput): CaseConverterOutput {
  const w = words(input.text);
  switch (input.targetCase) {
    case "upper": return { converted: input.text.toUpperCase() };
    case "lower": return { converted: input.text.toLowerCase() };
    case "title": return { converted: w.map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(" ") };
    case "sentence": {
      const lower = input.text.toLowerCase();
      return { converted: lower.charAt(0).toUpperCase() + lower.slice(1) };
    }
    case "camel": return { converted: w.map((x, i) => (i === 0 ? x.toLowerCase() : x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())).join("") };
    case "snake": return { converted: w.map((x) => x.toLowerCase()).join("_") };
    case "kebab": return { converted: w.map((x) => x.toLowerCase()).join("-") };
  }
}

export const caseConverterTool: ToolConfig<CaseConverterInput, CaseConverterOutput> = {
  id: "case-converter",
  slug: "case-converter",
  title: "Case Converter",
  shortDescription: "Convert text between UPPERCASE, lowercase, Title Case, camelCase and more.",
  longDescription:
    "Different contexts expect different text casing conventions, and manually retyping text to match is tedious and error-prone. This converter handles the seven most common cases in one place: UPPERCASE and lowercase for basic formatting, Title Case and Sentence case for headlines and prose, and camelCase, snake_case and kebab-case for programming identifiers, variable names, and URL slugs.\n\nThe converter is word-boundary aware -- it detects word breaks from spaces, hyphens, underscores, and camelCase transitions, so converting camelCase to snake_case (or vice versa) works correctly rather than just blindly changing letter case.\n\nPaste your text, pick a target case, and get the converted result instantly, ready to copy.",
  category: "text-tools",
  icon: "CaseSensitive",
  isFeatured: true,
  seo: {
    metaTitle: "Case Converter - Text Case Converter Online Free",
    metaDescription: "Free case converter. Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case and more.",
    keywords: ["case converter", "text case converter", "camelcase converter", "snake case converter", "title case generator"],
  },
  inputSchema: schema,
  compute,
  component: CaseConverter,
  faq: [
    { question: "Does it work with multiple sentences?", answer: "Yes, though camelCase/snake_case/kebab-case are typically intended for single identifiers rather than full sentences -- converting a whole paragraph to camelCase, for example, produces a valid but unusual result." },
    { question: "What's the difference between Title Case and Sentence case?", answer: "Title Case capitalizes the first letter of every word (\"Hello World Today\"). Sentence case capitalizes only the first letter of the whole text (\"Hello world today\")." },
    { question: "Can I convert camelCase back to snake_case?", answer: "Yes -- the converter detects word boundaries within camelCase (where a lowercase letter is followed by an uppercase one) as well as spaces, hyphens and underscores, so it converts correctly between any of the seven supported cases." },
    { question: "Why would I need kebab-case?", answer: "kebab-case (words-separated-by-hyphens) is the standard convention for URL slugs and many CSS class names / HTML attributes." },
  ],
  relatedToolSlugs: ["word-counter", "slug-generator"],
  exampleInput: { text: "Hello AlfennAI World", targetCase: "camel" },
};
