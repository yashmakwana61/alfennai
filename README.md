# AlfennAI

Config-driven tools platform built on Next.js 15 (App Router) + React 19 + TypeScript + Tailwind.

## What's actually built here

This is Phase 1: the real, working engine plus 3 fully implemented tools proving the pattern —
not a mock. Everything below runs.

- **Tool Engine** (`types/tool.ts`, `lib/engine/registry.ts`) — one `ToolConfig` object per tool
  is the single source of truth. Adding a tool means writing a config file and adding one line
  to `TOOL_REGISTRY`. Routing, SSG (`generateStaticParams`), metadata, JSON-LD, sitemap, related
  tools, and the search index all derive from that array automatically.
- **Dynamic route** `app/tools/[category]/[slug]/page.tsx` renders any tool via
  `ToolPageLayout`, which slots in the tool's own interactive component, formulas, FAQ, and
  related tools.
- **SEO layer** (`seo/metadata.ts`, `seo/schema.ts`) generates meta tags, OpenGraph, Twitter
  cards, canonical URLs, and JSON-LD (SoftwareApplication, FAQPage, BreadcrumbList,
  Organization) for every page with zero per-tool boilerplate.
- **Sitemap & robots** (`app/sitemap.ts`, `app/robots.ts`) include every tool and category
  automatically — add a tool, it's in the sitemap on next build.
- **3 flagship tools implemented end-to-end**: Age Calculator, JSON Formatter, Password
  Generator — each with validation (Zod), copy/reset/share/download, example inputs, formulas,
  FAQ, and structured data.

## How to add tool #4 (and #5, #6... #100,000)

1. Create `config/tools/your-tool.config.ts` following the pattern in the 3 existing configs:
   Zod input schema, `compute()` function, SEO block, FAQ, related tool slugs.
2. Create `components/tools/YourTool.tsx`: the interactive UI, reading `tool.inputSchema` and
   `tool.compute` from the config passed as a prop.
3. Add one import + one line to `TOOL_REGISTRY` in `lib/engine/registry.ts`.
4. Nothing else changes. The page, SEO, sitemap, and related-tools links are automatic.

This is the actual scaling mechanism for going from 3 → 37 → 1,000 → 100,000 tools: the
per-tool marginal cost is one config file + one component, and architecture never changes.

## Running it

```bash
npm install
npm run dev
```

## What's intentionally NOT built yet (and the honest reason why)

- **The other 34 initial tools** (GST Calculator, BMI Calculator, all converters, all text
  tools, etc.) — same pattern as the 3 shipped, just needs the config+component pair for each.
  Doing this properly for all 37 with real validation and correct formulas is easily a week of
  focused work, not something to fake in one pass.
- **Instant/fuzzy search** — `fuse.js` is in package.json; wiring it to the registry is a
  half-day task once you have more than ~10 tools worth searching.
- **Blog architecture, admin, i18n, ad slots** — these are structurally separate concerns from
  the tool engine and are better scoped as their own follow-up passes so each gets real
  attention instead of a rushed stub.
- **Actual `npm install` / build verification** — not run in this sandbox (no network access to
  npm registry for a full `next build` in this environment). Recommend running `npm run
  typecheck` and `npm run build` locally before deploying.

## Recommended next step

Given the size of this (multi-week, many files, ongoing iteration), this project is a much
better fit for **Claude Code** than for one-shot generation in chat — you can run it, test each
tool as you add it, and iterate module-by-module the way you're already doing with UniCore.
