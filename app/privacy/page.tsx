import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME} -- how we handle data across our free online tools.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <h2>What this policy covers</h2>
        <p>
          {SITE_NAME} ("we", "us") provides free online calculators, converters, generators and
          other utilities at {SITE_URL}. This policy explains what data is collected when you use
          our tools and this website.
        </p>

        <h2>Tool data</h2>
        <p>
          Almost every tool on {SITE_NAME} runs entirely in your browser. Text, numbers, files or
          any other input you type into a tool is processed locally on your device using
          JavaScript and is not transmitted to our servers, unless a specific tool's description
          explicitly states otherwise (for example, our QR Code Generator sends the text you enter
          to a third-party rendering service to produce the image).
        </p>

        <h2>Analytics and advertising</h2>
        <p>
          We use analytics services (such as Google Analytics and Microsoft Clarity) to understand
          how visitors use the site, and we may display advertising through Google AdSense.
          These services may use cookies or similar technologies to collect information such as
          your IP address, browser type, device type, and pages visited, and to serve
          personalized or non-personalized ads.
        </p>
        <p>
          Google's use of advertising cookies enables it and its partners to serve ads based on
          your visits to this site and other sites on the Internet. You can opt out of
          personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google's Ads Settings
          </a>.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies to remember preferences (such as dark mode) and to support analytics and
          advertising as described above. You can control or delete cookies through your browser
          settings at any time.
        </p>

        <h2>Third-party services</h2>
        <p>
          Some tools rely on third-party services to function (for example, QR code image
          generation). When a tool uses an external service, this is disclosed in that tool's own
          description and FAQ.
        </p>

        <h2>Children's privacy</h2>
        <p>
          {SITE_NAME} is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on this page with
          an updated "Last updated" date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent through our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
