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
  intro: [
    "Paste minified or messy JSON to get clean, consistently indented output — nested objects and arrays become readable at a glance.",
    "Choose 2-space or 4-space indentation for reading and debugging, or minified output for shipping smaller payloads. Invalid JSON returns the exact parser error instead of formatted output.",
  ],
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
      question: "What is JSON formatting?",
      answer: "JSON formatting (pretty-printing) re-serializes compact JSON with consistent indentation and line breaks, so nested objects, arrays, strings and numbers are easy to scan when debugging APIs or configs.",
    },
    {
      question: "Does this tool store or send my JSON anywhere?",
      answer: "No. Formatting happens entirely in your browser with the native JSON parser; your data never leaves your device, so real API responses are safe to paste.",
    },
    {
      question: "What happens if my JSON is invalid?",
      answer: "You'll see the exact parser error, including the position of the problem, so you can fix it fast — for example a trailing comma reports the position where the parser expected the next value.",
    },
    {
      question: "Can I minify JSON instead of formatting it?",
      answer: "Yes -- set indent to 0 (\"Minified\" option) to collapse the JSON to a single compact line, useful for reducing payload size before sending over a network.",
    },
    {
      question: "Can I format nested JSON?",
      answer: "Yes — objects and arrays nested to any depth are indented level by level, which is exactly where manual reading of minified payloads breaks down.",
    },
    {
      question: "What's the difference between formatting and validating?",
      answer: "Formatting re-serializes valid JSON with consistent indentation. Validating just checks whether the syntax is correct without changing anything -- use the dedicated JSON Validator if you only need a yes/no check.",
    },
  ],
  relatedToolSlugs: ["json-validator", "base64-encode"],
  contentSections: [
    {
      heading: "Worked example",
      paragraphs: [
        "Formatting {“name”:“AlfennAI”,“tools”:37,“active”:true} with 2-space indentation produces each key on its own line, nested two spaces in; with the minified option the same document collapses to a single compact line for transport.",
        "Formatting is not validation: if the input cannot be parsed, nothing is reformatted — run it through the [JSON validator](/tools/developer-tools/json-validator) to pinpoint the syntax error first.",
      ],
    },
    {
      heading: "Formatted versus minified",
      paragraphs: [
        "Use formatted output (2 or 4 spaces, up to 8) when a human needs to read or diff the document. Use minified output (indent 0) when a machine consumes it and every byte counts, such as API request bodies or embedded configs.",
      ],
    },
    {
      heading: "Privacy",
      paragraphs: [
        "Everything runs locally with the browser's native JSON.parse and JSON.stringify. Nothing pasted here is sent to a server, stored, or logged — but avoid pasting live secrets or credentials into any web tool as a general habit.",
      ],
    },
  ],
  exampleInput: { raw: '{"name":"AlfennAI","tools":37,"active":true}', indent: 2 },
};
