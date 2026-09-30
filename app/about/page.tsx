import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";
import { TOOL_REGISTRY, getPopulatedCategories } from "@/lib/engine/registry";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE_NAME} -- free, fast, privacy-friendly online tools with disclosed methodology.`,
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  const populated = getPopulatedCategories();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">About {SITE_NAME}</h1>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <p>
          {SITE_NAME} is a free online tools platform: {TOOL_REGISTRY.length} calculators,
          converters, generators and utilities across {populated.length} populated categories
          ({populated.map((c) => c.name).join(", ")}), with more added regularly.
        </p>
        <h2>What the tools do</h2>
        <p>
          The site covers practical everyday work: salary and finance calculators (including
          salary, CTC to in-hand, salary hike, PF, gratuity, HRA and professional tax),
          everyday math and health calculators, text utilities, and developer tools such as
          formatters, validators and encoders. Each tool runs its calculation for you and
          explains the result — no sign-up, no clutter.
        </p>
        <h2>Why the tools exist</h2>
        <p>
          Payslips, tax regimes and labour rules are hard to interpret from raw notifications
          alone. These tools exist to turn official rules into usable estimates: enter a few
          figures you know, and get a result with its assumptions shown next to it, so you
          can sanity-check an offer letter, a payslip or a state deduction before acting on it.
        </p>
        <h2>How financial calculators are developed</h2>
        <p>
          Financial calculators are built as pure calculation functions from official rule
          material — for example, Income Tax Department slabs and rebates, EPFO contribution
          rates and wage ceilings, gratuity law, and state professional-tax schedules. Each
          engine is covered by automated tests with worked examples, and the same function
          that powers the calculator also powers the examples shown on the page, so examples
          cannot drift from the implementation.
        </p>
        <h2>How rules are verified and disclosed</h2>
        <p>
          Key assumptions are shown next to results (for instance, standard deduction only,
          no HRA/80C modelling, no surcharge, salaried resident individual below 60). Where
          a rule has a concrete verification record — such as state professional-tax rules
          verified against state portals — the page names the source. Results remain
          estimates, not official assessments. Read the full process on our{" "}
          <a href="/methodology">Methodology page</a>.
        </p>
        <h2>Corrections</h2>
        <p>
          Rules change and mistakes happen. If you find an incorrect calculation, an
          outdated rule, a broken link or a misleading statement, please report it through
          our <a href="/contact">Contact page</a> with the page URL and details. We review
          correction reports and update the affected calculator, tests and wording.
        </p>
        <p>
          Have a tool you&apos;d like to see added? Reach out through our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
