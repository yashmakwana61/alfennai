import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { Base64Decode } from "@/components/tools/Base64Decode";

const schema = z.object({ encoded: z.string().min(1, "Enter Base64 to decode") });
export type Base64DecodeInput = z.infer<typeof schema>;
export interface Base64DecodeOutput { decoded: string; error?: string }

function compute(input: Base64DecodeInput): Base64DecodeOutput {
  try {
    const binary = atob(input.encoded.trim());
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { decoded: new TextDecoder().decode(bytes) };
  } catch {
    return { decoded: "", error: "Invalid Base64 string" };
  }
}

export const base64DecodeTool: ToolConfig<Base64DecodeInput, Base64DecodeOutput> = {
  id: "base64-decode",
  slug: "base64-decode",
  title: "Base64 Decoder",
  shortDescription: "Decode Base64 strings back into readable text instantly.",
  longDescription:
    "If you've received or found a Base64-encoded string -- from an API response, a config file, a JWT segment, or an email attachment header -- this tool converts it straight back to readable text. Base64 decoding reverses the encoding process exactly: every 4 characters of Base64 map back to 3 bytes of original data.\n\nThis decoder handles UTF-8 multi-byte characters correctly, so if the original text included accented characters, emoji, or non-Latin scripts, they come back intact rather than as garbled symbols -- a common failure mode in simpler decoders that only handle plain ASCII.\n\nDecoding runs entirely in your browser via the standard atob() API; your input never leaves your device.",
  category: "developer-tools",
  icon: "Unlock",
  seo: {
    metaTitle: "Base64 Decoder - Decode Base64 to Text Free",
    metaDescription: "Free Base64 decoder. Convert Base64 strings back to readable text instantly.",
    keywords: ["base64 decode", "base64 decoder", "base64 to text", "decode base64 online", "base64 to string"],
  },
  inputSchema: schema,
  compute,
  component: Base64Decode,
  faq: [
    { question: "What happens if the Base64 is invalid?", answer: "You'll see a clear error message instead of garbled output, so you know immediately the input wasn't valid Base64 rather than getting confusing partial results." },
    { question: "Why do I get strange characters after decoding?", answer: "This usually means the original data wasn't UTF-8 text (it might be binary data like an image), or the Base64 string was truncated/corrupted before you pasted it." },
    { question: "Can I decode a JWT with this?", answer: "You can decode individual segments of a JWT (which are Base64URL, a close variant), but for full JWT decoding including header and payload together, use the dedicated JWT Decoder tool instead." },
    { question: "Does whitespace in the input cause errors?", answer: "No -- the decoder trims surrounding whitespace automatically before decoding." },
  ],
  relatedToolSlugs: ["base64-encode", "url-decoder"],
  exampleInput: { encoded: "SGVsbG8sIEFsZmVubkFJIQ==" },
};
