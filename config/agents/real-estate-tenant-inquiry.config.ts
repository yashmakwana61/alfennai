import type { AgentConfig } from "@/types/agent";

export const tenantInquiryAgent: AgentConfig = {
  id: "real-estate-tenant-inquiry",
  slug: "real-estate-tenant-inquiry",
  title: "Tenant Maintenance Request Triage Agent",
  industry: "real-estate",
  useCase: "Triage inbound tenant maintenance requests by urgency and route emergencies to the property manager instantly.",
  shortDescription: "Reads tenant maintenance requests, triages urgency, and pings your team immediately for emergencies.",
  longDescription:
    "Not every maintenance request is equal -- a leaking pipe needs attention within the hour, a squeaky door doesn't. This agent reads inbound tenant messages (from a maintenance request form, WhatsApp, or email forwarded via webhook) and classifies urgency into emergency, urgent, or routine, then drafts an acknowledgment reply.\n\nEmergencies get an immediate Slack alert to the property manager. Everything else gets logged and acknowledged without waking anyone up at 11pm for a flickering lightbulb.\n\nThe download includes the prompt and n8n workflow -- connect your tenant communication channel, AI credentials and Slack workspace, and it runs continuously.",
  systemPrompt:
    "You are a property management triage assistant. Given a tenant's maintenance request message, classify its urgency as exactly one of: 'emergency' (active water leak, no heat in freezing weather, electrical hazard, security/lockout issue), 'urgent' (appliance failure, pest issue, non-critical plumbing), or 'routine' (cosmetic, minor, non-time-sensitive). Then draft a brief, empathetic acknowledgment reply to send the tenant confirming receipt and expected response time (emergency: within 1 hour, urgent: within 24 hours, routine: within 3-5 business days).",
  userPromptTemplate: "Tenant maintenance request:\n{{ $json.message }}\n\nUnit/property:\n{{ $json.unit }}",
  archetype: "inbound-message-response",
  workflowParams: {
    workflowName: "Tenant Maintenance Request Triage",
    triggerLabel: "New maintenance request",
    aiNodeLabel: "Triage urgency + draft reply",
    outputLabel: "Notify property manager",
    outputChannel: "slack",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Tenant Maintenance Triage AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent that triages tenant maintenance requests by urgency and instantly alerts your team to emergencies, with an n8n workflow you can import today.",
    keywords: ["property management ai agent", "tenant maintenance automation", "n8n property management workflow", "maintenance request triage ai"],
  },
  faq: [
    { question: "Does this replace my property management software?", answer: "No -- it's a triage and notification layer on top of however tenants currently reach you (form, WhatsApp, email). It doesn't replace a full property management system." },
    { question: "What happens for a genuine emergency?", answer: "The workflow sends an immediate Slack notification so your team can respond right away -- it doesn't dispatch a contractor automatically, since that decision should stay with a human." },
    { question: "Can I add SMS notifications instead of Slack?", answer: "Yes -- swap the Slack node for an SMS provider node (Twilio, etc.) in n8n; the triage logic upstream doesn't change." },
  ],
  relatedAgentSlugs: ["real-estate-lead-qualifier", "real-estate-listing-description"],
};
