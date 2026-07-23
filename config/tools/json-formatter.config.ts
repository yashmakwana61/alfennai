import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { JsonFormatter } from "@/components/tools/JsonFormatter";

const jsonInputSchema = z.object({
  raw: z.string().min(1, "Enter some JSON to format"),
  indent: z.number().min(0).max(8).default(2),
});

export type JsonInput = z.infer<typeof jsonInputSchema>;

export interface JsonOutput {
  formatted: string;
  valid: boolean;
  error?: string;
}

function computeJson(input: JsonInput): JsonOutput {
  try {
    const parsed = JSON.parse(input.raw);
    return { formatted: JSON.stringify(parsed, null, input.indent), valid: true };
  } catch (err) {
    return {
      formatted: "",
      valid: false,
      error: err instanceof Error ? err.message : "Invalid JSON",
    };
  }
}

export const jsonFormatterTool: ToolConfig<JsonInput, JsonOutput> = {
  id: "json-formatter",
  slug: "json-formatter",
  title: "JSON Formatter",
  shortDescription: "Format, validate and beautify JSON instantly with syntax highlighting.",
  longDescription:
    "The JSON Formatter parses your raw JSON, validates its structure, and re-serializes it with consistent, readable indentation. If the JSON is malformed, it surfaces the exact parse error so you can find and fix the problem quickly.",
  category: "developer-tools",
  icon: "Braces",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "JSON Formatter & Validator - Free Online Tool",
    metaDescription:
      "Format, validate and beautify JSON online for free. Instant syntax error detection and customizable indentation.",
    keywords: ["json formatter", "json validator", "beautify json", "json pretty print"],
  },
  inputSchema: jsonInputSchema,
  compute: computeJson,
  component: JsonFormatter,
  faq: [
    {
      question: "Does this tool store or send my JSON anywhere?",
      answer: "No. Formatting happens entirely in your browser; your data never leaves your device.",
    },
    {
      question: "What happens if my JSON is invalid?",
      answer: "You'll see the exact parser error, including the position of the problem, so you can fix it fast.",
    },
  ],
  relatedToolSlugs: ["json-validator", "base64-encode"],
  exampleInput: { raw: '{"name":"AlfennAI","tools":37,"active":true}', indent: 2 },
};
