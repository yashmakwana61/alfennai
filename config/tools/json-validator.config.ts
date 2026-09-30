import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { JsonValidator } from "@/components/tools/JsonValidator";

const schema = z.object({ raw: z.string().min(1, "Enter JSON to validate") });
export type JsonValidatorInput = z.infer<typeof schema>;
export interface JsonValidatorOutput {
  valid: boolean;
  error?: string;
  errorLine?: number;
  keyCount?: number;
}

function compute(input: JsonValidatorInput): JsonValidatorOutput {
  try {
    const parsed = JSON.parse(input.raw);
    const keyCount = typeof parsed === "object" && parsed !== null ? Object.keys(parsed).length : 0;
    return { valid: true, keyCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    const match = /position (\d+)/.exec(message);
    let errorLine: number | undefined;
    if (match) {
      const pos = Number(match[1]);
      errorLine = input.raw.slice(0, pos).split("\n").length;
    }
    return { valid: false, error: message, errorLine };
  }
}

export const jsonValidatorTool: ToolConfig<JsonValidatorInput, JsonValidatorOutput> = {
  id: "json-validator",
  slug: "json-validator",
  title: "JSON Validator",
  shortDescription: "Validate JSON syntax and pinpoint exactly where errors occur.",
  intro: [
    "Paste any JSON document to get an instant verdict: valid (with a top-level key count) or invalid with the parser's error message and the approximate line number.",
    "It checks syntax only — it never reformats your document and never sends it anywhere.",
  ],
  longDescription:
    "The JSON Validator checks whether your JSON is syntactically correct using the browser's native JSON parser — the same strict parser your code uses, so its verdict matches what your application will accept. If the document is valid, you get confirmation plus a count of top-level keys as a quick structural sanity check. If it is invalid, you get the parser's exact error message with the character position converted to an approximate line number, pointing at the missing comma, trailing comma, wrong quote style or unmatched bracket. Your document is never reformatted or modified; validation is a read-only verdict, and everything runs locally in your browser.",
  category: "developer-tools",
  icon: "CheckCircle2",
  seo: {
    metaTitle: "JSON Validator - Validate JSON Syntax Online Free",
    metaDescription: "Free online JSON validator. Instantly check JSON syntax and locate errors by line.",
    keywords: ["json validator", "validate json", "json syntax checker"],
  },
  inputSchema: schema,
  compute,
  component: JsonValidator,
  faq: [
    { question: "What makes JSON invalid?", answer: "Anything that breaks strict JSON syntax: missing commas between members, trailing commas after the last member, single quotes instead of double quotes, unmatched braces or brackets, or bare values like undefined that JSON does not allow." },
    { question: "Why does JSON require double quotes?", answer: "The JSON specification only recognizes double-quoted strings — single-quoted keys or values are a JavaScript habit, not valid JSON, so {‘a’:1} fails while {“a”:1} passes." },
    { question: "Are trailing commas allowed?", answer: "No. A comma after the last member (for example {“a”:1,}) is invalid JSON and is one of the most common errors this validator catches, reporting the exact position." },
    { question: "What is the difference between JSON validation and formatting?", answer: "Validation answers yes-or-no and locates errors without touching your document. Formatting re-serializes valid JSON with indentation — use the JSON Formatter once the validator says the document is valid." },
    { question: "Does this fix invalid JSON automatically?", answer: "No, it only validates and locates errors. Use the JSON Formatter to reformat valid JSON." },
    { question: "Is the JSON processed locally?", answer: "Yes. Validation runs entirely in your browser with the native JSON parser; nothing is uploaded, stored or logged." },
  ],
  relatedToolSlugs: ["json-formatter", "base64-encode"],
  contentSections: [
    {
      heading: "Worked examples",
      paragraphs: [
        "Valid input {“valid”: true} passes with 1 top-level key. Invalid input {“a”:1,} (note the trailing comma) fails, and the validator reports the parser error with its character position plus the approximate line number — line 1 here.",
        "Once the document validates, paste it into the [JSON formatter](/tools/developer-tools/json-formatter) for readable indented or minified output.",
      ],
    },
    {
      heading: "Common problems this catches",
      list: [
        "Missing commas between object members or array items",
        "Trailing commas after the last member",
        "Single quotes around keys or strings",
        "Unmatched braces or brackets",
        "Bare or misspelled values (undefined, True, NaN) that strict JSON rejects",
      ],
    },
    {
      heading: "What this validator does not do",
      list: [
        "It does not perform JSON Schema validation — it checks syntax, not whether the document matches a schema or API contract.",
        "It does not auto-fix errors or reformat the document.",
        "It does not send anything anywhere: validation is browser-local, but keep live secrets out of web tools as a general habit.",
      ],
    },
  ],
  exampleInput: { raw: '{"valid": true}' },
};
