/**
 * SEO Audit Script
 *
 * Checks every tool and agent config against a set of rules derived from
 * Google's SEO Starter Guide (developers.google.com/search/docs/fundamentals/seo-starter-guide):
 *
 *  - Title links: unique, clear, concise ("a good title is unique to the
 *    page, clear and concise" -- guide recommends roughly 50-60 chars so
 *    it doesn't get truncated in search results)
 *  - Meta descriptions: "short, unique to one particular page" -- roughly
 *    70-160 chars is the practical sweet spot before truncation
 *  - Duplicate content: the guide explicitly flags duplicate content
 *    across pages as something to avoid -- this checks for byte-identical
 *    titles/descriptions across all tools+agents
 *  - Thin content: the guide says there's no minimum word count *required*
 *    by Google, but also says content should be "compelling and useful" --
 *    a one-sentence description isn't that. This flags very short
 *    longDescriptions as worth expanding, not as a hard requirement.
 *  - Broken internal links: relatedToolSlugs/relatedAgentSlugs pointing to
 *    a slug that doesn't exist in the registry -- these silently render as
 *    nothing in the UI, but are worth fixing to avoid dead-end content.
 *  - FAQ presence: pages with FAQPage structured data need actual
 *    meaningful FAQ content to be eligible for the rich result.
 *
 * This does NOT auto-generate or auto-rewrite content. Per Google's own
 * guidance on unique, people-first content, thin-content fixes need a
 * human pass, not a template. This script's job is detection, not writing.
 *
 * Usage: npm run seo:audit
 */

import { TOOL_REGISTRY } from "../lib/engine/registry";
import { AGENT_REGISTRY } from "../lib/engine/agent-registry";

interface AuditIssue {
  severity: "error" | "warning";
  page: string;
  rule: string;
  detail: string;
}

const issues: AuditIssue[] = [];

const TITLE_MIN = 15;
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;
const THIN_CONTENT_WORDS = 80;
const MIN_FAQ_ITEMS = 2;

const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();
const allSlugs = new Set<string>([
  ...TOOL_REGISTRY.map((t) => t.slug),
  ...AGENT_REGISTRY.map((a) => a.slug),
]);

function checkTitleAndDescription(page: string, title: string, description: string) {
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    issues.push({
      severity: "warning",
      page,
      rule: "title-length",
      detail: `Title is ${title.length} chars (recommended ${TITLE_MIN}-${TITLE_MAX}): "${title}"`,
    });
  }
  if (description.length < DESC_MIN || description.length > DESC_MAX) {
    issues.push({
      severity: "warning",
      page,
      rule: "description-length",
      detail: `Meta description is ${description.length} chars (recommended ${DESC_MIN}-${DESC_MAX})`,
    });
  }

  const titleKey = title.trim().toLowerCase();
  if (seenTitles.has(titleKey)) {
    issues.push({
      severity: "error",
      page,
      rule: "duplicate-title",
      detail: `Duplicate title, also used by "${seenTitles.get(titleKey)}"`,
    });
  } else {
    seenTitles.set(titleKey, page);
  }

  const descKey = description.trim().toLowerCase();
  if (seenDescriptions.has(descKey)) {
    issues.push({
      severity: "error",
      page,
      rule: "duplicate-description",
      detail: `Duplicate meta description, also used by "${seenDescriptions.get(descKey)}"`,
    });
  } else {
    seenDescriptions.set(descKey, page);
  }
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

for (const tool of TOOL_REGISTRY) {
  const page = `/tools/${tool.category}/${tool.slug}`;
  checkTitleAndDescription(page, tool.seo.metaTitle, tool.seo.metaDescription);

  const words = wordCount(tool.longDescription);
  if (words < THIN_CONTENT_WORDS) {
    issues.push({
      severity: "warning",
      page,
      rule: "thin-content",
      detail: `longDescription is only ${words} words (consider expanding toward ${THIN_CONTENT_WORDS}+ for a fuller, more useful page)`,
    });
  }

  if (tool.faq.length < MIN_FAQ_ITEMS) {
    issues.push({
      severity: "warning",
      page,
      rule: "faq-count",
      detail: `Only ${tool.faq.length} FAQ item(s) -- consider adding more for a stronger FAQPage rich result`,
    });
  }

  for (const relatedSlug of tool.relatedToolSlugs) {
    if (!allSlugs.has(relatedSlug)) {
      issues.push({
        severity: "error",
        page,
        rule: "broken-related-link",
        detail: `relatedToolSlugs references "${relatedSlug}", which doesn't exist in any registry`,
      });
    }
  }
}

for (const agent of AGENT_REGISTRY) {
  const page = `/agents/${agent.industry}/${agent.slug}`;
  checkTitleAndDescription(page, agent.seo.metaTitle, agent.seo.metaDescription);

  const words = wordCount(agent.longDescription);
  if (words < THIN_CONTENT_WORDS) {
    issues.push({
      severity: "warning",
      page,
      rule: "thin-content",
      detail: `longDescription is only ${words} words (consider expanding toward ${THIN_CONTENT_WORDS}+ words)`,
    });
  }

  if (agent.faq.length < MIN_FAQ_ITEMS) {
    issues.push({
      severity: "warning",
      page,
      rule: "faq-count",
      detail: `Only ${agent.faq.length} FAQ item(s) -- consider adding more`,
    });
  }

  for (const relatedSlug of agent.relatedAgentSlugs) {
    if (!allSlugs.has(relatedSlug)) {
      issues.push({
        severity: "error",
        page,
        rule: "broken-related-link",
        detail: `relatedAgentSlugs references "${relatedSlug}", which doesn't exist in any registry`,
      });
    }
  }
}

// --- Report ---
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

console.log(`\nSEO Audit -- ${TOOL_REGISTRY.length} tools, ${AGENT_REGISTRY.length} agents checked\n`);

if (issues.length === 0) {
  console.log("No issues found.");
} else {
  for (const issue of [...errors, ...warnings]) {
    const tag = issue.severity === "error" ? "ERROR" : "WARN ";
    console.log(`[${tag}] ${issue.page} -- ${issue.rule}: ${issue.detail}`);
  }
}

console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)\n`);

// Exit non-zero only on errors (broken links, exact duplicates), so CI can
// gate on real problems without failing every build over a slightly-long
// meta description.
if (errors.length > 0) {
  process.exit(1);
}
