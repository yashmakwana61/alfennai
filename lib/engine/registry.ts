import type { ToolConfig, ToolCategory, ToolCategorySlug } from "@/types/tool";
import { ageCalculatorTool } from "@/config/tools/age-calculator.config";
import { jsonFormatterTool } from "@/config/tools/json-formatter.config";
import { passwordGeneratorTool } from "@/config/tools/password-generator.config";
import { emiCalculatorTool } from "@/config/tools/emi-calculator.config";
import { gstCalculatorTool } from "@/config/tools/gst-calculator.config";
import { percentageCalculatorTool } from "@/config/tools/percentage-calculator.config";
import { discountCalculatorTool } from "@/config/tools/discount-calculator.config";
import { profitCalculatorTool } from "@/config/tools/profit-calculator.config";
import { marginCalculatorTool } from "@/config/tools/margin-calculator.config";
import { bmiCalculatorTool } from "@/config/tools/bmi-calculator.config";
import { loanCalculatorTool } from "@/config/tools/loan-calculator.config";
import { timeCalculatorTool } from "@/config/tools/time-calculator.config";
import { dateDifferenceTool } from "@/config/tools/date-difference.config";
import { jsonValidatorTool } from "@/config/tools/json-validator.config";
import { base64EncodeTool } from "@/config/tools/base64-encode.config";
import { base64DecodeTool } from "@/config/tools/base64-decode.config";
import { urlEncoderTool } from "@/config/tools/url-encoder.config";
import { urlDecoderTool } from "@/config/tools/url-decoder.config";
import { jwtDecoderTool } from "@/config/tools/jwt-decoder.config";
import { jwtEncoderTool } from "@/config/tools/jwt-encoder.config";
import { regexTesterTool } from "@/config/tools/regex-tester.config";
import { uuidGeneratorTool } from "@/config/tools/uuid-generator.config";
import { hashGeneratorTool } from "@/config/tools/hash-generator.config";
import { htmlFormatterTool } from "@/config/tools/html-formatter.config";
import { cssMinifierTool } from "@/config/tools/css-minifier.config";
import { javascriptMinifierTool } from "@/config/tools/javascript-minifier.config";
import { markdownPreviewTool } from "@/config/tools/markdown-preview.config";
import { wordCounterTool } from "@/config/tools/word-counter.config";
import { characterCounterTool } from "@/config/tools/character-counter.config";
import { caseConverterTool } from "@/config/tools/case-converter.config";
import { textCleanerTool } from "@/config/tools/text-cleaner.config";
import { removeDuplicateLinesTool } from "@/config/tools/remove-duplicate-lines.config";
import { slugGeneratorTool } from "@/config/tools/slug-generator.config";
import { loremIpsumGeneratorTool } from "@/config/tools/lorem-ipsum.config";
import { randomGeneratorTool } from "@/config/tools/random-generator.config";
import { colorPickerTool } from "@/config/tools/color-picker.config";
import { qrGeneratorTool } from "@/config/tools/qr-generator.config";

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
  emiCalculatorTool,
  gstCalculatorTool,
  percentageCalculatorTool,
  discountCalculatorTool,
  profitCalculatorTool,
  marginCalculatorTool,
  bmiCalculatorTool,
  loanCalculatorTool,
  timeCalculatorTool,
  dateDifferenceTool,
  jsonValidatorTool,
  base64EncodeTool,
  base64DecodeTool,
  urlEncoderTool,
  urlDecoderTool,
  jwtDecoderTool,
  jwtEncoderTool,
  regexTesterTool,
  uuidGeneratorTool,
  hashGeneratorTool,
  htmlFormatterTool,
  cssMinifierTool,
  javascriptMinifierTool,
  markdownPreviewTool,
  wordCounterTool,
  characterCounterTool,
  caseConverterTool,
  textCleanerTool,
  removeDuplicateLinesTool,
  slugGeneratorTool,
  loremIpsumGeneratorTool,
  randomGeneratorTool,
  colorPickerTool,
  qrGeneratorTool,
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
