import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <h2>Acceptance of terms</h2>
        <p>
          By using {SITE_NAME} ({SITE_URL}), you agree to these Terms of Service. If you don't
          agree, please don't use the site.
        </p>

        <h2>Use of the tools</h2>
        <p>
          Our tools are provided free of charge for personal and commercial use. You're
          responsible for verifying results before relying on them for anything important --
          financial, legal, medical or otherwise. Tools like the EMI/Loan/GST calculators, BMI
          calculator, and similar are provided for general informational purposes only and are not
          a substitute for professional financial, legal, tax or medical advice.
        </p>

        <h2>No warranty</h2>
        <p>
          {SITE_NAME} is provided "as is" without warranties of any kind, express or implied. We
          don't guarantee that calculations, conversions, or generated output will be error-free,
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

        <h2>Advertising</h2>
        <p>
          {SITE_NAME} may display third-party advertising (including through Google AdSense) to
          support the free tools on this site. We don't control the specific content of
          third-party ads.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after changes
          means you accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent through our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
