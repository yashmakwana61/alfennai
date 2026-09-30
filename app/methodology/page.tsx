import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";
import { buildBreadcrumbSchema } from "@/seo/schema";

export const metadata: Metadata = {
  title: "Methodology",
  description: `How ${SITE_NAME} designs, verifies and tests its financial calculators -- formulas, official sources, assumptions and corrections.`,
  alternates: { canonical: `${SITE_URL}/methodology` },
};

const LAST_UPDATED = "September 30, 2026";

export default function MethodologyPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Methodology", path: "/methodology" },
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Methodology</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <p>
          This page explains how calculators on {SITE_NAME} are designed, where their rules
          come from, what they assume, how they are tested, and how errors get fixed. It
          applies across the site, with finance examples drawn from the salary, HRA, PF,
          gratuity and professional tax calculators.
        </p>

        <h2>1. How calculations are designed</h2>
        <p>
          Each calculator is a pure function: the same inputs always produce the same
          outputs, with no network calls, no storage and no logging. Calculations run
          entirely in your browser. Inputs such as salary, CTC, HRA, rent, PF amounts or
          tax-regime choices never leave your device.
        </p>

        <h2>2. How formulas are selected</h2>
        <p>
          Formulas follow the governing rule, not a shortcut. Examples: take-home pay is
          gross salary minus employee deductions minus estimated income tax; HRA exemption
          is the least of actual HRA, rent minus 10% of salary, and the metro/non-metro
          location limit; gratuity for monthly-rated employees is monthly wage ÷ 26 × 15
          per qualifying year; PF contributions are wage × rate for employee and employer
          separately, with an optional wage ceiling.
        </p>

        <h2>3. How official sources are used</h2>
        <p>
          Finance rules are taken from authoritative publications: Income Tax Department
          material for slabs, rebates, standard deduction and cess; EPFO material and the
          Code on Social Security framework (with Ministry of Labour &amp; Employment /
          Gazette notifications) for PF rates and wage ceilings; gratuity law for the
          15-day rate, the &quot;in excess of six months&quot; rounding rule and eligibility
          assumptions; and state commercial-tax / profession-tax portals for state
          professional-tax slabs and schedules. Pages name their sources where a concrete
          verification record exists — for example:
        </p>
        <ul>
          <li>
            <a href="/tools/finance/salary-calculator">Salary Calculator</a> — Income Tax
            Department slabs and rebate rules for FY 2024-25 through FY 2026-27.
          </li>
          <li>
            <a href="/tools/finance/hra-calculator">HRA Calculator</a> — Section 10(13A)
            exemption structure (old regime only; no exemption under the new regime).
          </li>
          <li>
            <a href="/tools/finance/pf-calculator">PF Calculator</a> — EPFO 12% contribution
            rates with a configurable wage ceiling.
          </li>
          <li>
            <a href="/tools/finance/gratuity-calculator">Gratuity Calculator</a> — statutory
            rate, eligibility assumptions and rounding; no invented cap.
          </li>
          <li>
            <a href="/tools/finance/professional-tax-calculator">Professional Tax Calculator</a> —
            state schedules with per-state source labels and verification dates shown in the result.
          </li>
        </ul>
        <p>
          These calculators are independent estimates. They are not official calculators and
          the site has no government affiliation.
        </p>

        <h2>4. How effective dates are handled</h2>
        <p>
          Tax calculators ask for the financial year because slabs and rebates change
          between years (for example, salary earned April 2026–March 2027 is FY 2026-27).
          Where a rule changed mid-year — such as a wage ceiling taking effect partway
          through a financial year — the calculator estimates one representative current
          period with a configurable input instead of reconstructing earlier months.
        </p>

        <h2>5. How assumptions are disclosed</h2>
        <p>
          Every finance result shows its key assumptions next to the numbers: which standard
          deduction was applied, that HRA exemption and detailed 80C/80D deductions are not
          modelled, that surcharge is excluded, that the model covers a salaried resident
          individual below 60, and where employer-side components are estimated rather than
          known. Professional tax is subtracted from take-home pay but not from taxable
          income in the simplified model.
        </p>

        <h2>6. How calculations are tested</h2>
        <p>
          Each finance engine has automated tests covering worked examples, boundary cases
          (such as the six-month gratuity rounding rule or rebate thresholds), invalid
          inputs, and the finance-cluster internal-link graph. Worked examples on the page
          are computed by the same function as the calculator, so displayed numbers cannot
          drift from the implementation.
        </p>

        <h2>7. How financial rules are re-verified</h2>
        <p>
          Rule data carries verification context in the codebase (for example, per-state
          verification dates for professional tax). When an official rule changes, the
          engine constants, tests and page wording are updated together. Pages show a
          last-verified date only where an actual verification record exists; freshness is
          never fabricated.
        </p>

        <h2>8. How users can report errors</h2>
        <p>
          If you find an incorrect calculation, an outdated rule, a broken link or a
          misleading statement, email us via the <a href="/contact">Contact page</a> with
          the page URL, the inputs you used and what you expected. Correction reports are
          reviewed against official sources and, when confirmed, the engine, tests and
          wording are corrected.
        </p>

        <h2>9. Why results are estimates</h2>
        <p>
          Real payroll depends on your employer&apos;s exact salary structure, exemption claims,
          TDS timing and scheme treatment — details no simplified web calculator can fully
          reproduce. Treat every result as an estimate to sanity-check offers and payslips,
          and verify regulated decisions against official sources or a qualified professional.
          Nothing here is financial, tax or legal advice.
        </p>
      </div>
    </main>
  );
}
