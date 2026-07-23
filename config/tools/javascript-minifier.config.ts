import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { JavascriptMinifier } from "@/components/tools/JavascriptMinifier";

const schema = z.object({ raw: z.string().min(1, "Enter JavaScript to minify") });
export type JavascriptMinifierInput = z.infer<typeof schema>;
export interface JavascriptMinifierOutput { minified: string; savedPercent: number }

function compute(input: JavascriptMinifierInput): JavascriptMinifierOutput {
  // Basic minification: strips // and /* */ comments (outside strings) and collapses whitespace.
  // Not a full AST-based minifier — for production bundles use a proper tool like esbuild/terser.
  let result = "";
  let i = 0;
  const src = input.raw;
  while (i < src.length) {
    const two = src.slice(i, i + 2);
    if (two === "//") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (two === "/*") {
      i += 2;
      while (i < src.length && src.slice(i, i + 2) !== "*/") i++;
      i += 2;
      continue;
    }
    if (src[i] === '"' || src[i] === "'" || src[i] === "`") {
      const quote = src[i];
      result += src[i];
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") { result += src[i]; i++; }
        result += src[i];
        i++;
      }
      result += src[i] ?? "";
      i++;
      continue;
    }
    result += src[i];
    i++;
  }
  const minified = result
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]+/g, " ");
  const savedPercent = input.raw.length > 0 ? ((input.raw.length - minified.length) / input.raw.length) * 100 : 0;
  return { minified, savedPercent };
}

export const javascriptMinifierTool: ToolConfig<JavascriptMinifierInput, JavascriptMinifierOutput> = {
  id: "javascript-minifier",
  slug: "javascript-minifier",
  title: "JavaScript Minifier",
  shortDescription: "Strip comments and extra whitespace from JavaScript code.",
  longDescription:
    "The JavaScript Minifier removes comments and collapses extraneous whitespace while preserving string and template-literal contents. It's a lightweight, browser-based minifier for quick size reduction — for production builds, a full AST-based minifier like Terser or esbuild is recommended.",
  category: "developer-tools",
  icon: "FileCode2",
  seo: {
    metaTitle: "JavaScript Minifier - Minify JS Online Free",
    metaDescription: "Free JavaScript minifier. Strip comments and whitespace from JS code instantly in your browser.",
    keywords: ["javascript minifier", "js minifier online", "compress javascript"],
  },
  inputSchema: schema,
  compute,
  component: JavascriptMinifier,
  faq: [{ question: "Is this safe for production bundles?", answer: "This does light, safe whitespace/comment stripping. For production, use a proper AST-based minifier such as Terser or esbuild for maximum compression and correctness guarantees." }],
  relatedToolSlugs: ["css-minifier", "html-formatter"],
  exampleInput: { raw: "function add(a, b) {\n  // adds two numbers\n  return a + b;\n}" },
};
