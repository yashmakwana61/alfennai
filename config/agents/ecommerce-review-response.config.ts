import type { AgentConfig } from "@/types/agent";

export const reviewResponseAgent: AgentConfig = {
  id: "ecommerce-review-response",
  slug: "ecommerce-review-response",
  title: "Customer Review Response Agent",
  industry: "ecommerce",
  useCase: "Draft a thoughtful, on-brand response to every new customer review, and flag negative ones for the team.",
  shortDescription: "Drafts a thoughtful response to every new review, and immediately flags negative ones to your team.",
  longDescription:
    "Responding to reviews consistently -- especially at volume -- is one of those tasks that matters for reputation but rarely gets done well. This agent reads each new review and drafts an appropriate response: a genuine, specific thank-you for positive reviews, or an empathetic, non-defensive acknowledgment for negative ones.\n\nAny review flagged negative also pings your team on Slack immediately, since those often need a human follow-up beyond the automated reply (refund, replacement, escalation).\n\nDownload includes the prompt and n8n workflow -- connect your review platform's webhook (or a polling check if it doesn't support webhooks), plus your AI and Slack credentials.",
  systemPrompt:
    "You are a customer service assistant responding to product reviews. Given a review's text and star rating, draft a response: for 4-5 star reviews, a warm, specific thank-you referencing something from their review (not generic). For 1-3 star reviews, an empathetic, non-defensive acknowledgment that takes the concern seriously and invites them to reach out directly for resolution -- never argue with the customer or make promises about refunds/replacements in the drafted response, since that requires human judgment.",
  userPromptTemplate: "Review text:\n{{ $json.reviewText }}\n\nStar rating:\n{{ $json.rating }}\n\nProduct name:\n{{ $json.productName }}",
  archetype: "form-classify-crm",
  workflowParams: {
    workflowName: "Customer Review Response Agent",
    triggerLabel: "New review submitted",
    aiNodeLabel: "Draft response + classify sentiment",
    outputLabel: "Log to review tracker",
    outputChannel: "sheet",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Customer Review Response AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent that drafts thoughtful responses to every customer review and flags negative ones to your team instantly. Includes n8n workflow.",
    keywords: ["ai review response generator", "customer review automation", "n8n review management workflow", "review reply ai agent"],
  },
  faq: [
    { question: "Does it post the response automatically?", answer: "The drafted response is logged for your team to review and post -- it doesn't auto-publish, since public responses to reviews (especially negative ones) deserve a final human check." },
    { question: "How does it know which reviews are negative?", answer: "It uses the star rating directly (1-3 stars routes to the negative-handling branch), combined with the AI's read of the review text for tone." },
    { question: "Can this connect to Google Reviews / Trustpilot / Amazon?", answer: "Yes, as long as that platform can trigger a webhook on a new review (directly or via a connector app) -- swap the trigger node's source accordingly." },
  ],
  relatedAgentSlugs: ["ecommerce-abandoned-cart", "ecommerce-order-support"],
};
