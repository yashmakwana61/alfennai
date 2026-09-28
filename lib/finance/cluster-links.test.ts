import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TOOL_REGISTRY,
  getToolBySlug,
} from "../engine/registry";
import type { ToolConfig } from "../../types/tool";

const CLUSTER_SLUGS = [
  "salary-calculator",
  "ctc-to-in-hand",
  "salary-hike-calculator",
  "pf-calculator",
  "gratuity-calculator",
  "hra-calculator",
];

const LINK_PATTERN = /\[([^\]]+)\]\((\/tools\/[^)\s]+)\)/g;
const BANNED_ANCHORS = ["click here", "learn more", "this tool", "our calculator"];

function collectText(tool: ToolConfig): string[] {
  const out: string[] = [...(tool.intro ?? []), tool.longDescription];
  for (const section of tool.contentSections ?? []) {
    out.push(...(section.paragraphs ?? []), ...(section.list ?? []));
    if (section.table) {
      out.push(...section.table.headers);
      for (const row of section.table.rows) out.push(...row);
    }
  }
  return out;
}

function collectLinks(tool: ToolConfig): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];
  for (const text of collectText(tool)) {
    for (const match of text.matchAll(LINK_PATTERN)) {
      links.push({ label: match[1], href: match[2] });
    }
  }
  return links;
}

describe("finance cluster metadata uniqueness", () => {
  const tools = CLUSTER_SLUGS.map((slug) => getToolBySlug(slug));
  it("all six cluster tools exist", () => {
    assert.equal(tools.filter(Boolean).length, 6);
  });
  it("titles are unique", () => {
    const titles = tools.map((t) => t!.title);
    assert.equal(new Set(titles).size, titles.length);
  });
  it("metaTitles are unique and carry no site-name suffix", () => {
    const metas = tools.map((t) => t!.seo.metaTitle);
    assert.equal(new Set(metas).size, metas.length);
    for (const meta of metas) {
      assert.ok(!meta.includes("| AlfennAI"), `site-name suffix in config: ${meta}`);
    }
  });
  it("metaDescriptions are unique", () => {
    const descs = tools.map((t) => t!.seo.metaDescription);
    assert.equal(new Set(descs).size, descs.length);
  });
});

describe("finance cluster contextual links", () => {
  it("every inline link resolves to a real registry route", () => {
    let count = 0;
    for (const slug of CLUSTER_SLUGS) {
      const tool = getToolBySlug(slug)!;
      for (const { label, href } of collectLinks(tool)) {
        const match = href.match(/^\/tools\/([^/]+)\/([^/]+)$/);
        assert.ok(match, `malformed href ${href} in ${slug}`);
        const target = getToolBySlug(match[2]);
        assert.ok(target, `unresolved link ${href} in ${slug}`);
        assert.equal(target.category, match[1], `wrong category for ${href} in ${slug}`);
        count += 1;
      }
    }
    assert.ok(count >= 20, `expected at least 20 contextual links, found ${count}`);
  });
  it("no banned generic anchor text", () => {
    for (const slug of CLUSTER_SLUGS) {
      const tool = getToolBySlug(slug)!;
      for (const { label } of collectLinks(tool)) {
        assert.ok(
          !BANNED_ANCHORS.includes(label.toLowerCase()),
          `banned anchor "${label}" in ${slug}`
        );
      }
    }
  });
});

describe("finance cluster related tools", () => {
  it("every related slug resolves", () => {
    for (const tool of TOOL_REGISTRY) {
      for (const slug of tool.relatedToolSlugs) {
        assert.ok(getToolBySlug(slug), `unresolved related slug ${slug} in ${tool.slug}`);
      }
    }
  });
  it("salary cluster forms the expected graph", () => {
    const expected: Record<string, string[]> = {
      "salary-calculator": ["ctc-to-in-hand", "pf-calculator", "salary-hike-calculator", "gratuity-calculator", "hra-calculator"],
      "ctc-to-in-hand": ["salary-calculator", "pf-calculator", "gratuity-calculator", "salary-hike-calculator", "hra-calculator"],
      "salary-hike-calculator": ["salary-calculator", "ctc-to-in-hand", "pf-calculator", "gratuity-calculator", "hra-calculator"],
      "pf-calculator": ["salary-calculator", "ctc-to-in-hand", "salary-hike-calculator", "gratuity-calculator", "hra-calculator"],
      "gratuity-calculator": ["salary-calculator", "ctc-to-in-hand", "pf-calculator", "salary-hike-calculator", "hra-calculator"],
      "hra-calculator": ["salary-calculator", "ctc-to-in-hand", "pf-calculator", "gratuity-calculator", "salary-hike-calculator"],
    };
    for (const [slug, related] of Object.entries(expected)) {
      assert.deepEqual(getToolBySlug(slug)!.relatedToolSlugs, related);
    }
  });
});
