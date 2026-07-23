import type { ComponentType } from "react";
import type { ZodSchema } from "zod";

export type ToolCategorySlug =
  | "calculators"
  | "converters"
  | "developer-tools"
  | "business-tools"
  | "image-tools"
  | "pdf-tools"
  | "text-tools"
  | "color-tools"
  | "generators"
  | "security-tools"
  | "finance"
  | "education"
  | "healthcare"
  | "manufacturing"
  | "ai-tools";

export interface ToolFAQItem {
  question: string;
  answer: string;
}

export interface ToolSEOConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface ToolFormula {
  label: string;
  expression: string;
  explanation: string;
}

/**
 * The single source of truth for a tool. Adding a new tool means creating
 * one of these objects and registering it in the tool registry -- nothing
 * else in the app needs to change.
 */
export interface ToolConfig<TInput = unknown, TOutput = unknown> {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: ToolCategorySlug;
  icon: string; // lucide-react icon name
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  seo: ToolSEOConfig;
  inputSchema: ZodSchema<TInput>;
  compute: (input: TInput) => TOutput;
  component: ComponentType<{ tool: ToolConfig<TInput, TOutput> }>;
  formulas?: ToolFormula[];
  faq: ToolFAQItem[];
  relatedToolSlugs: string[];
  exampleInput?: Partial<TInput>;
}

export interface ToolCategory {
  slug: ToolCategorySlug;
  name: string;
  description: string;
  icon: string;
}
