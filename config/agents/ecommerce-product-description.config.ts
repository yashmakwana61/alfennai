import type { AgentConfig } from "@/types/agent";

export const productDescriptionAgent: AgentConfig = {
  id: "ecommerce-product-description",
  slug: "ecommerce-product-description",
  title: "Product Description Generator Agent",
  industry: "ecommerce",
  useCase: "Generate SEO-friendly product descriptions from raw specs for approval before publishing to your catalog.",
  shortDescription: "Turns raw product specs into an SEO-friendly description, routed for approval before publishing.",
  longDescription:
    "Writing unique, SEO-friendly descriptions for every SKU is one of the most repetitive tasks in running a store -- and copy-pasting the manufacturer's spec sheet hurts both conversions and SEO (duplicate content). This agent takes raw specs and drafts a description that's both natural to read and structured for search.\n\nDrafts route through a Slack approval step before publishing, since product copy has real accuracy implications (materials, sizing, claims) that deserve a human check.\n\nDownload includes the prompt and n8n workflow -- connect your product data source, AI and Slack credentials, and your catalog/sheet for the final publish step.",
  systemPrompt:
    "You are an e-commerce copywriter. Given raw product specs (materials, dimensions, features, category), write a 60-100 word product description that is natural to read, mentions key features and benefits (not just specs), and is naturally keyword-rich for the product category without keyword stuffing. Do not invent specs or claims not provided.",
  userPromptTemplate: "Product specs:\n{{ $json.specs }}\n\nCategory:\n{{ $json.category }}\n\nTarget keywords (optional):\n{{ $json.keywords }}",
  archetype: "content-draft-approval",
  workflowParams: {
    workflowName: "Product Description Generator",
    triggerLabel: "New product added",
    aiNodeLabel: "Draft product description",
    outputLabel: "Publish to catalog sheet",
    outputChannel: "sheet",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Product Description Generator AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent that drafts SEO-friendly, accurate product descriptions from raw specs, with a Slack approval step before publishing. Includes n8n workflow.",
    keywords: ["ai product description generator", "ecommerce copywriting automation", "n8n product catalog workflow", "seo product description ai"],
  },
  faq: [
    { question: "Will this create duplicate content across similar products?", answer: "The AI generates fresh phrasing per product based on its specific specs, which helps avoid the duplicate-content problem of copy-pasting manufacturer text -- but always spot-check similar products in the same category." },
    { question: "Does it publish directly to my store?", answer: "By default it writes to a spreadsheet after approval, so you control the final import. Swap the final node for your platform's product API to publish directly if you prefer." },
    { question: "Can I set a specific tone (luxury, playful, technical)?", answer: "Yes -- edit the system prompt to specify your brand voice; the current version is written to be broadly neutral and adaptable." },
  ],
  relatedAgentSlugs: ["ecommerce-abandoned-cart", "ecommerce-review-response"],
};
