import Link from "next/link";
import { TOOL_REGISTRY, getPopulatedCategories } from "@/lib/engine/registry";
import { AdSlot } from "@/components/ads/AdSlot";

export function SiteFooter() {
  const popularTools = TOOL_REGISTRY.slice(0, 6);
  const populatedCategories = getPopulatedCategories().slice(0, 6);

  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <AdSlot label="Footer ad" minHeight={90} />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <nav aria-label="Company">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/methodology" className="hover:text-primary">Methodology</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </nav>
        <nav aria-label="Categories">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {populatedCategories.map((c) => (
              <li key={c.slug}><Link href={`/tools/${c.slug}`} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Popular tools">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Popular tools</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {popularTools.map((t) => (
              <li key={t.slug}><Link href={`/tools/${t.category}/${t.slug}`} className="hover:text-primary">{t.title}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Finance calculators">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Finance</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/tools/finance/salary-calculator" className="hover:text-primary">Salary Calculator</Link></li>
            <li><Link href="/tools/finance/ctc-to-in-hand" className="hover:text-primary">CTC to In-Hand</Link></li>
            <li><Link href="/tools/finance/pf-calculator" className="hover:text-primary">PF Calculator</Link></li>
            <li><Link href="/tools/finance/gratuity-calculator" className="hover:text-primary">Gratuity Calculator</Link></li>
            <li><Link href="/tools/finance/hra-calculator" className="hover:text-primary">HRA Calculator</Link></li>
            <li><Link href="/tools/finance" className="hover:text-primary">All finance tools →</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} AlfennAI. All rights reserved.
      </div>
    </footer>
  );
}
