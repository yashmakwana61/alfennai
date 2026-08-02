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
    "Hashing turns any input into a fixed-length string of characters, and the same input always produces the same hash -- but you can't reverse a hash back to the original text. That one-way property is what makes hashing useful: verifying file integrity (comparing a downloaded file's hash against a published one), storing password verification data without storing the password itself, or generating a consistent short identifier for a piece of content.\n\nThis tool computes SHA-256, the most widely used general-purpose hash function today, using a pure JavaScript implementation that runs entirely in your browser -- your input text is never sent to a server, which matters if you're hashing anything sensitive.\n\nPaste any text and get the 64-character hexadecimal SHA-256 digest instantly, ready to copy and compare or store.",
  category: "security-tools",
  icon: "Hash",
  seo: {
    metaTitle: "Hash Generator - SHA-256 Hash Online Free",
    metaDescription: "Free SHA-256 hash generator. Generate cryptographic hashes from text instantly, computed locally in your browser.",
    keywords: ["hash generator", "sha256 generator", "sha256 hash online", "generate sha256 hash", "text to hash"],
  },
  inputSchema: schema,
  compute,
  component: HashGenerator,
  faq: [
    { question: "Can I reverse a hash back to the original text?", answer: "No. SHA-256 is a one-way function; hashes cannot be reversed, only compared against known values." },
    { question: "Why does the same text always give the same hash?", answer: "SHA-256 is deterministic -- identical input always produces identical output, which is exactly what makes hashes useful for verifying that two pieces of data match without comparing them directly." },
    { question: "Is SHA-256 still considered secure?", answer: "Yes, SHA-256 has no known practical collision attacks and remains the standard choice for most integrity-checking and cryptographic applications as of today." },
    { question: "Can I hash a whole file, not just text?", answer: "This tool accepts text input only. For files, you'd typically use a command-line tool (like sha256sum) or a dedicated file-hashing utility." },
  ],
  relatedToolSlugs: ["password-generator", "uuid-generator"],
  exampleInput: { text: "AlfennAI" },
};
