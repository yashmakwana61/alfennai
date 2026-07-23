import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { HashGenerator } from "@/components/tools/HashGenerator";
import { sha256Hex } from "@/lib/utils/sha256";

const schema = z.object({ text: z.string().min(1, "Enter text to hash") });
export type HashGeneratorInput = z.infer<typeof schema>;
export interface HashGeneratorOutput { sha256: string }

function compute(input: HashGeneratorInput): HashGeneratorOutput {
  return { sha256: sha256Hex(input.text) };
}

export const hashGeneratorTool: ToolConfig<HashGeneratorInput, HashGeneratorOutput> = {
  id: "hash-generator",
  slug: "hash-generator",
  title: "Hash Generator",
  shortDescription: "Generate a SHA-256 cryptographic hash from any text, computed locally.",
  longDescription:
    "The Hash Generator computes a SHA-256 hash of your input text entirely in your browser using a pure JavaScript implementation, so your data never leaves your device.",
  category: "security-tools",
  icon: "Hash",
  seo: {
    metaTitle: "Hash Generator - SHA-256 Hash Online Free",
    metaDescription: "Free SHA-256 hash generator. Generate cryptographic hashes from text instantly, computed locally in your browser.",
    keywords: ["hash generator", "sha256 generator", "sha256 hash online"],
  },
  inputSchema: schema,
  compute,
  component: HashGenerator,
  faq: [{ question: "Can I reverse a hash back to the original text?", answer: "No. SHA-256 is a one-way function; hashes cannot be reversed, only compared against known values." }],
  relatedToolSlugs: ["password-generator", "uuid-generator"],
  exampleInput: { text: "AlfennAI" },
};
