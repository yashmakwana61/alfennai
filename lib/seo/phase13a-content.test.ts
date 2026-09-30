import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { emiCalculatorTool } from "../../config/tools/emi-calculator.config";
import { gstCalculatorTool } from "../../config/tools/gst-calculator.config";
import { percentageCalculatorTool } from "../../config/tools/percentage-calculator.config";
import { ageCalculatorTool } from "../../config/tools/age-calculator.config";
import { jsonFormatterTool } from "../../config/tools/json-formatter.config";
import { jsonValidatorTool } from "../../config/tools/json-validator.config";
import { wordCounterTool } from "../../config/tools/word-counter.config";
import { characterCounterTool } from "../../config/tools/character-counter.config";
import { getToolBySlug } from "../engine/registry";
import { buildToolMetadata, SITE_URL, SITE_NAME } from "../../seo/metadata";
import {
  buildSoftwareApplicationSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
} from "../../seo/schema";
import type { ToolConfig } from "../../types/tool";

const TARGETS: Array<{ slug: string; tool: ToolConfig }> = [
  { slug: "emi-calculator", tool: emiCalculatorTool as unknown as ToolConfig },
  { slug: "gst-calculator", tool: gstCalculatorTool as unknown as ToolConfig },
  { slug: "percentage-calculator", tool: percentageCalculatorTool as unknown as ToolConfig },
  { slug: "age-calculator", tool: ageCalculatorTool as unknown as ToolConfig },
  { slug: "json-formatter", tool: jsonFormatterTool as unknown as ToolConfig },
  { slug: "json-validator", tool: jsonValidatorTool as unknown as ToolConfig },
  { slug: "word-counter", tool: wordCounterTool as unknown as ToolConfig },
  { slug: "character-counter", tool: characterCounterTool as unknown as ToolConfig },
];

const LINK_PATTERN = /\[([^\]]+)\]\((\/tools\/[^)\s]+)\)/g;
const BANNED_ANCHORS = ["click here", "learn more", "this tool", "our calculator"];
const BANNED_CLAIMS = ["best calculator", "#1", "most accurate", "testimonial", "guaranteed approval"];

function collectText(tool: ToolConfig): string[] {
  const out: string[] = [...(tool.intro ?? []), tool.longDescription];
  for (const s of tool.contentSections ?? []) {
    out.push(...(s.paragraphs ?? []), ...(s.list ?? []));
  }
  for (const f of tool.faq) out.push(f.question, f.answer);
  return out;
}

describe("phase 13a: target pages carry real content structure", () => {
  it("all 8 tools are registered under their existing routes", () => {
    const expected: Record<string, string> = {
      "emi-calculator": "finance",
      "gst-calculator": "finance",
      "percentage-calculator": "calculators",
      "age-calculator": "calculators",
      "json-formatter": "developer-tools",
      "json-validator": "developer-tools",
      "word-counter": "text-tools",
      "character-counter": "text-tools",
    };
    for (const { slug, tool } of TARGETS) {
      const reg = getToolBySlug(slug);
      assert.ok(reg, `${slug} missing from registry`);
      assert.equal(reg.category, expected[slug], `${slug} moved category`);
      assert.equal(tool.slug, slug);
    }
  });

  it("each target has intro, worked example section and 4-7 FAQs", () => {
    for (const { slug, tool } of TARGETS) {
      assert.ok((tool.intro ?? []).length >= 1, `${slug} missing intro`);
      const headings = (tool.contentSections ?? []).map((s) => s.heading);
      assert.ok(
        headings.some((h) => /worked example/i.test(h)),
        `${slug} missing worked-example section`
      );
      assert.ok(
        tool.faq.length >= 4 && tool.faq.length <= 7,
        `${slug} has ${tool.faq.length} FAQs (want 4-7)`
      );
    }
  });

  it("no banned marketing claims on target pages", () => {
    for (const { slug, tool } of TARGETS) {
      const text = collectText(tool).join("\n").toLowerCase();
      for (const claim of BANNED_CLAIMS) {
        assert.ok(!text.includes(claim), `${slug} contains banned claim "${claim}"`);
      }
    }
  });
});

describe("phase 13a: documented examples match engine output", () => {
  it("emi worked example (5L @ 9.5% x 60)", () => {
    const r = emiCalculatorTool.compute({ principal: 500000, annualRate: 9.5, tenureMonths: 60 });
    assert.ok(Math.abs(r.emi - 10500.93) < 0.01, `emi drift: ${r.emi}`);
    assert.ok(Math.abs(r.totalInterest - 130055.84) < 0.01, `interest drift: ${r.totalInterest}`);
    assert.ok(Math.abs(r.totalPayment - 630055.84) < 0.01, `total drift: ${r.totalPayment}`);
    const text = collectText(emiCalculatorTool as unknown as ToolConfig).join(" ");
    assert.ok(text.includes("10,501") && text.includes("1,30,056") && text.includes("6,30,056"));
  });

  it("gst worked examples mirror each other", () => {
    const excl = gstCalculatorTool.compute({ amount: 10000, gstRate: 18, mode: "exclusive" });
    assert.deepEqual(excl, { baseAmount: 10000, gstAmount: 1800, totalAmount: 11800 });
    const incl = gstCalculatorTool.compute({ amount: 11800, gstRate: 18, mode: "inclusive" });
    assert.deepEqual(incl, { baseAmount: 10000, gstAmount: 1800, totalAmount: 11800 });
  });

  it("percentage modes produce documented values", () => {
    assert.equal(percentageCalculatorTool.compute({ mode: "of", x: 20, y: 150 }).result, 30);
    assert.equal(percentageCalculatorTool.compute({ mode: "isWhatPercent", x: 42, y: 60 }).result, 70);
    assert.equal(percentageCalculatorTool.compute({ mode: "percentChange", x: 50000, y: 57500 }).result, 15);
    assert.equal(percentageCalculatorTool.compute({ mode: "percentChange", x: 200, y: 150 }).result, -25);
  });

  it("age worked example is deterministic with fixed compare date", () => {
    const r = ageCalculatorTool.compute({ birthDate: "1995-06-15", compareDate: "2026-09-30" });
    assert.deepEqual(
      { years: r.years, months: r.months, days: r.days },
      { years: 31, months: 3, days: 15 }
    );
    assert.equal(r.totalDays, 11430);
  });

  it("json formatter pretty + minified outputs", () => {
    const pretty = jsonFormatterTool.compute({ raw: '{"name":"AlfennAI","tools":37,"active":true}', indent: 2 });
    assert.equal(pretty.valid, true);
    assert.equal(pretty.formatted, '{\n  "name": "AlfennAI",\n  "tools": 37,\n  "active": true\n}');
    const min = jsonFormatterTool.compute({ raw: '{"a": 1, "b": [1,2]}', indent: 0 });
    assert.equal(min.formatted, '{"a":1,"b":[1,2]}');
    assert.equal(jsonFormatterTool.compute({ raw: '{"a":1,}', indent: 2 }).valid, false);
  });

  it("json validator verdicts with line location", () => {
    const ok = jsonValidatorTool.compute({ raw: '{"valid": true}' });
    assert.deepEqual(ok, { valid: true, keyCount: 1 });
    const bad = jsonValidatorTool.compute({ raw: '{"a":1,}' });
    assert.equal(bad.valid, false);
    assert.equal(bad.errorLine, 1);
  });

  it("word counter fox sentence", () => {
    const r = wordCounterTool.compute({ text: "The quick brown fox jumps over the lazy dog." });
    assert.deepEqual(r, {
      words: 9,
      characters: 44,
      charactersNoSpaces: 36,
      sentences: 1,
      paragraphs: 1,
      readingTimeMinutes: 1,
    });
  });

  it("character counter hello example", () => {
    const r = characterCounterTool.compute({ text: "Hello, AlfennAI!", limit: 280 });
    assert.deepEqual(r, { total: 16, noSpaces: 15, digits: 0, letters: 13, remaining: 264 });
  });
});

describe("phase 13a: seo metadata stays clean", () => {
  it("titles unique, suffix-free; canonicals correct; index/follow", () => {
    const titles = new Set<string>();
    for (const { slug, tool } of TARGETS) {
      assert.ok(!tool.seo.metaTitle.includes(SITE_NAME), `${slug} embeds site suffix`);
      assert.ok(!titles.has(tool.seo.metaTitle), `duplicate title: ${tool.seo.metaTitle}`);
      titles.add(tool.seo.metaTitle);
      const meta = buildToolMetadata(tool);
      const canonical = (meta.alternates as { canonical?: string })?.canonical ?? "";
      assert.equal(canonical, `${SITE_URL}/tools/${tool.category}/${tool.slug}`);
      const robots = meta.robots as { index?: boolean; follow?: boolean };
      assert.equal(robots?.index, true, `${slug} not indexable`);
      assert.equal(robots?.follow, true, `${slug} not followable`);
    }
  });
});

describe("phase 13a: internal links resolve", () => {
  it("every new inline link and related slug resolves to a real route", () => {
    let inlineCount = 0;
    for (const { slug, tool } of TARGETS) {
      for (const s of tool.relatedToolSlugs) {
        assert.ok(getToolBySlug(s), `unresolved related slug ${s} in ${slug}`);
      }
      for (const text of collectText(tool)) {
        for (const m of text.matchAll(LINK_PATTERN)) {
          const href = m[2];
          const match = href.match(/^\/tools\/([^/]+)\/([^/]+)$/);
          assert.ok(match, `malformed href ${href} in ${slug}`);
          const target = getToolBySlug(match[2]);
          assert.ok(target, `unresolved link ${href} in ${slug}`);
          assert.equal(target.category, match[1], `wrong category for ${href} in ${slug}`);
          assert.ok(
            !BANNED_ANCHORS.includes(m[1].toLowerCase()),
            `banned anchor "${m[1]}" in ${slug}`
          );
          inlineCount += 1;
        }
      }
    }
    assert.ok(inlineCount >= 8, `expected >= 8 inline links, found ${inlineCount}`);
  });

  it("emi links loan + percentage; json pair cross-links; counters cross-link", () => {
    assert.deepEqual((emiCalculatorTool as unknown as ToolConfig).relatedToolSlugs, [
      "loan-calculator",
      "percentage-calculator",
    ]);
    const has = (t: ToolConfig, href: string) =>
      collectText(t).join(" ").includes(href);
    assert.ok(has(jsonFormatterTool as unknown as ToolConfig, "/tools/developer-tools/json-validator"));
    assert.ok(has(jsonValidatorTool as unknown as ToolConfig, "/tools/developer-tools/json-formatter"));
    assert.ok(has(wordCounterTool as unknown as ToolConfig, "/tools/text-tools/character-counter"));
    assert.ok(has(characterCounterTool as unknown as ToolConfig, "/tools/text-tools/word-counter"));
  });
});

describe("phase 13a: schema stays truthful", () => {
  it("faq schema mirrors visible faqs; no ratings/reviews anywhere", () => {
    for (const { slug, tool } of TARGETS) {
      const faq = buildFAQSchema(tool);
      assert.ok(faq, `${slug} missing FAQ schema`);
      assert.equal(
        (faq as { mainEntity: unknown[] }).mainEntity.length,
        tool.faq.length,
        `${slug} schema/visible FAQ mismatch`
      );
      const sw = JSON.stringify(buildSoftwareApplicationSchema(tool));
      assert.ok(!sw.includes("aggregateRating"), `${slug} has rating schema`);
      const crumb = JSON.stringify(
        buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: String(tool.category), path: `/tools/${tool.category}` },
          { name: tool.title, path: `/tools/${tool.category}/${tool.slug}` },
        ])
      );
      assert.ok(crumb.includes("BreadcrumbList"));
    }
  });
});
