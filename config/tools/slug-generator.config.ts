import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { SlugGenerator } from "@/components/tools/SlugGenerator";

const schema = z.object({ text: z.string().min(1, "Enter text to slugify"), separator: z.enum(["-", "_"]) });
export type SlugGeneratorInput = z.infer<typeof schema>;
export interface SlugGeneratorOutput { slug: string }

function compute(input: SlugGeneratorInput): SlugGeneratorOutput {
  const slug = input.text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/[\s_-]+/g, input.separator)
    .replace(new RegExp(`^\\${input.separator}+|\\${input.separator}+$`, "g"), "");
  return { slug };
}

export const slugGeneratorTool: ToolConfig<SlugGeneratorInput, SlugGeneratorOutput> = {
  id: "slug-generator",
  slug: "slug-generator",
  title: "Slug Generator",
  shortDescription: "Convert any text into a clean, URL-safe slug.",
  longDescription:
    "The Slug Generator converts titles or phrases into clean, lowercase, URL-safe slugs — stripping accents and special characters and joining words with your chosen separator, ideal for blog post URLs and file names.",
  category: "generators",
  icon: "Link",
  seo: {
    metaTitle: "Slug Generator - Create URL Slugs Online Free",
    metaDescription: "Free slug generator. Convert any text into a clean, URL-safe slug instantly.",
    keywords: ["slug generator", "url slug", "seo friendly url generator"],
  },
  inputSchema: schema,
  compute,
  component: SlugGenerator,
  faq: [{ question: "Does it handle accented characters?", answer: "Yes, accented characters (like é, ñ, ü) are normalized to their closest plain ASCII equivalent." }],
  relatedToolSlugs: ["case-converter", "url-encoder"],
  exampleInput: { text: "10 Best Online Tools for 2026!", separator: "-" },
};
