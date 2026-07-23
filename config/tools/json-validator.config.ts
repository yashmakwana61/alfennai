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
  longDescription:
    "The JSON Validator checks whether your JSON is syntactically correct and, if not, reports the parser error and approximate line number so you can fix it quickly, without reformatting the document.",
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
  faq: [{ question: "Does this fix invalid JSON automatically?", answer: "No, it only validates and locates errors. Use the JSON Formatter to reformat valid JSON." }],
  relatedToolSlugs: ["json-formatter", "base64-encode"],
  exampleInput: { raw: '{"valid": true}' },
};
