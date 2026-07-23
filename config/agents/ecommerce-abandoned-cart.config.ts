import type { AgentConfig } from "@/types/agent";

export const abandonedCartAgent: AgentConfig = {
  id: "ecommerce-abandoned-cart",
  slug: "ecommerce-abandoned-cart",
  title: "Abandoned Cart Recovery Agent",
  industry: "ecommerce",
  useCase: "Draft a personalized cart recovery message the moment a customer abandons checkout, instead of a generic template.",
  shortDescription: "Drafts a personalized abandoned-cart recovery message based on the actual items left behind.",
  longDescription:
    "Generic \"you left something in your cart\" emails get ignored. This agent takes the actual items a customer abandoned -- product names, price, whether it's their first visit or a returning customer -- and drafts a short, specific recovery message that references the real products, not a template variable.\n\nTriggered the moment your store's cart-abandonment webhook fires, the AI drafts the message and sends it out via email or WhatsApp within minutes, while the intent is still warm.\n\nDownload includes the prompt and n8n workflow -- connect your store's abandoned-cart webhook (Shopify, WooCommerce, etc.) and your own AI and messaging credentials.",
  systemPrompt:
    "You are an e-commerce recovery copywriter. Given details of an abandoned cart (product names, prices, customer name if known, whether they're a first-time or returning customer), write a short (2-3 sentence) friendly recovery message that specifically references the actual products left behind. Do not use generic phrases like 'we noticed you left something'. If a discount code is provided, mention it naturally; if not, do not invent one.",
  userPromptTemplate: "Abandoned cart items:\n{{ $json.cartItems }}\n\nCustomer name:\n{{ $json.customerName }}\n\nDiscount code (if any):\n{{ $json.discountCode }}",
  archetype: "inbound-message-response",
  workflowParams: {
    workflowName: "Abandoned Cart Recovery Agent",
    triggerLabel: "Cart abandoned (store webhook)",
    aiNodeLabel: "Draft recovery message",
    outputLabel: "Send recovery email",
    outputChannel: "email",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Abandoned Cart Recovery AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent that drafts personalized abandoned-cart recovery messages referencing actual products left behind, with a ready n8n workflow.",
    keywords: ["abandoned cart ai agent", "cart recovery automation", "n8n shopify workflow", "ai cart recovery email"],
  },
  faq: [
    { question: "Which platforms can trigger this?", answer: "Any platform that can fire a webhook on cart abandonment -- Shopify, WooCommerce, and most modern e-commerce platforms support this natively or via an app." },
    { question: "Can this send via WhatsApp instead of email?", answer: "Yes -- swap the output node for the WhatsApp Business API node (also included as an option in the workflow's output archetype)." },
    { question: "Does it invent discount codes?", answer: "No -- the prompt explicitly instructs the AI not to invent a discount if none is passed in. You control whether and when a code is offered." },
  ],
  relatedAgentSlugs: ["ecommerce-review-response", "ecommerce-order-support"],
  isFeatured: true,
};
