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
    case "title": return { converted: w.map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(" ") };
    case "sentence": {
      const lower = input.text.toLowerCase();
      return { converted: lower.charAt(0).toUpperCase() + lower.slice(1) };
    }
    case "camel": return { converted: w.map((x, i) => (i === 0 ? x.toLowerCase() : x[0].toUpperCase() + x.slice(1).toLowerCase())).join("") };
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
    "The Case Converter transforms any text into UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case or kebab-case — useful for coding conventions and formatting headlines.",
  category: "text-tools",
  icon: "CaseSensitive",
  isFeatured: true,
  seo: {
    metaTitle: "Case Converter - Text Case Converter Online Free",
    metaDescription: "Free case converter. Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case and more.",
    keywords: ["case converter", "text case converter", "camelcase converter"],
  },
  inputSchema: schema,
  compute,
  component: CaseConverter,
  faq: [{ question: "Does it work with multiple sentences?", answer: "Yes, though camelCase/snake_case/kebab-case are typically intended for single identifiers rather than full sentences." }],
  relatedToolSlugs: ["word-counter", "slug-generator"],
  exampleInput: { text: "Hello AlfennAI World", targetCase: "camel" },
};
