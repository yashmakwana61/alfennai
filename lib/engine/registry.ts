import type { ToolConfig, ToolCategory, ToolCategorySlug } from "@/types/tool";
import { ageCalculatorTool } from "@/config/tools/age-calculator.config";
import { jsonFormatterTool } from "@/config/tools/json-formatter.config";
import { passwordGeneratorTool } from "@/config/tools/password-generator.config";

/**
 * TOOL_REGISTRY is the only place new tools get wired in.
 * To add tool #38, write a config file under config/tools/ and add
 * one line here. Everything else (routing, SEO, sitemap, related
 * tools, search index) derives from this array automatically.
 */
export const TOOL_REGISTRY: ToolConfig[] = [
  ageCalculatorTool,
  jsonFormatterTool,
  passwordGeneratorTool,
] as ToolConfig[];

export const CATEGORY_REGISTRY: ToolCategory[] = [
  { slug: "calculators", name: "Calculators", description: "Fast, accurate calculators for everyday math, finance and health.", icon: "Calculator" },
  { slug: "converters", name: "Converters", description: "Convert between units, formats and file types.", icon: "ArrowLeftRight" },
  { slug: "developer-tools", name: "Developer Tools", description: "Formatters, validators and encoders for developers.", icon: "Code2" },
  { slug: "business-tools", name: "Business Tools", description: "Tools to run and grow a business.", icon: "Briefcase" },
  { slug: "image-tools", name: "Image Tools", description: "Edit, compress and convert images.", icon: "Image" },
  { slug: "pdf-tools", name: "PDF Tools", description: "Merge, split, compress and convert PDFs.", icon: "FileText" },
  { slug: "text-tools", name: "Text Tools", description: "Format, clean and analyze text.", icon: "Type" },
  { slug: "color-tools", name: "Color Tools", description: "Pick, convert and generate color palettes.", icon: "Palette" },
  { slug: "generators", name: "Generators", description: "Generate passwords, UUIDs, QR codes and more.", icon: "Sparkles" },
  { slug: "security-tools", name: "Security Tools", description: "Hashing, encoding and security utilities.", icon: "ShieldCheck" },
  { slug: "finance", name: "Finance", description: "Loan, tax and investment calculators.", icon: "Landmark" },
  { slug: "education", name: "Education", description: "Tools for students and educators.", icon: "GraduationCap" },
  { slug: "healthcare", name: "Healthcare", description: "Health and wellness calculators.", icon: "HeartPulse" },
  { slug: "manufacturing", name: "Manufacturing", description: "Tools for production and manufacturing.", icon: "Factory" },
  { slug: "ai-tools", name: "AI Tools", description: "AI-assisted utilities.", icon: "Bot" },
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return TOOL_REGISTRY.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategorySlug): ToolConfig[] {
  return TOOL_REGISTRY.filter((tool) => tool.category === category);
}

export function getCategoryBySlug(slug: string): ToolCategory | undefined {
  return CATEGORY_REGISTRY.find((c) => c.slug === slug);
}

export function getRelatedTools(tool: ToolConfig): ToolConfig[] {
  return tool.relatedToolSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolConfig => Boolean(t));
}

export function getFeaturedTools(): ToolConfig[] {
  return TOOL_REGISTRY.filter((t) => t.isFeatured);
}

export function getTrendingTools(): ToolConfig[] {
  return TOOL_REGISTRY.filter((t) => t.isTrending);
}

export function getNewTools(): ToolConfig[] {
  return TOOL_REGISTRY.filter((t) => t.isNew);
}

export function getAllToolSlugsWithCategory(): { category: string; slug: string }[] {
  return TOOL_REGISTRY.map((t) => ({ category: t.category, slug: t.slug }));
}
