"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Moon, Sun, Menu, X } from "lucide-react";
import { CATEGORY_REGISTRY } from "@/lib/engine/registry";

export function SiteHeader() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <div className="hidden flex-1 max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex dark:border-slate-800 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Search 100,000+ tools..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {CATEGORY_REGISTRY.slice(0, 5).map((c) => (
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
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
          {CATEGORY_REGISTRY.map((c) => (
            <Link key={c.slug} href={`/tools/${c.slug}`} className="block py-2 text-sm text-slate-600 dark:text-slate-300">
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
