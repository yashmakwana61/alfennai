import type { AgentConfig } from "@/types/agent";

export const dailyMarketReportAgent: AgentConfig = {
  id: "real-estate-market-report",
  slug: "real-estate-market-report",
  title: "Daily Market Report Agent",
  industry: "real-estate",
  useCase: "Pull local market data on a schedule and email agents a plain-English daily or weekly summary.",
  shortDescription: "Fetches local market data on a schedule and emails your team a plain-English summary, automatically.",
  longDescription:
    "Staying on top of local market movement -- new listings, price changes, days-on-market trends -- usually means someone manually checking a dashboard every morning. This agent runs on a schedule, pulls data from your market data source, and has the AI turn raw numbers into a short, readable summary a busy agent can scan in 30 seconds.\n\nThe email lands in your team's inbox every morning (or whatever schedule you set) with the key movements called out in plain English, not a wall of raw statistics.\n\nDownload includes the prompt and n8n workflow -- point the data-fetch step at your own MLS feed, market data API, or internal database, plug in your AI and email credentials, and set your schedule.",
  systemPrompt:
    "You are a real estate market analyst. Given raw market data (new listings, price changes, average days on market, inventory levels), write a concise 4-6 sentence summary in plain English suitable for a busy real estate agent to scan quickly. Highlight the most significant changes first (biggest price movements, notable new listings, inventory shifts). Avoid jargon; write as if briefing a colleague verbally.",
  userPromptTemplate: "Raw market data:\n{{ $json.marketData }}\n\nRegion:\n{{ $json.region }}",
  archetype: "scheduled-summary",
  workflowParams: {
    workflowName: "Daily Real Estate Market Report",
    triggerLabel: "Every morning at 7am",
    aiNodeLabel: "Summarize market data",
    outputLabel: "Email daily report",
    outputChannel: "email",
  },
  compatibleWith: ["n8n", "Make.com", "ChatGPT", "Claude"],
  seo: {
    metaTitle: "Real Estate Daily Market Report AI Agent - Free n8n Workflow",
    metaDescription: "Free AI agent and n8n workflow that automatically summarizes local real estate market data into a daily email report for your team.",
    keywords: ["real estate market report automation", "ai market analysis agent", "n8n real estate report", "daily market summary ai"],
  },
  faq: [
    { question: "Where does the market data come from?", answer: "You connect your own source -- an MLS feed, a market data API, or an internal database. The workflow includes a placeholder HTTP request node for this; swap in your actual source's URL and credentials." },
    { question: "Can I change the schedule?", answer: "Yes -- the schedule trigger node's interval is fully editable in n8n, whether you want it daily, weekly, or at a specific time." },
    { question: "Can this go to multiple recipients or a Slack channel instead?", answer: "Yes -- either add multiple addresses to the email node, or swap it for a Slack node to post in a channel instead." },
  ],
  relatedAgentSlugs: ["real-estate-lead-qualifier", "real-estate-listing-description"],
};
