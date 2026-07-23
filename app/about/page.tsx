import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";
import { TOOL_REGISTRY, CATEGORY_REGISTRY } from "@/lib/engine/registry";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE_NAME} -- free, fast, privacy-friendly online tools.`,
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">About {SITE_NAME}</h1>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <p>
          {SITE_NAME} is a free online tools platform: {TOOL_REGISTRY.length} calculators,
          converters, generators and utilities across {CATEGORY_REGISTRY.length} categories, with
          more added regularly.
        </p>
        <p>
          Most tools run entirely in your browser -- your input is processed on your device and
          isn't sent to a server, so you can use them without creating an account or worrying
          about what happens to your data.
        </p>
        <p>
          The site is built to be fast, clean, and genuinely useful, without the clutter and
          pop-ups common on many free tool sites. We keep advertising minimal and clearly
          separated from the tools themselves.
        </p>
        <p>
          Have a tool you'd like to see added? Reach out through our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
