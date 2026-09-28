import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SITE_NAME,
  SITE_URL,
  buildAgentIndustryMetadata,
  buildAgentMetadata,
  buildCategoryMetadata,
  buildToolMetadata,
} from "../../seo/metadata";
import { AGENT_INDUSTRY_REGISTRY, AGENT_REGISTRY } from "../engine/agent-registry";
import { CATEGORY_REGISTRY, TOOL_REGISTRY } from "../engine/registry";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

/**
 * Guards the Phase 5.1 architecture: metadata builders must NEVER embed the
 * site-name suffix themselves — the root layout title.template owns it.
 * Simulates template application the way Next.js does: template.replace("%s", title).
 */
const GLOBAL_TEMPLATE = `%s | ${SITE_NAME}`;

function renderedTitle(title: unknown): string {
  return GLOBAL_TEMPLATE.replace("%s", String(title));
}

describe("title-template ownership (Phase 5.1 regression guard)", () => {
  it("no tool metaTitle embeds the site name", () => {
    for (const tool of TOOL_REGISTRY) {
      assert.ok(
        !tool.seo.metaTitle.includes(SITE_NAME),
        `site-name suffix in ${tool.slug} metaTitle`
      );
    }
  });
  it("every tool renders exactly one site-name suffix through the template", () => {
    for (const tool of TOOL_REGISTRY) {
      const meta = buildToolMetadata(tool);
      const rendered = renderedTitle(meta.title);
      assert.equal(
        rendered.split(SITE_NAME).length - 1,
        1,
        `expected exactly one suffix: ${rendered}`
      );
    }
  });
  it("category and agent builders are suffix-free too", () => {
    for (const category of CATEGORY_REGISTRY) {
      const meta = buildCategoryMetadata(category);
      assert.ok(!String(meta.title).includes(SITE_NAME));
      assert.equal(renderedTitle(meta.title).split(SITE_NAME).length - 1, 1);
    }
    for (const agent of AGENT_REGISTRY) {
      const meta = buildAgentMetadata(agent);
      assert.ok(!String(meta.title).includes(SITE_NAME));
    }
    for (const industry of AGENT_INDUSTRY_REGISTRY) {
      const meta = buildAgentIndustryMetadata(industry);
      assert.ok(!String(meta.title).includes(SITE_NAME));
    }
  });
});

describe("canonical construction", () => {
  it("tool canonicals use SITE_URL with clean paths", () => {
    for (const tool of TOOL_REGISTRY) {
      const meta = buildToolMetadata(tool);
      const canonical = (meta.alternates as { canonical?: string })?.canonical ?? "";
      assert.ok(canonical.startsWith(`${SITE_URL}/tools/`), `bad canonical: ${canonical}`);
      assert.ok(!canonical.includes("//tools"), `double slash: ${canonical}`);
      assert.ok(
        !/localhost|127\.0\.0\.1|www\.|alfennai\.in/i.test(canonical),
        `wrong host: ${canonical}`
      );
    }
  });
});

describe("indexability flags", () => {
  it("tool pages are index,follow", () => {
    for (const tool of TOOL_REGISTRY) {
      const meta = buildToolMetadata(tool);
      const robotsMeta = meta.robots as { index?: boolean; follow?: boolean } | undefined;
      assert.equal(robotsMeta?.index, true, `${tool.slug} not indexable`);
      assert.equal(robotsMeta?.follow, true, `${tool.slug} not followable`);
    }
  });
});

describe("robots.txt", () => {
  it("allows crawling, blocks /api/, points at the sitemap", () => {
    const r = robots() as {
      rules:
        | { userAgent?: string; allow?: string | string[]; disallow?: string | string[] }
        | Array<{ userAgent?: string; allow?: string | string[]; disallow?: string | string[] }>;
      sitemap?: string;
    };
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    assert.ok(rules.some((rule) => rule.userAgent === "*" && rule.allow === "/"));
    assert.ok(!rules.some((rule) => rule.disallow === "/"));
    assert.ok(rules.some((rule) => rule.disallow === "/api/" || (Array.isArray(rule.disallow) && rule.disallow.includes("/api/"))));
    assert.equal(r.sitemap, `${SITE_URL}/sitemap.xml`);
  });
});

describe("sitemap integrity", () => {
  it("has no /blog, no duplicates, no localhost, all-https", () => {
    const entries = sitemap();
    const urls: string[] = entries.map((e: { url: string }) => e.url);
    assert.ok(!urls.some((u: string) => u.endsWith("/blog")), "stale /blog in sitemap");
    assert.equal(new Set(urls).size, urls.length, "duplicate URLs in sitemap");
    for (const u of urls) {
      assert.ok(u.startsWith("https://"), `non-https URL: ${u}`);
      assert.ok(!/localhost|127\.0\.0\.1/i.test(u), `localhost URL: ${u}`);
    }
  });
  it("includes all five finance calculator routes", () => {
    const entries = sitemap();
    const urls: string[] = entries.map((e: { url: string }) => e.url);
    for (const slug of [
      "salary-calculator",
      "ctc-to-in-hand",
      "salary-hike-calculator",
      "pf-calculator",
      "gratuity-calculator",
    ]) {
      assert.ok(urls.includes(`${SITE_URL}/tools/finance/${slug}`), `missing ${slug}`);
    }
  });
});
