import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { JwtDecoder } from "@/components/tools/JwtDecoder";

const schema = z.object({ token: z.string().min(1, "Paste a JWT to decode") });
export type JwtDecoderInput = z.infer<typeof schema>;
export interface JwtDecoderOutput { header: string; payload: string; error?: string }

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function compute(input: JwtDecoderInput): JwtDecoderOutput {
  const parts = input.token.trim().split(".");
  if (parts.length < 2) return { header: "", payload: "", error: "Not a valid JWT (expected header.payload.signature)" };
  try {
    const header = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    const payload = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
    return { header, payload };
  } catch {
    return { header: "", payload: "", error: "Could not decode token — check it's a valid JWT" };
  }
}

export const jwtDecoderTool: ToolConfig<JwtDecoderInput, JwtDecoderOutput> = {
  id: "jwt-decoder",
  slug: "jwt-decoder",
  title: "JWT Decoder",
  shortDescription: "Decode a JWT's header and payload without verifying the signature.",
  longDescription:
    "The JWT Decoder splits a JSON Web Token into its header and payload segments, Base64URL-decodes them, and pretty-prints the resulting JSON. It does not verify the signature — use this only for inspecting token contents.",
  category: "developer-tools",
  icon: "FileKey",
  isFeatured: true,
  seo: {
    metaTitle: "JWT Decoder - Decode JSON Web Tokens Free",
    metaDescription: "Free JWT decoder. Decode a JSON Web Token's header and payload instantly in your browser.",
    keywords: ["jwt decoder", "decode jwt", "json web token decoder"],
  },
  inputSchema: schema,
  compute,
  component: JwtDecoder,
  faq: [{ question: "Does this verify the token's signature?", answer: "No. This only decodes the header and payload for inspection. Signature verification requires the secret or public key and isn't performed here." }],
  relatedToolSlugs: ["jwt-encoder", "base64-decode"],
  exampleInput: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U" },
};
