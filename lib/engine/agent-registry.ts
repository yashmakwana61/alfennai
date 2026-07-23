import type { AgentConfig, AgentIndustry, AgentIndustrySlug } from "@/types/agent";

// Real estate
import { leadQualifierAgent } from "@/config/agents/real-estate-lead-qualifier.config";
import { listingDescriptionAgent } from "@/config/agents/real-estate-listing-description.config";
import { tenantInquiryAgent } from "@/config/agents/real-estate-tenant-inquiry.config";
import { dailyMarketReportAgent } from "@/config/agents/real-estate-market-report.config";
// E-commerce
import { abandonedCartAgent } from "@/config/agents/ecommerce-abandoned-cart.config";
import { productDescriptionAgent } from "@/config/agents/ecommerce-product-description.config";
import { reviewResponseAgent } from "@/config/agents/ecommerce-review-response.config";
import { orderSupportAgent } from "@/config/agents/ecommerce-order-support.config";

export const AGENT_REGISTRY: AgentConfig[] = [
  leadQualifierAgent,
  listingDescriptionAgent,
  tenantInquiryAgent,
  dailyMarketReportAgent,
  abandonedCartAgent,
  productDescriptionAgent,
  reviewResponseAgent,
  orderSupportAgent,
];

export const AGENT_INDUSTRY_REGISTRY: AgentIndustry[] = [
  { slug: "real-estate", name: "Real Estate", description: "AI agents for agents, brokerages and property managers.", icon: "Home" },
  { slug: "ecommerce", name: "E-commerce", description: "AI agents for online stores and DTC brands.", icon: "ShoppingCart" },
  { slug: "healthcare", name: "Healthcare", description: "AI agents for clinics and healthcare providers.", icon: "HeartPulse" },
  { slug: "legal", name: "Legal", description: "AI agents for law firms and legal teams.", icon: "Scale" },
  { slug: "finance-accounting", name: "Finance & Accounting", description: "AI agents for accountants and finance teams.", icon: "Landmark" },
  { slug: "education", name: "Education", description: "AI agents for schools, tutors and edtech.", icon: "GraduationCap" },
  { slug: "hospitality-travel", name: "Hospitality & Travel", description: "AI agents for hotels, travel agencies and hospitality.", icon: "Plane" },
  { slug: "manufacturing", name: "Manufacturing", description: "AI agents for manufacturers and supply chains.", icon: "Factory" },
  { slug: "hr-recruiting", name: "HR & Recruiting", description: "AI agents for HR teams and recruiters.", icon: "Users" },
  { slug: "marketing-agencies", name: "Marketing & Agencies", description: "AI agents for marketing teams and agencies.", icon: "Megaphone" },
  { slug: "restaurants-food", name: "Restaurants & Food Service", description: "AI agents for restaurants and food service.", icon: "UtensilsCrossed" },
  { slug: "saas-support", name: "SaaS & Tech Support", description: "AI agents for SaaS support and tech teams.", icon: "Headset" },
];

export function getAgentBySlug(slug: string): AgentConfig | undefined {
  return AGENT_REGISTRY.find((a) => a.slug === slug);
}

export function getAgentsByIndustry(industry: AgentIndustrySlug): AgentConfig[] {
  return AGENT_REGISTRY.filter((a) => a.industry === industry);
}

export function getIndustryBySlug(slug: string): AgentIndustry | undefined {
  return AGENT_INDUSTRY_REGISTRY.find((i) => i.slug === slug);
}

export function getFeaturedAgents(): AgentConfig[] {
  return AGENT_REGISTRY.filter((a) => a.isFeatured);
}

export function getRelatedAgents(agent: AgentConfig): AgentConfig[] {
  return agent.relatedAgentSlugs
    .map((slug) => getAgentBySlug(slug))
    .filter((a): a is AgentConfig => Boolean(a));
}

export function getAllAgentSlugsWithIndustry(): { industry: string; slug: string }[] {
  return AGENT_REGISTRY.map((a) => ({ industry: a.industry, slug: a.slug }));
}
