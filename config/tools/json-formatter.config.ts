import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { JsonFormatter } from "@/components/tools/JsonFormatter";

const jsonInputSchema = z.object({
  raw: z.string().min(1, "Enter some JSON to format"),
  indent: z.number().min(0).max(8),
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
    "Malformed JSON is one of the most common causes of broken API integrations, and the error messages browsers and languages give you are often unhelpful -- a vague \"unexpected token\" with no context. This formatter parses your raw JSON, and if it's valid, re-serializes it with clean, consistent indentation so nested objects and arrays are actually readable.\n\nIf the JSON is invalid, you get the exact parser error rather than a guess, so you can find the missing comma or unclosed bracket quickly. Choose 2-space, 4-space, or fully minified output depending on whether you're reading the JSON yourself or shipping it over the wire.\n\nEverything runs in your browser using the native JSON.parse/stringify, so nothing you paste in is ever sent to a server -- safe to use even with real API responses or config files you'd rather not upload anywhere.",
  category: "developer-tools",
  icon: "Braces",
  isFeatured: true,
  isTrending: true,
  seo: {
    metaTitle: "JSON Formatter & Validator - Free Online Tool",
    metaDescription:
      "Format, validate and beautify JSON online for free. Instant syntax error detection and customizable indentation.",
    keywords: ["json formatter", "json validator", "beautify json", "json pretty print", "json formatter online", "minify json"],
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
    {
      question: "Can I minify JSON instead of formatting it?",
      answer: "Yes -- set indent to 0 (\"Minified\" option) to collapse the JSON to a single compact line, useful for reducing payload size before sending over a network.",
    },
    {
      question: "What's the difference between formatting and validating?",
      answer: "Formatting re-serializes valid JSON with consistent indentation. Validating just checks whether the syntax is correct without changing anything -- use the dedicated JSON Validator if you only need a yes/no check.",
    },
  ],
  relatedToolSlugs: ["json-validator", "base64-encode"],
  exampleInput: { raw: '{"name":"AlfennAI","tools":37,"active":true}', indent: 2 },
};
