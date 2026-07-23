import Link from "next/link";
import { CATEGORY_REGISTRY, TOOL_REGISTRY } from "@/lib/engine/registry";

export function SiteFooter() {
  const popularTools = TOOL_REGISTRY.slice(0, 6);

  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {CATEGORY_REGISTRY.slice(0, 6).map((c) => (
              <li key={c.slug}><Link href={`/tools/${c.slug}`} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Popular tools</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {popularTools.map((t) => (
              <li key={t.slug}><Link href={`/tools/${t.category}/${t.slug}`} className="hover:text-primary">{t.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Follow us</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="https://twitter.com" className="hover:text-primary">Twitter / X</a></li>
            <li><a href="https://linkedin.com" className="hover:text-primary">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} AlfennAI. All rights reserved.
      </div>
    </footer>
  );
}
