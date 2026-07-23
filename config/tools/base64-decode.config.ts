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
    "The Base64 Decoder converts Base64-encoded strings back into their original text, correctly handling UTF-8 multi-byte characters.",
  category: "developer-tools",
  icon: "Unlock",
  seo: {
    metaTitle: "Base64 Decoder - Decode Base64 to Text Free",
    metaDescription: "Free Base64 decoder. Convert Base64 strings back to readable text instantly.",
    keywords: ["base64 decode", "base64 decoder", "base64 to text"],
  },
  inputSchema: schema,
  compute,
  component: Base64Decode,
  faq: [{ question: "What happens if the Base64 is invalid?", answer: "You'll see a clear error message instead of garbled output." }],
  relatedToolSlugs: ["base64-encode", "url-decoder"],
  exampleInput: { encoded: "SGVsbG8sIEFsZmVubkFJIQ==" },
};
