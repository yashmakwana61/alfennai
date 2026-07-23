import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { Base64Encode } from "@/components/tools/Base64Encode";

const schema = z.object({ raw: z.string().min(1, "Enter text to encode") });
export type Base64EncodeInput = z.infer<typeof schema>;
export interface Base64EncodeOutput { encoded: string }

function compute(input: Base64EncodeInput): Base64EncodeOutput {
  const bytes = new TextEncoder().encode(input.raw);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return { encoded: btoa(binary) };
}

export const base64EncodeTool: ToolConfig<Base64EncodeInput, Base64EncodeOutput> = {
  id: "base64-encode",
  slug: "base64-encode",
  title: "Base64 Encoder",
  shortDescription: "Encode text or strings into Base64 format instantly.",
  longDescription:
    "The Base64 Encoder converts plain text (including full Unicode) into Base64-encoded output, using UTF-8 byte encoding under the hood so special characters and emoji encode correctly.",
  category: "developer-tools",
  icon: "Lock",
  seo: {
    metaTitle: "Base64 Encoder - Encode Text to Base64 Free",
    metaDescription: "Free Base64 encoder. Convert any text to Base64 format instantly, supports full Unicode.",
    keywords: ["base64 encode", "base64 encoder", "text to base64"],
  },
  inputSchema: schema,
  compute,
  component: Base64Encode,
  faq: [{ question: "Is Base64 encryption?", answer: "No. Base64 is a reversible encoding, not encryption — anyone can decode it back to the original text." }],
  relatedToolSlugs: ["base64-decode", "url-encoder"],
  exampleInput: { raw: "Hello, AlfennAI!" },
};
