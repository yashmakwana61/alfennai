import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_URL, SITE_NAME } from "@/seo/metadata";
import { buildOrganizationSchema } from "@/seo/schema";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} - Free Online Tools`, template: `%s | ${SITE_NAME}` },
  description:
    "Free, fast, beautifully designed online tools: calculators, converters, generators and developer utilities. No sign-up required.",
  openGraph: { type: "website", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = buildOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9353643107968420"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
