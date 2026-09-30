import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME} -- how we handle data across our free online tools.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const LAST_UPDATED = "September 30, 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <h2>What this policy covers</h2>
        <p>
          {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) provides free online calculators, converters, generators and
          other utilities at {SITE_URL}. This policy explains what data is collected when you use
          our tools and this website.
        </p>

        <h2>Calculator and tool inputs</h2>
        <p>
          Calculators and converters on {SITE_NAME} run in your browser using JavaScript.
          Numbers, text or files you enter — including salary, CTC, HRA, rent, PF, gratuity,
          professional tax or tax-regime selections — are processed locally on your device.
          They are not sent to our servers, not stored by us, not included in URLs, and not
          shared with analytics or advertising providers.
        </p>

        <h2>Analytics</h2>
        <p>
          We do not currently use Google Analytics, Microsoft Clarity, or any other
          behavioural analytics service. Search queries you type into the on-site search box
          are processed locally in your browser to match tool names and descriptions; they
          are not logged, stored, or transmitted to any server.
        </p>

        <h2>Advertising and cookies</h2>
        <p>
          We display advertising through Google AdSense to support the free tools on this
          site. Google AdSense may use cookies or similar technologies to serve and measure
          ads, including personalised or non-personalised ads depending on your settings
          and region. Our publisher relationship is declared in{" "}
          <a href="/ads.txt">ads.txt</a>.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads based on
          your visits to this site and other sites on the Internet. You can opt out of
          personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google&apos;s Ads Settings
          </a>.
        </p>
        <p>
          Apart from advertising cookies set by Google and a possible dark-mode preference
          stored locally in your browser, this site does not set its own tracking cookies.
          You can control or delete cookies through your browser settings at any time.
        </p>

        <h2>Third-party services</h2>
        <p>
          Some tools rely on a third-party service to function (for example, the QR Code
          Generator sends the text you enter to an image-rendering service to produce the
          code image). Where a tool uses an external service, this is disclosed in that
          tool&apos;s own description.
        </p>

        <h2>Contact data</h2>
        <p>
          If you email us through the address on our <a href="/contact">Contact page</a>,
          we receive whatever information you choose to include in that email so we can
          respond. We do not collect email addresses through on-site forms.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          {SITE_NAME} is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on this page with
          an updated &quot;Last updated&quot; date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent through our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
