import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { HtmlFormatter } from "@/components/tools/HtmlFormatter";

const schema = z.object({ raw: z.string().min(1, "Enter HTML to format") });
export type HtmlFormatterInput = z.infer<typeof schema>;
export interface HtmlFormatterOutput { formatted: string }

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function compute(input: HtmlFormatterInput): HtmlFormatterOutput {
  const tokens = input.raw
    .replace(/>\s*</g, "><")
    .replace(/</g, "\n<")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  let indent = 0;
  const lines: string[] = [];
  for (const token of tokens) {
    const isClosing = /^<\/\w/.test(token);
    const tagMatch = /^<([a-zA-Z0-9-]+)/.exec(token);
    const tagName = tagMatch?.[1]?.toLowerCase();
    const isSelfClosing = /\/>$/.test(token) || (tagName ? VOID_TAGS.has(tagName) : false);
    const isOpeningOnly = /^<[a-zA-Z]/.test(token) && !isClosing && !isSelfClosing && !token.includes(`</${tagName}>`);

    if (isClosing) indent = Math.max(indent - 1, 0);
    lines.push("  ".repeat(indent) + token);
    if (isOpeningOnly) indent += 1;
  }

  return { formatted: lines.join("\n") };
}

export const htmlFormatterTool: ToolConfig<HtmlFormatterInput, HtmlFormatterOutput> = {
  id: "html-formatter",
  slug: "html-formatter",
  title: "HTML Formatter",
  shortDescription: "Beautify minified or messy HTML with proper indentation.",
  longDescription:
    "The HTML Formatter re-indents HTML markup based on tag nesting, turning minified or inconsistently formatted HTML into a clean, readable structure.",
  category: "developer-tools",
  icon: "FileCode",
  seo: {
    metaTitle: "HTML Formatter - Beautify HTML Online Free",
    metaDescription: "Free HTML formatter and beautifier. Clean up messy or minified HTML with proper indentation instantly.",
    keywords: ["html formatter", "html beautifier", "format html online"],
  },
  inputSchema: schema,
  compute,
  component: HtmlFormatter,
  faq: [{ question: "Does this validate my HTML?", answer: "No, it only reformats indentation based on tag structure. Use a dedicated HTML validator to check for markup errors." }],
  relatedToolSlugs: ["css-minifier", "javascript-minifier"],
  exampleInput: { raw: "<div><p>Hello</p><span>World</span></div>" },
};
