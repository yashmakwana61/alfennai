import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { QrGenerator } from "@/components/tools/QrGenerator";

const schema = z.object({ text: z.string().min(1, "Enter text or a URL"), size: z.number().min(100).max(500) });
export type QrGeneratorInput = z.infer<typeof schema>;
export interface QrGeneratorOutput { imageUrl: string }

function compute(input: QrGeneratorInput): QrGeneratorOutput {
  const params = new URLSearchParams({ data: input.text, size: `${input.size}x${input.size}` });
  return { imageUrl: `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}` };
}

export const qrGeneratorTool: ToolConfig<QrGeneratorInput, QrGeneratorOutput> = {
  id: "qr-generator",
  slug: "qr-generator",
  title: "QR Code Generator",
  shortDescription: "Generate a downloadable QR code from any text, URL or contact info.",
  longDescription:
    "The QR Code Generator turns any text or URL into a scannable QR code image, ready to download and use in print or digital materials. Note: image generation is delegated to a third-party QR rendering service (goqr.me), so the text you enter is sent to that service to produce the image — avoid using it for sensitive data.",
  category: "generators",
  icon: "QrCode",
  isFeatured: true,
  seo: {
    metaTitle: "QR Code Generator - Create QR Codes Free",
    metaDescription: "Free QR code generator. Create a downloadable QR code from any text, URL or contact info instantly.",
    keywords: ["qr code generator", "qr generator online", "create qr code"],
  },
  inputSchema: schema,
  compute,
  component: QrGenerator,
  faq: [{ question: "Is my data kept private?", answer: "The text you enter is sent to a third-party QR rendering service to generate the image. Don't use this tool for sensitive or confidential information." }],
  relatedToolSlugs: ["uuid-generator", "url-encoder"],
  exampleInput: { text: "https://alfennai.com", size: 300 },
};
