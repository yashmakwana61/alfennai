import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { UuidGenerator } from "@/components/tools/UuidGenerator";

const schema = z.object({ count: z.number().int().min(1).max(100) });
export type UuidGeneratorInput = z.infer<typeof schema>;
export interface UuidGeneratorOutput { uuids: string[] }

function compute(input: UuidGeneratorInput): UuidGeneratorOutput {
  const uuids = Array.from({ length: input.count }, () => crypto.randomUUID());
  return { uuids };
}

export const uuidGeneratorTool: ToolConfig<UuidGeneratorInput, UuidGeneratorOutput> = {
  id: "uuid-generator",
  slug: "uuid-generator",
  title: "UUID Generator",
  shortDescription: "Generate one or many cryptographically random UUID v4 identifiers.",
  longDescription:
    "UUIDs (Universally Unique Identifiers) let systems assign IDs without needing a central authority to coordinate and avoid collisions -- a database, a distributed system, or a test fixture can each generate UUIDs independently and never collide in practice. This generator produces RFC 4122 version 4 UUIDs, the most common variant, using your browser's cryptographically secure random number generator (crypto.randomUUID()).\n\nGenerate a single UUID or up to 100 at once -- useful for seeding test data, generating primary keys before an insert, or creating unique session and tracking identifiers. Each one follows the standard 8-4-4-4-12 hexadecimal format.\n\nEverything happens locally in your browser; no UUIDs are logged or transmitted anywhere.",
  category: "generators",
  icon: "Fingerprint",
  isFeatured: true,
  seo: {
    metaTitle: "UUID Generator - Generate UUID v4 Online Free",
    metaDescription: "Free UUID generator. Create one or many random UUID v4 identifiers instantly.",
    keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid generator", "generate uuid online"],
  },
  inputSchema: schema,
  compute,
  component: UuidGenerator,
  faq: [
    { question: "Are these UUIDs guaranteed unique?", answer: "UUID v4 uses 122 random bits, making collisions astronomically unlikely in practice -- you'd need to generate billions before a collision becomes a realistic concern." },
    { question: "What's the difference between UUID and GUID?", answer: "They're effectively the same concept -- GUID (Globally Unique Identifier) is Microsoft's term, UUID is the general/standard term, and both follow the same format." },
    { question: "Can I generate more than 100 at once?", answer: "This tool caps at 100 per generation to keep the interface responsive. For bulk generation, a script calling crypto.randomUUID() in a loop is more practical." },
    { question: "Are UUID v4 values sortable?", answer: "No -- v4 UUIDs are fully random, not time-ordered. If you need sortable unique IDs, look into ULID or UUID v7, which embed a timestamp." },
  ],
  relatedToolSlugs: ["password-generator", "hash-generator"],
  exampleInput: { count: 5 },
};
