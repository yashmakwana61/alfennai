import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { UrlEncoder } from "@/components/tools/UrlEncoder";

const schema = z.object({ raw: z.string().min(1, "Enter text or a URL to encode") });
export type UrlEncoderInput = z.infer<typeof schema>;
export interface UrlEncoderOutput { encoded: string }

function compute(input: UrlEncoderInput): UrlEncoderOutput {
  return { encoded: encodeURIComponent(input.raw) };
}

export const urlEncoderTool: ToolConfig<UrlEncoderInput, UrlEncoderOutput> = {
  id: "url-encoder",
  slug: "url-encoder",
  title: "URL Encoder",
  shortDescription: "Percent-encode text and URLs for safe use in query strings and links.",
  longDescription:
    "The URL Encoder converts special characters, spaces and Unicode text into percent-encoded form (application/x-www-form-urlencoded style via encodeURIComponent), so the result is safe to embed in a URL query string.",
  category: "developer-tools",
  icon: "Link",
  seo: {
    metaTitle: "URL Encoder - Percent Encode URLs Free",
    metaDescription: "Free URL encoder. Percent-encode text and URLs for safe use in query strings and links.",
    keywords: ["url encoder", "percent encoding", "uri encode"],
  },
  inputSchema: schema,
  compute,
  component: UrlEncoder,
  faq: [{ question: "What's the difference from encodeURI?", answer: "This uses encodeURIComponent, which also escapes characters like &, = and ? — correct for encoding individual query parameter values rather than a full URL." }],
  relatedToolSlugs: ["url-decoder", "base64-encode"],
  exampleInput: { raw: "https://example.com/search?q=hello world" },
};
