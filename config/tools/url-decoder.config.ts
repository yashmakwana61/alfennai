import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { UrlDecoder } from "@/components/tools/UrlDecoder";

const schema = z.object({ encoded: z.string().min(1, "Enter a percent-encoded string") });
export type UrlDecoderInput = z.infer<typeof schema>;
export interface UrlDecoderOutput { decoded: string; error?: string }

function compute(input: UrlDecoderInput): UrlDecoderOutput {
  try {
    return { decoded: decodeURIComponent(input.encoded) };
  } catch {
    return { decoded: "", error: "Invalid percent-encoded string" };
  }
}

export const urlDecoderTool: ToolConfig<UrlDecoderInput, UrlDecoderOutput> = {
  id: "url-decoder",
  slug: "url-decoder",
  title: "URL Decoder",
  shortDescription: "Decode percent-encoded URLs and query strings back to plain text.",
  longDescription:
    "Percent-encoded URLs -- strings full of %20, %3A, %2F sequences -- are technically correct but hard for a human to read at a glance. This tool reverses that encoding using decodeURIComponent, turning a URL or query string back into its original, readable form.\n\nThis is useful when debugging a webhook payload, inspecting a redirect URL, or reading a log line where the URL was captured in its raw encoded form. Paste the encoded string and get back exactly what a browser would have sent before encoding.\n\nRuns entirely in your browser; nothing you paste is transmitted anywhere.",
  category: "developer-tools",
  icon: "Link2Off",
  seo: {
    metaTitle: "URL Decoder - Decode Percent-Encoded URLs Free",
    metaDescription: "Free URL decoder. Convert percent-encoded URLs and query strings back to plain text instantly.",
    keywords: ["url decoder", "percent decode", "uri decode", "decode url online", "decodeuricomponent"],
  },
  inputSchema: schema,
  compute,
  component: UrlDecoder,
  faq: [
    { question: "What happens with malformed input?", answer: "You'll see a clear error instead of a crash if the percent-encoding is malformed -- for example, an incomplete %-sequence at the end of the string." },
    { question: "Can I decode a full URL, not just a query string?", answer: "Yes -- decodeURIComponent works on any percent-encoded text, whether it's a full URL, just the query string, or a single parameter value." },
    { question: "Why does %20 turn into a space?", answer: "20 is the hexadecimal ASCII code for the space character, which isn't allowed unencoded in a URL -- this is the standard percent-encoding scheme (RFC 3986)." },
  ],
  relatedToolSlugs: ["url-encoder", "base64-decode"],
  exampleInput: { encoded: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world" },
};
