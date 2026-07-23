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
    "The URL Decoder converts percent-encoded (URL-encoded) text back into its original, readable form using decodeURIComponent.",
  category: "developer-tools",
  icon: "Link2Off",
  seo: {
    metaTitle: "URL Decoder - Decode Percent-Encoded URLs Free",
    metaDescription: "Free URL decoder. Convert percent-encoded URLs and query strings back to plain text instantly.",
    keywords: ["url decoder", "percent decode", "uri decode"],
  },
  inputSchema: schema,
  compute,
  component: UrlDecoder,
  faq: [{ question: "What happens with malformed input?", answer: "You'll see a clear error instead of a crash if the percent-encoding is malformed." }],
  relatedToolSlugs: ["url-encoder", "base64-decode"],
  exampleInput: { encoded: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world" },
};
