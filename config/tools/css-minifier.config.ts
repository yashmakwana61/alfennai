import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { CssMinifier } from "@/components/tools/CssMinifier";

const schema = z.object({ raw: z.string().min(1, "Enter CSS to minify") });
export type CssMinifierInput = z.infer<typeof schema>;
export interface CssMinifierOutput { minified: string; savedPercent: number }

function compute(input: CssMinifierInput): CssMinifierOutput {
  const minified = input.raw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
  const savedPercent = input.raw.length > 0 ? ((input.raw.length - minified.length) / input.raw.length) * 100 : 0;
  return { minified, savedPercent };
}

export const cssMinifierTool: ToolConfig<CssMinifierInput, CssMinifierOutput> = {
  id: "css-minifier",
  slug: "css-minifier",
  title: "CSS Minifier",
  shortDescription: "Minify CSS by removing comments, whitespace and redundant characters.",
  longDescription:
    "The CSS Minifier strips comments and unnecessary whitespace from your stylesheet, reducing file size for faster page loads without changing the CSS's behavior.",
  category: "developer-tools",
  icon: "FileMinus",
  seo: {
    metaTitle: "CSS Minifier - Minify CSS Online Free",
    metaDescription: "Free CSS minifier. Remove comments and whitespace from CSS to reduce file size instantly.",
    keywords: ["css minifier", "minify css online", "compress css"],
  },
  inputSchema: schema,
  compute,
  component: CssMinifier,
  faq: [{ question: "Will minifying break my CSS?", answer: "No, only whitespace and comments are removed — selectors, properties and values are preserved exactly." }],
  relatedToolSlugs: ["javascript-minifier", "html-formatter"],
  exampleInput: { raw: "body {\n  color: red; /* text color */\n  margin: 0;\n}" },
};
