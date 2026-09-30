"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { TOOL_REGISTRY, getCategoryBySlug } from "@/lib/engine/registry";

interface Props {
  variant?: "hero" | "header";
  placeholder?: string;
}

const SEARCH_INDEX = TOOL_REGISTRY.map((t) => ({
  slug: t.slug,
  title: t.title,
  category: t.category,
  categoryName: getCategoryBySlug(t.category)?.name ?? t.category,
  shortDescription: t.shortDescription,
  keywords: t.seo.keywords.join(" "),
}));

/**
 * Phase 12: real client-side tool search over published tools only.
 * No API, no server transmission, no storage, no query tracking.
 * Enter/click navigates to the canonical tool route.
 */
export function ToolSearch({ variant = "hero", placeholder }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = variant === "hero" ? "tool-search-results" : "tool-search-results-header";

  const fuse = useMemo(
    () =>
      new Fuse(SEARCH_INDEX, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "keywords", weight: 0.25 },
          { name: "shortDescription", weight: 0.15 },
          { name: "categoryName", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    []
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return fuse.search(q, { limit: 8 }).map((r) => r.item);
  }, [query, fuse]);

  function goTo(slug: string, category: string) {
    router.push(`/tools/${category}/${slug}`);
    setOpen(false);
  }

  const isHero = variant === "hero";

  return (
    <div className={isHero ? "relative mx-auto mt-8 max-w-lg" : "relative hidden max-w-md flex-1 md:block"}>
      <div
        className={
          isHero
            ? "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            : "flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900"
        }
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <label htmlFor={isHero ? "tool-search" : "tool-search-header"} className="sr-only">
          Search tools
        </label>
        <input
          ref={inputRef}
          id={isHero ? "tool-search" : "tool-search-header"}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder ?? `Search ${TOOL_REGISTRY.length} free tools...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && results.length > 0) {
              e.preventDefault();
              setHighlight((h) => (h + 1) % results.length);
            } else if (e.key === "ArrowUp" && results.length > 0) {
              e.preventDefault();
              setHighlight((h) => (h - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              if (results.length > 0) {
                const target = results[highlight] ?? results[0];
                goTo(target.slug, target.category);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400" role="status">
              No tools match &ldquo;{query.trim()}&rdquo;. Try &ldquo;salary&rdquo;, &ldquo;password&rdquo; or &ldquo;json&rdquo;.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Matching tools">
              {results.map((r, i) => (
                <li key={r.slug} role="option" aria-selected={i === highlight}>
                  <Link
                    href={`/tools/${r.category}/${r.slug}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`block px-5 py-3 ${i === highlight ? "bg-slate-50 dark:bg-slate-800/60" : ""}`}
                  >
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">{r.title}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {r.categoryName} &middot; {r.shortDescription.slice(0, 80)}
                      {r.shortDescription.length > 80 ? "..." : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
