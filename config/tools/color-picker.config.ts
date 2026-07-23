import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { ColorPicker } from "@/components/tools/ColorPicker";

const schema = z.object({ hex: z.string().regex(/^#?[0-9a-fA-F]{6}$/, "Enter a valid 6-digit hex color") });
export type ColorPickerInput = z.infer<typeof schema>;
export interface ColorPickerOutput {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  complementaryHex: string;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60; break;
      case gn: h = ((bn - rn) / d + 2) * 60; break;
      default: h = ((rn - gn) / d + 4) * 60;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function compute(input: ColorPickerInput): ColorPickerOutput {
  const hex = "#" + input.hex.replace("#", "").toLowerCase();
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const complementaryHex = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  return { hex, rgb, hsl, complementaryHex };
}

export const colorPickerTool: ToolConfig<ColorPickerInput, ColorPickerOutput> = {
  id: "color-picker",
  slug: "color-picker",
  title: "Color Picker & Converter",
  shortDescription: "Convert HEX colors to RGB and HSL, and find the complementary color.",
  longDescription:
    "The Color Picker converts any HEX color code into its RGB and HSL equivalents and computes the complementary (opposite) color on the color wheel — useful for design systems, CSS variables and palette building.",
  category: "color-tools",
  icon: "Palette",
  isFeatured: true,
  seo: {
    metaTitle: "Color Picker & Converter - HEX to RGB HSL Free",
    metaDescription: "Free color picker and converter. Convert HEX to RGB and HSL, and find complementary colors instantly.",
    keywords: ["color picker", "hex to rgb", "color converter online"],
  },
  inputSchema: schema,
  compute,
  component: ColorPicker,
  faq: [{ question: "How is the complementary color calculated?", answer: "It inverts each RGB channel (255 minus the value), which approximates the color directly opposite on the color wheel." }],
  relatedToolSlugs: [],
  exampleInput: { hex: "#2563EB" },
};
