import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { LoremIpsumGenerator } from "@/components/tools/LoremIpsumGenerator";

const schema = z.object({ paragraphs: z.number().int().min(1).max(20), wordsPerParagraph: z.number().int().min(5).max(200) });
export type LoremIpsumInput = z.infer<typeof schema>;
export interface LoremIpsumOutput { text: string }

const WORD_BANK = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

function generateParagraph(wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
  }
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function compute(input: LoremIpsumInput): LoremIpsumOutput {
  const paragraphs = Array.from({ length: input.paragraphs }, () => generateParagraph(input.wordsPerParagraph));
  return { text: paragraphs.join("\n\n") };
}

export const loremIpsumGeneratorTool: ToolConfig<LoremIpsumInput, LoremIpsumOutput> = {
  id: "lorem-ipsum",
  slug: "lorem-ipsum",
  title: "Lorem Ipsum Generator",
  shortDescription: "Generate placeholder Lorem Ipsum text for mockups and designs.",
  longDescription:
    "The Lorem Ipsum Generator produces classic placeholder text in any number of paragraphs and length, useful for filling design mockups, wireframes and templates before real content is ready.",
  category: "generators",
  icon: "AlignLeft",
  seo: {
    metaTitle: "Lorem Ipsum Generator - Placeholder Text Free",
    metaDescription: "Free Lorem Ipsum generator. Create placeholder text for designs and mockups instantly.",
    keywords: ["lorem ipsum generator", "placeholder text generator", "dummy text"],
  },
  inputSchema: schema,
  compute,
  component: LoremIpsumGenerator,
  faq: [{ question: "Is Lorem Ipsum real Latin?", answer: "It's derived from a scrambled passage of Cicero's writing, but it's not meaningful Latin text — it's used purely for its neutral, familiar visual rhythm." }],
  relatedToolSlugs: ["word-counter", "markdown-preview"],
  exampleInput: { paragraphs: 3, wordsPerParagraph: 40 },
};
