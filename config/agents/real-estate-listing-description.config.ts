import type { AgentConfig } from "@/types/agent";

export const listingDescriptionAgent: AgentConfig = {
  id: "real-estate-listing-description",
  slug: "real-estate-listing-description",
  title: "Property Listing Description Agent",
  industry: "real-estate",
  useCase: "Draft compelling, accurate property listing descriptions from raw property details for agent approval before publishing.",
  shortDescription: "Turns raw property details into a polished listing description, ready for your approval before it goes live.",
  longDescription:
    "Writing a fresh, compelling listing description for every property is repetitive work that still needs to sound distinctive, not templated. This agent takes structured property details -- bedrooms, bathrooms, square footage, key features, neighborhood -- and drafts a publish-ready description in your brand's tone.\n\nRather than publishing automatically, the workflow routes the draft to Slack for a quick human approval step first, since listing copy has real legal and factual accuracy implications (fair housing compliance, accurate claims). Once approved, it can be pushed onward to your listing sheet or CMS.\n\nThe download includes the prompt and a ready n8n workflow with the approval step built in -- just connect your own data source, AI credentials and Slack workspace.",
  systemPrompt:
    "You are a real estate copywriter. Given structured property details, write a compelling, accurate 100-150 word listing description highlighting the property's best features first. Use an engaging but professional tone. Do not invent details not provided. Avoid any language that could imply discrimination based on protected characteristics (familial status, religion, etc.) per fair housing standards -- describe the property and amenities only, never the type of buyer/tenant who should live there.",
  userPromptTemplate: "Property details:\n{{ $json.details }}\n\nBrand tone notes (optional):\n{{ $json.toneNotes }}",
  archetype: "content-draft-approval",
  workflowParams: {
    workflowName: "Property Listing Description Generator",
    triggerLabel: "New property submitted",
    aiNodeLabel: "Draft listing description",
    outputLabel: "Save to listing sheet",
    outputChannel: "sheet",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Property Listing Description AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent that drafts fair-housing-compliant property listing descriptions from raw details, with a built-in Slack approval step before publishing.",
    keywords: ["real estate listing description generator", "ai property description", "n8n real estate automation", "listing copy ai agent"],
  },
  faq: [
    { question: "Does the AI publish listings automatically?", answer: "No -- the workflow includes a Slack approval step by design, since listing copy has real accuracy and compliance implications. Nothing publishes until a human approves it." },
    { question: "Does this handle fair housing compliance?", answer: "The prompt explicitly instructs the AI to avoid protected-characteristic language, but you're still responsible for reviewing every draft before it's published -- treat the AI output as a first draft, not a final compliance check." },
    { question: "Can I connect this to my actual CMS instead of a spreadsheet?", answer: "Yes -- swap the final Google Sheets node for an HTTP Request node pointed at your CMS's API." },
  ],
  relatedAgentSlugs: ["real-estate-lead-qualifier", "real-estate-market-report"],
  isFeatured: true,
};
