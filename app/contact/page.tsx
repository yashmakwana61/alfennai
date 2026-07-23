import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE_NAME} team.`,
  alternates: { canonical: `${SITE_URL}/contact` },
};

// TODO: replace with your real support/contact email before going live.
const CONTACT_EMAIL = "hello@alfennai.com";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Contact us</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Found a bug, have a tool request, or a business inquiry? We'd love to hear from you.
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
      </a>
    </main>
  );
}
