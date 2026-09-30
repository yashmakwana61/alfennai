"use client";

import Link from "next/link";
import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { getPopulatedCategories } from "@/lib/engine/registry";
import { ToolSearch } from "@/components/search/ToolSearch";

export function SiteHeader() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const populatedCategories = getPopulatedCategories();

  function toggleDark() {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-background-dark/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Alfenn<span className="text-primary">AI</span>
        </Link>

        <ToolSearch variant="header" />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          <Link href="/agents" className="text-sm font-medium text-slate-600 transition hover:text-primary dark:text-slate-300">
            AI Agents
          </Link>
          {populatedCategories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/tools/${c.slug}`}
              className="text-sm font-medium text-slate-600 transition hover:text-primary dark:text-slate-300"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
          <div className="pb-2 md:hidden">
            <ToolSearch variant="hero" placeholder="Search tools..." />
          </div>
          <Link href="/agents" className="block py-2 text-sm font-medium text-primary">
            AI Agents
          </Link>
          {populatedCategories.map((c) => (
            <Link key={c.slug} href={`/tools/${c.slug}`} className="block py-2 text-sm text-slate-600 dark:text-slate-300">
              {c.name}
            </Link>
          ))}
          <Link href="/methodology" className="block py-2 text-sm text-slate-600 dark:text-slate-300">
            Methodology
          </Link>
        </div>
      )}
    </header>
  );
}
