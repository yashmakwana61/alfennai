import type { AgentConfig } from "@/types/agent";

export const leadQualifierAgent: AgentConfig = {
  id: "real-estate-lead-qualifier",
  slug: "real-estate-lead-qualifier",
  title: "Real Estate Lead Qualifier Agent",
  industry: "real-estate",
  useCase: "Automatically qualify inbound property inquiries by budget, timeline and intent before they reach an agent.",
  shortDescription: "Qualifies inbound property inquiries automatically and routes hot leads to your team instantly.",
  longDescription:
    "Every real estate inquiry -- from a website form, WhatsApp, or a portal like Zillow -- asks the same underlying question: is this person actually ready to buy or rent, or just browsing? This agent reads the inbound message, asks itself the qualifying questions a good junior agent would (budget stated? timeline mentioned? specific property or area named? contact details complete?), and produces a qualification verdict plus a one-line summary.\n\nLeads marked \"qualified\" get routed straight to your CRM and your team gets a Slack ping immediately, so hot leads don't sit in an inbox for hours. Everything else still gets logged, just without interrupting anyone.\n\nDownload gives you the exact system prompt plus a ready n8n workflow: wire your website form or WhatsApp Business API into the webhook, plug in your own OpenAI/CRM/Slack credentials, and it's live.",
  systemPrompt:
    "You are a real estate lead qualification assistant. Given an inbound inquiry message, determine: (1) stated or inferable budget range, (2) timeline (immediate, 1-3 months, browsing/no timeline), (3) specificity (named property/area vs generic), (4) contact completeness. Based on these, output a verdict of exactly 'qualified' or 'unqualified', followed by a one-sentence reason. Be conservative -- only mark 'qualified' if at least budget or timeline is clearly stated AND contact info is present.",
  userPromptTemplate: "Inbound inquiry:\n{{ $json.message }}\n\nSender contact info:\n{{ $json.contact }}",
  archetype: "form-classify-crm",
  workflowParams: {
    workflowName: "Real Estate Lead Qualifier",
    triggerLabel: "New inquiry (website/WhatsApp)",
    aiNodeLabel: "Qualify lead",
    outputLabel: "Add to CRM",
    outputChannel: "crm",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Real Estate Lead Qualifier AI Agent - Free n8n Workflow",
    metaDescription: "Download a free AI agent + n8n workflow that automatically qualifies real estate leads by budget and timeline, and routes hot leads to your CRM and Slack instantly.",
    keywords: ["real estate ai agent", "lead qualification automation", "n8n real estate workflow", "ai lead scoring real estate"],
  },
  faq: [
    { question: "Do I need to know how to code to use this?", answer: "No. Import the JSON file directly into n8n (or rebuild the same logic in Make.com), then just fill in your own API credentials where marked -- no coding required." },
    { question: "Which AI model does this use?", answer: "The workflow defaults to GPT-4o-mini for cost efficiency, but you can swap the AI node for any model n8n supports, including Anthropic Claude." },
    { question: "Can this connect to my existing CRM?", answer: "The workflow includes a placeholder HTTP request to a CRM API. Swap the URL and auth for your own CRM (HubSpot, Salesforce, Airtable, etc.) -- the qualification logic itself doesn't change." },
    { question: "What if I want stricter or looser qualification criteria?", answer: "Edit the system prompt text in the downloaded file to adjust what counts as 'qualified' -- for example, requiring a specific budget floor." },
  ],
  relatedAgentSlugs: ["real-estate-tenant-inquiry", "real-estate-market-report"],
  isFeatured: true,
};
