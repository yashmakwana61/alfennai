"use client";

import { useEffect, useState } from "react";
import type { ToolConfig } from "@/types/tool";

interface Props {
  slug: string;
}

/**
 * Explicit static import map, one entry per tool. Each arrow function is a
 * separate dynamic import() call with a literal string path, so webpack can
 * always code-split it into its own chunk -- this is deliberately NOT a
 * single template-literal import(`.../${slug}.config`) call, since that
 * relies on webpack's "context module" resolution behaving correctly with
 * path aliases, which isn't guaranteed across every bundler/hosting setup.
 *
 * When adding tool #38, add one line here alongside the registry.ts entry.
 */
const TOOL_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {
  "age-calculator": () => import("@/config/tools/age-calculator.config"),
  "base64-decode": () => import("@/config/tools/base64-decode.config"),
  "base64-encode": () => import("@/config/tools/base64-encode.config"),
  "bmi-calculator": () => import("@/config/tools/bmi-calculator.config"),
  "case-converter": () => import("@/config/tools/case-converter.config"),
  "character-counter": () => import("@/config/tools/character-counter.config"),
  "color-picker": () => import("@/config/tools/color-picker.config"),
  "css-minifier": () => import("@/config/tools/css-minifier.config"),
  "date-difference": () => import("@/config/tools/date-difference.config"),
  "discount-calculator": () => import("@/config/tools/discount-calculator.config"),
  "emi-calculator": () => import("@/config/tools/emi-calculator.config"),
  "gst-calculator": () => import("@/config/tools/gst-calculator.config"),
  "hash-generator": () => import("@/config/tools/hash-generator.config"),
  "html-formatter": () => import("@/config/tools/html-formatter.config"),
  "javascript-minifier": () => import("@/config/tools/javascript-minifier.config"),
  "json-formatter": () => import("@/config/tools/json-formatter.config"),
  "json-validator": () => import("@/config/tools/json-validator.config"),
  "jwt-decoder": () => import("@/config/tools/jwt-decoder.config"),
  "jwt-encoder": () => import("@/config/tools/jwt-encoder.config"),
  "loan-calculator": () => import("@/config/tools/loan-calculator.config"),
  "lorem-ipsum": () => import("@/config/tools/lorem-ipsum.config"),
  "margin-calculator": () => import("@/config/tools/margin-calculator.config"),
  "markdown-preview": () => import("@/config/tools/markdown-preview.config"),
  "password-generator": () => import("@/config/tools/password-generator.config"),
  "percentage-calculator": () => import("@/config/tools/percentage-calculator.config"),
  "profit-calculator": () => import("@/config/tools/profit-calculator.config"),
  "qr-generator": () => import("@/config/tools/qr-generator.config"),
  "random-generator": () => import("@/config/tools/random-generator.config"),
  "regex-tester": () => import("@/config/tools/regex-tester.config"),
  "remove-duplicate-lines": () => import("@/config/tools/remove-duplicate-lines.config"),
  "slug-generator": () => import("@/config/tools/slug-generator.config"),
  "text-cleaner": () => import("@/config/tools/text-cleaner.config"),
  "time-calculator": () => import("@/config/tools/time-calculator.config"),
  "url-decoder": () => import("@/config/tools/url-decoder.config"),
  "url-encoder": () => import("@/config/tools/url-encoder.config"),
  "uuid-generator": () => import("@/config/tools/uuid-generator.config"),
  "word-counter": () => import("@/config/tools/word-counter.config"),
};

/**
 * ToolPageLayout (a Server Component) can't pass the full tool config to a
 * Client Component prop -- it contains a Zod schema instance and a compute
 * function, neither of which are serializable across the RSC boundary.
 *
 * Instead we pass only the slug (a plain string) down, and this client
 * component dynamically imports that one tool's config file itself. The
 * rich object is constructed entirely client-side, so it never needs to
 * cross the server/client boundary. This also means each tool page's
 * client bundle only ever loads the one tool it needs, not all 37 (or,
 * eventually, all 100,000).
 */
export function ToolRuntime({ slug }: Props) {
  const [tool, setTool] = useState<ToolConfig | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loader = TOOL_LOADERS[slug];
    if (!loader) {
      setNotFound(true);
      return;
    }
    loader().then((mod) => {
      if (cancelled) return;
      const toolConfig = Object.values(mod)[0] as ToolConfig;
      setTool(toolConfig);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return <p className="text-sm text-error">Tool not found.</p>;
  }

  if (!tool) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        Loading tool...
      </div>
    );
  }

  const Component = tool.component;
  return <Component tool={tool} />;
}
