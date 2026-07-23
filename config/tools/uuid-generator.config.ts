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
    "The UUID Generator produces RFC 4122 version 4 UUIDs using your browser's cryptographically secure random number generator — ideal for database keys, tracking IDs and test data.",
  category: "generators",
  icon: "Fingerprint",
  isFeatured: true,
  seo: {
    metaTitle: "UUID Generator - Generate UUID v4 Online Free",
    metaDescription: "Free UUID generator. Create one or many random UUID v4 identifiers instantly.",
    keywords: ["uuid generator", "guid generator", "uuid v4"],
  },
  inputSchema: schema,
  compute,
  component: UuidGenerator,
  faq: [{ question: "Are these UUIDs guaranteed unique?", answer: "UUID v4 uses 122 random bits, making collisions astronomically unlikely in practice." }],
  relatedToolSlugs: ["password-generator", "hash-generator"],
  exampleInput: { count: 5 },
};
