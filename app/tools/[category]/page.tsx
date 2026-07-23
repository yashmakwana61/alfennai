import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORY_REGISTRY, getCategoryBySlug, getToolsByCategory } from "@/lib/engine/registry";
import { buildCategoryMetadata } from "@/seo/metadata";
import { buildBreadcrumbSchema } from "@/seo/schema";
import type { ToolCategorySlug } from "@/types/tool";

interface PageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORY_REGISTRY.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  return buildCategoryMetadata(cat);
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const tools = getToolsByCategory(category as ToolCategorySlug);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: cat.name, path: `/tools/${cat.slug}` },
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{cat.description}</p>

      {tools.length === 0 ? (
        <p className="mt-10 text-slate-500 dark:text-slate-400">
          Tools in this category are coming soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.category}/${tool.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="font-medium text-slate-900 dark:text-white">{tool.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.shortDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
