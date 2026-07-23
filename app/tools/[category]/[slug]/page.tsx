import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getToolBySlug,
  getAllToolSlugsWithCategory,
  getRelatedTools,
  getCategoryBySlug,
} from "@/lib/engine/registry";
import { buildToolMetadata } from "@/seo/metadata";
import {
  buildSoftwareApplicationSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
} from "@/seo/schema";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Pre-render every known tool at build time (SSG). New tools added to the
// registry are automatically included here -- no code changes required.
export function generateStaticParams() {
  return getAllToolSlugsWithCategory();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return buildToolMetadata(tool);
}

export default async function ToolPage({ params }: PageProps) {
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);
  const toolCategory = getCategoryBySlug(category);

  if (!tool || !toolCategory || tool.category !== category) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool);

  const softwareSchema = buildSoftwareApplicationSchema(tool);
  const faqSchema = buildFAQSchema(tool);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: toolCategory.name, path: `/tools/${toolCategory.slug}` },
    { name: tool.title, path: `/tools/${tool.category}/${tool.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ToolPageLayout tool={tool} category={toolCategory} relatedTools={relatedTools} />
    </>
  );
}
