import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { JwtEncoder } from "@/components/tools/JwtEncoder";
import { hmacSha256, bytesToBase64Url } from "@/lib/utils/sha256";

const schema = z.object({
  payload: z.string().min(1, "Enter a JSON payload"),
  secret: z.string().min(1, "Enter a signing secret"),
});
export type JwtEncoderInput = z.infer<typeof schema>;
export interface JwtEncoderOutput { token: string; error?: string }

function compute(input: JwtEncoderInput): JwtEncoderOutput {
  let payloadObj: unknown;
  try {
    payloadObj = JSON.parse(input.payload);
  } catch {
    return { token: "", error: "Payload must be valid JSON" };
  }
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();
  const headerB64 = bytesToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = bytesToBase64Url(enc.encode(JSON.stringify(payloadObj)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = hmacSha256(enc.encode(input.secret), enc.encode(signingInput));
  const token = `${signingInput}.${bytesToBase64Url(signature)}`;
  return { token };
}

export const jwtEncoderTool: ToolConfig<JwtEncoderInput, JwtEncoderOutput> = {
  id: "jwt-encoder",
  slug: "jwt-encoder",
  title: "JWT Encoder",
  shortDescription: "Create a signed HS256 JSON Web Token from a payload and secret.",
  longDescription:
    "The JWT Encoder builds a complete HS256-signed JSON Web Token from your JSON payload and a secret key, computing the signature entirely in your browser — the secret never leaves your device.",
  category: "developer-tools",
  icon: "FileSignature",
  seo: {
    metaTitle: "JWT Encoder - Create Signed JSON Web Tokens Free",
    metaDescription: "Free JWT encoder. Generate a signed HS256 JSON Web Token from any payload and secret, entirely in your browser.",
    keywords: ["jwt encoder", "jwt generator", "sign jwt hs256"],
  },
  inputSchema: schema,
  compute,
  component: JwtEncoder,
  faq: [{ question: "Is my secret sent anywhere?", answer: "No. The HMAC-SHA256 signature is computed entirely client-side in your browser; nothing is sent to a server." }],
  relatedToolSlugs: ["jwt-decoder", "hash-generator"],
  exampleInput: { payload: '{"sub":"1234567890","name":"John Doe"}', secret: "your-256-bit-secret" },
};
