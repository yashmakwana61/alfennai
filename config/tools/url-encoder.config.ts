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
    "URLs can only safely contain a limited set of characters -- spaces, ampersands, question marks and many others have special meaning or aren't allowed raw, which is why they need percent-encoding (e.g. a space becomes %20) before being placed in a query string or link. Get this wrong and a URL parameter can silently truncate, merge with another parameter, or break entirely.\n\nThis tool encodes using encodeURIComponent, the correct choice for encoding individual values that will be placed inside a URL -- as opposed to encoding an entire URL at once, which needs different handling since it must preserve characters like : and / that are structurally meaningful.\n\nWorks with full Unicode text too, so non-English characters, emoji, and special symbols all encode correctly for safe transmission in any URL.",
  category: "developer-tools",
  icon: "Link",
  seo: {
    metaTitle: "URL Encoder - Percent Encode URLs Free",
    metaDescription: "Free URL encoder. Percent-encode text and URLs for safe use in query strings and links.",
    keywords: ["url encoder", "percent encoding", "uri encode", "url encode online", "encodeuricomponent"],
  },
  inputSchema: schema,
  compute,
  component: UrlEncoder,
  faq: [
    { question: "What's the difference from encodeURI?", answer: "This uses encodeURIComponent, which also escapes characters like &, = and ? -- correct for encoding individual query parameter values rather than a full URL, where those characters are structurally meaningful." },
    { question: "Why do spaces become %20?", answer: "Spaces aren't valid in URLs, so they're percent-encoded as their ASCII hex value (20 in hex = 32 decimal, the space character's code point)." },
    { question: "Do I need to encode an entire URL, or just parts of it?", answer: "Usually just the values going into query parameters, not the whole URL -- encoding the full URL would also escape the protocol separators and slashes that need to stay intact." },
    { question: "Does this work for non-English text?", answer: "Yes -- any Unicode character gets correctly percent-encoded as its UTF-8 byte sequence." },
  ],
  relatedToolSlugs: ["url-decoder", "base64-encode"],
  exampleInput: { raw: "https://example.com/search?q=hello world" },
};
