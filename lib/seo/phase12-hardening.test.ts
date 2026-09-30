import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import Fuse from "fuse.js";
import {
  TOOL_REGISTRY,
  CATEGORY_REGISTRY,
  getPopulatedCategories,
  getEmptyCategories,
  isCategoryPopulated,
} from "../engine/registry";
import {
  AGENT_REGISTRY,
  AGENT_INDUSTRY_REGISTRY,
  getPopulatedIndustries,
  getEmptyIndustries,
  isIndustryPopulated,
} from "../engine/agent-registry";
import sitemap from "../../app/sitemap";
import { SITE_URL } from "../../seo/metadata";

const ROOT = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("phase 12: empty categories excluded from indexable surface", () => {
  it("empty categories exist and are exactly the zero-tool set", () => {
    const empty = getEmptyCategories();
    assert.ok(empty.length > 0, "expected at least one empty category");
    for (const c of empty) {
      assert.equal(isCategoryPopulated(c.slug), false);
      assert.equal(
        TOOL_REGISTRY.filter((t) => t.category === c.slug).length,
        0
      );
    }
    assert.equal(
      getPopulatedCategories().length + empty.length,
      CATEGORY_REGISTRY.length
    );
    // Known empty set at time of writing; guards against silent repopulation drift.
    const slugs = empty.map((c) => c.slug).sort();
    assert.deepEqual(slugs, [
      "ai-tools",
      "converters",
      "education",
      "image-tools",
      "manufacturing",
      "pdf-tools",
    ]);
  });

  it("sitemap contains populated categories only", () => {
    const urls = sitemap().map((e) => e.url);
    for (const c of getPopulatedCategories()) {
      assert.ok(urls.includes(`${SITE_URL}/tools/${c.slug}`), `missing ${c.slug}`);
    }
    for (const c of getEmptyCategories()) {
      assert.ok(!urls.includes(`${SITE_URL}/tools/${c.slug}`), `empty ${c.slug} in sitemap`);
    }
  });
});

describe("phase 12: empty agent industries excluded", () => {
  it("exactly two industries are populated", () => {
    const populated = getPopulatedIndustries().map((i) => i.slug).sort();
    assert.deepEqual(populated, ["ecommerce", "real-estate"]);
    assert.equal(getEmptyIndustries().length, AGENT_INDUSTRY_REGISTRY.length - 2);
    for (const i of getEmptyIndustries()) {
      assert.equal(isIndustryPopulated(i.slug), false);
    }
  });

  it("sitemap contains populated industries only", () => {
    const urls = sitemap().map((e) => e.url);
    assert.ok(urls.includes(`${SITE_URL}/agents/real-estate`));
    assert.ok(urls.includes(`${SITE_URL}/agents/ecommerce`));
    for (const i of getEmptyIndustries()) {
      assert.ok(!urls.includes(`${SITE_URL}/agents/${i.slug}`), `empty ${i.slug} in sitemap`);
    }
  });
});

describe("phase 12: noindex contract for empty pages", () => {
  it("category page emits noindex for empty categories", () => {
    const src = read("app/tools/[category]/page.tsx");
    assert.ok(src.includes("index: false"), "missing noindex directive");
    assert.ok(src.includes("follow: true"), "empty pages must stay follow");
    assert.ok(src.includes("getToolsByCategory"), "must derive emptiness from registry");
  });

  it("agent industry page emits noindex for empty industries", () => {
    const src = read("app/agents/[industry]/page.tsx");
    assert.ok(src.includes("index: false"), "missing noindex directive");
    assert.ok(src.includes("getAgentsByIndustry"), "must derive emptiness from registry");
  });
});

describe("phase 12: sitemap/indexability consistency", () => {
  it("no /blog, no duplicates, all https, methodology present", () => {
    const urls = sitemap().map((e) => e.url);
    assert.equal(new Set(urls).size, urls.length, "duplicate URLs");
    for (const u of urls) {
      assert.ok(u.startsWith("https://"), `non-https: ${u}`);
      assert.ok(!u.includes("/blog"), `blog URL: ${u}`);
    }
    for (const p of ["/methodology", "/privacy", "/terms", "/contact", "/about", "/agents"]) {
      assert.ok(urls.includes(`${SITE_URL}${p}`), `missing static ${p}`);
    }
    // Every sitemap tool/agent URL resolves against its registry.
    for (const t of TOOL_REGISTRY) {
      assert.ok(urls.includes(`${SITE_URL}/tools/${t.category}/${t.slug}`));
    }
    for (const a of AGENT_REGISTRY) {
      assert.ok(urls.includes(`${SITE_URL}/agents/${a.industry}/${a.slug}`));
    }
  });

  it("methodology route exists with stable last-updated and breadcrumb", () => {
    const path = join(ROOT, "app", "methodology", "page.tsx");
    assert.ok(existsSync(path), "app/methodology/page.tsx missing");
    const src = read("app/methodology/page.tsx");
    assert.ok(src.includes("Last updated"), "missing stable last-updated");
    assert.ok(!src.includes("new Date()"), "last-updated must be stable, not dynamic");
    assert.ok(src.includes("Breadcrumb"), "methodology should carry BreadcrumbList");
    assert.ok(src.includes(`${SITE_URL}/methodology`) || src.includes('canonical'), "needs canonical");
  });

  it("static pages carry canonical + stable dates", () => {
    for (const rel of ["app/privacy/page.tsx", "app/terms/page.tsx"]) {
      const src = read(rel);
      assert.ok(src.includes("canonical"), `${rel} missing canonical`);
      assert.ok(src.includes("Last updated"), `${rel} missing last-updated`);
      assert.ok(!src.includes("new Date()"), `${rel} must not use dynamic date`);
    }
  });
});

describe("phase 12: truthful tool count", () => {
  it("no hard-coded 100,000+ claim in user-facing components", () => {
    for (const rel of ["components/layout/SiteHeader.tsx", "app/page.tsx"]) {
      const src = read(rel);
      assert.ok(!src.includes("100,000"), `${rel} still claims 100,000`);
    }
  });

  it("homepage count derives from the registry", () => {
    const src = read("app/page.tsx");
    assert.ok(src.includes("TOOL_REGISTRY.length"), "homepage must render dynamic tool count");
  });
});

describe("phase 12: search routes to canonical tool URLs", () => {
  it("fuse over published tools resolves salary query to canonical route", () => {
    const index = TOOL_REGISTRY.map((t) => ({
      slug: t.slug,
      title: t.title,
      category: t.category,
      keywords: t.seo.keywords.join(" "),
    }));
    const fuse = new Fuse(index, {
      keys: ["title", "keywords"],
      threshold: 0.4,
      ignoreLocation: true,
    });
    const hits = fuse.search("salary", { limit: 5 }).map((r) => r.item);
    assert.ok(hits.length > 0, "no hits for 'salary'");
    assert.ok(hits.some((h) => h.slug === "salary-calculator"), "salary-calculator not found");
    for (const h of hits) {
      assert.match(`/tools/${h.category}/${h.slug}`, /^\/tools\/[a-z-]+\/[a-z0-9-]+$/);
    }
  });

  it("ToolSearch component exists and is client-side with no tracking", () => {
    const src = read("components/search/ToolSearch.tsx");
    assert.ok(src.includes('"use client"'), "must be a client component");
    assert.ok(src.includes("fuse.js") || src.includes("Fuse"), "must use Fuse.js");
    assert.ok(src.includes("/tools/${"), "must route to canonical internal routes");
    assert.ok(!src.includes("fetch("), "no API backend allowed");
    assert.ok(!src.includes("analytics"), "no analytics tracking of queries");
    assert.ok(!src.includes("localStorage"), "no storage of queries");
  });
});

describe("phase 12: newsletter removed, privacy accurate", () => {
  it("homepage has no fake newsletter form", () => {
    const src = read("app/page.tsx");
    assert.ok(!src.toLowerCase().includes("newsletter"), "newsletter section remains");
    assert.ok(!src.includes("Subscribe"), "fake subscribe button remains");
  });

  it("privacy makes no analytics-vendor claims and discloses ads.txt", () => {
    const src = read("app/privacy/page.tsx");
    assert.ok(!src.includes("We use analytics services"), "false analytics claim");
    assert.ok(src.includes("do not currently use"), "should state analytics are not installed");
    assert.ok(src.includes("ads.txt"), "should reference ads.txt");
    assert.ok(src.includes("AdSense"), "should disclose AdSense");
    assert.ok(src.includes("browser"), "should describe browser-local processing");
  });

  it("footer links methodology + populated categories only", () => {
    const src = read("components/layout/SiteFooter.tsx");
    assert.ok(src.includes("/methodology"), "footer missing methodology");
    assert.ok(src.includes("getPopulatedCategories"), "footer must use populated categories");
    assert.ok(!src.includes("twitter.com"), "placeholder social links remain");
    assert.ok(!src.includes("linkedin.com"), "placeholder social links remain");
  });
});

describe("phase 12: finance source visibility (page-level)", () => {
  it("every finance tool config has a Sources & verification section", () => {
    const files = [
      "config/tools/salary-calculator.config.ts",
      "config/tools/ctc-to-in-hand.config.ts",
      "config/tools/salary-hike-calculator.config.ts",
      "config/tools/pf-calculator.config.ts",
      "config/tools/gratuity-calculator.config.ts",
      "config/tools/hra-calculator.config.ts",
      "config/tools/professional-tax-calculator.config.ts",
    ];
    for (const f of files) {
      const src = read(f);
      assert.ok(src.includes("Sources & verification"), `${f} missing sources section`);
      assert.ok(!src.toLowerCase().includes("official calculator"), `${f} claims official calculator`);
      assert.ok(!src.toLowerCase().includes("government affiliation"), `${f} claims affiliation`);
    }
  });
});
