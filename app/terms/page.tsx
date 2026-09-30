import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE_NAME} -- estimates, accuracy and acceptable use.`,
  alternates: { canonical: `${SITE_URL}/terms` },
};

const LAST_UPDATED = "September 30, 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <h2>Acceptance of terms</h2>
        <p>
          By using {SITE_NAME} ({SITE_URL}), you agree to these Terms of Service. If you don&apos;t
          agree, please don&apos;t use the site.
        </p>

        <h2>Calculators are estimates</h2>
        <p>
          Calculators on this site — including salary, CTC to in-hand, salary hike, PF,
          gratuity, HRA and professional tax calculators — produce estimates based on
          simplified models of official rules, unless a specific page explicitly states
          otherwise. Results do not constitute professional financial, tax or legal advice.
        </p>
        <p>
          Tax slabs, rebates, wage ceilings, gratuity rules and state professional-tax
          schedules can change. You should verify regulated financial and tax rules against
          official sources (such as the Income Tax Department, EPFO, the Ministry of Labour
          &amp; Employment, or the relevant state commercial-tax department) or a qualified
          professional before relying on any result for payroll, filing or employment decisions.
        </p>

        <h2>Accuracy</h2>
        <p>
          We work to keep formulas, rule data and explanations accurate and tested, and we
          disclose key assumptions next to results. Even so, site content can contain errors,
          become outdated, or differ from your employer&apos;s payroll treatment. You are
          responsible for verifying results before relying on them for anything important —
          financial, legal, medical or otherwise.
        </p>

        <h2>No warranty</h2>
        <p>
          {SITE_NAME} is provided &quot;as is&quot; without warranties of any kind, express or implied. We
          don&apos;t guarantee that calculations, conversions, or generated output will be error-free,
          uninterrupted, or fit for any particular purpose.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE_NAME} and its operators are not liable for
          any direct, indirect, incidental or consequential damages arising from your use of, or
          inability to use, the site or its tools.
        </p>

        <h2>Prohibited use</h2>
        <p>
          You agree not to use {SITE_NAME} to violate any law, to attempt to disrupt or overload
          our infrastructure, or to scrape or republish our content at scale without permission.
        </p>

        <h2>Advertising and third-party links</h2>
        <p>
          {SITE_NAME} may display third-party advertising (including through Google AdSense) to
          support the free tools on this site. We don&apos;t control the specific content of
          third-party ads. Links to official government sources are provided for information
          only and do not imply affiliation or endorsement.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after changes
          means you accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms, or reports of incorrect calculations and outdated rules,
          can be sent through our <a href="/contact">Contact page</a>. Please include the page
          URL and details of the issue.
        </p>
      </div>
    </main>
  );
}
