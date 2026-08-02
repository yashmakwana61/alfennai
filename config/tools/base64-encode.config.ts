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
    "Base64 encoding turns arbitrary binary or text data into a set of 64 safe, printable ASCII characters -- useful whenever data needs to travel through a system that only reliably handles plain text, like embedding an image in a data URI, including binary data in a JSON payload, or passing values through certain APIs and email formats that don't handle raw bytes well.\n\nThis encoder converts your input using UTF-8 byte encoding first, so full Unicode text -- accented characters, emoji, non-Latin scripts -- encodes and later decodes correctly, not just plain ASCII.\n\nEncoding happens instantly in your browser via the standard btoa() API; nothing you type is sent anywhere.",
  category: "developer-tools",
  icon: "Lock",
  seo: {
    metaTitle: "Base64 Encoder - Encode Text to Base64 Free",
    metaDescription: "Free Base64 encoder. Convert any text to Base64 format instantly, supports full Unicode.",
    keywords: ["base64 encode", "base64 encoder", "text to base64", "base64 converter online", "encode string base64"],
  },
  inputSchema: schema,
  compute,
  component: Base64Encode,
  faq: [
    { question: "Is Base64 encryption?", answer: "No. Base64 is a reversible encoding, not encryption -- anyone can decode it back to the original text. Don't use it to protect sensitive data." },
    { question: "Why does Base64 output look longer than my input?", answer: "Base64 encodes every 3 bytes of input as 4 characters of output, so the encoded result is roughly 33% larger than the original." },
    { question: "Does this handle emoji and non-English text correctly?", answer: "Yes -- the input is UTF-8 encoded to bytes before Base64 encoding, so emoji and any Unicode text round-trip correctly when decoded." },
    { question: "Where is Base64 commonly used?", answer: "Embedding images as data URIs in HTML/CSS, encoding binary attachments in email (MIME), API authentication headers (Basic Auth), and passing binary data through text-only fields." },
  ],
  relatedToolSlugs: ["base64-decode", "url-encoder"],
  exampleInput: { raw: "Hello, AlfennAI!" },
};
