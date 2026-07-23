import type { AgentConfig } from "@/types/agent";

export const orderSupportAgent: AgentConfig = {
  id: "ecommerce-order-support",
  slug: "ecommerce-order-support",
  title: "Order Status Support Agent",
  industry: "ecommerce",
  useCase: "Answer 'where is my order' and similar support inquiries instantly via WhatsApp or webchat, using real order data.",
  shortDescription: "Answers 'where is my order' questions instantly over WhatsApp, using your real order data.",
  longDescription:
    "Order status questions are the single most common support ticket for most stores, and they're almost always answerable from data you already have -- the customer is just waiting for someone to look it up. This agent receives the inbound question (via WhatsApp or webchat), and is designed to be paired with an order-lookup step that fetches the real order data before the AI drafts its reply, so answers are grounded in actual status rather than guessed.\n\nFor anything outside simple status questions (a return request, a complaint), the agent's prompt is written to hand off to a human rather than attempt a resolution itself.\n\nDownload includes the prompt and n8n workflow -- wire in your own order lookup step (your store's order API) between the trigger and the AI node, plus your WhatsApp/messaging credentials.",
  systemPrompt:
    "You are an e-commerce order support assistant. You will be given a customer's message and the customer's order data (status, tracking number, expected delivery date) that has already been looked up. If the question is about order status, tracking, or delivery timing, answer directly and specifically using the provided order data. If the question is about anything else (returns, refunds, complaints, product issues), do not attempt to resolve it -- respond that you're connecting them with a team member, and clearly flag this in your output as 'ESCALATE'.",
  userPromptTemplate: "Customer message:\n{{ $json.message }}\n\nOrder data (already looked up):\n{{ $json.orderData }}",
  archetype: "inbound-message-response",
  workflowParams: {
    workflowName: "Order Status Support Agent",
    triggerLabel: "Customer message (WhatsApp/webchat)",
    aiNodeLabel: "Answer using order data",
    outputLabel: "Reply via WhatsApp",
    outputChannel: "whatsapp",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Order Status Support AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent that instantly answers 'where is my order' questions over WhatsApp using real order data, and escalates anything else to a human. Includes n8n workflow.",
    keywords: ["ai order status agent", "whatsapp customer support automation", "n8n ecommerce support workflow", "where is my order ai bot"],
  },
  faq: [
    { question: "Does this look up my order data automatically?", answer: "The downloaded workflow needs one extra node you add yourself: an HTTP request to your store's order API, placed between the trigger and the AI node, so the AI always answers from real data rather than guessing." },
    { question: "What happens with a question this can't handle?", answer: "The prompt explicitly instructs the AI to escalate anything beyond simple status questions -- returns, complaints, product issues all get flagged for a human rather than the AI attempting a response." },
    { question: "Can I use this for email support instead of WhatsApp?", answer: "Yes -- swap the trigger and output nodes for email-based ones; the core lookup-then-answer logic stays the same." },
  ],
  relatedAgentSlugs: ["ecommerce-abandoned-cart", "ecommerce-review-response"],
};
