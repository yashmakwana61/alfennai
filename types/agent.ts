export type AgentIndustrySlug =
  | "real-estate"
  | "ecommerce"
  | "healthcare"
  | "legal"
  | "finance-accounting"
  | "education"
  | "hospitality-travel"
  | "manufacturing"
  | "hr-recruiting"
  | "marketing-agencies"
  | "restaurants-food"
  | "saas-support";

export type WorkflowArchetype =
  | "inbound-message-response" // A: webhook/WhatsApp trigger -> AI -> notify/reply
  | "scheduled-summary" // B: cron -> fetch data -> AI summarize -> email
  | "form-classify-crm" // C: form/webhook -> AI classify/score -> CRM update
  | "content-draft-approval"; // D: new record -> AI draft -> approval -> publish

export interface AgentFAQItem {
  question: string;
  answer: string;
}

export interface AgentSEOConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

/**
 * The single source of truth for one downloadable AI agent. Adding a new
 * agent means creating one of these plus registering it -- the workflow
 * JSON is generated automatically from the chosen archetype template.
 */
export interface AgentConfig {
  id: string;
  slug: string;
  title: string;
  industry: AgentIndustrySlug;
  useCase: string;
  shortDescription: string;
  longDescription: string;
  systemPrompt: string;
  userPromptTemplate: string;
  archetype: WorkflowArchetype;
  /** Fills in the archetype template's customizable labels/nodes. */
  workflowParams: {
    workflowName: string;
    triggerLabel: string;
    aiNodeLabel: string;
    outputLabel: string;
    outputChannel: "slack" | "email" | "whatsapp" | "crm" | "sheet";
  };
  compatibleWith: string[]; // e.g. ["n8n", "Make.com", "ChatGPT", "Claude"]
  seo: AgentSEOConfig;
  faq: AgentFAQItem[];
  relatedAgentSlugs: string[];
  isFeatured?: boolean;
}

export interface AgentIndustry {
  slug: AgentIndustrySlug;
  name: string;
  description: string;
  icon: string;
}
