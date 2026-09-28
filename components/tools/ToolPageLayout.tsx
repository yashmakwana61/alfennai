import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ToolConfig, ToolCategory } from "@/types/tool";
import { ToolRuntime } from "@/components/tools/ToolRuntime";
import { AdSlot } from "@/components/ads/AdSlot";

interface Props {
  tool: ToolConfig;
  category: ToolCategory;
  relatedTools: ToolConfig[];
}

export function ToolPageLayout({ tool, category, relatedTools }: Props) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href={`/tools/${category.slug}`} className="hover:text-primary">{category.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-slate-900 dark:text-white" aria-current="page">{tool.title}</span>
      </nav>

      {/* Title */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {tool.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {tool.shortDescription}
        </p>
        {tool.intro && tool.intro.length > 0 && (
          <div className="mt-4 max-w-2xl space-y-3 text-slate-600 dark:text-slate-300">
            {tool.intro.map((paragraph, i) => (
              <p key={i} className="leading-relaxed">{paragraph}</p>
            ))}
          </div>
        )}
      </header>

      {/* The actual interactive tool (from the tool's own component) */}
      <section
        aria-label={`${tool.title} tool`}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8"
      >
        <ToolRuntime slug={tool.slug} />
      </section>

      {/* How it works / long description */}
      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How it works</h2>
        {tool.longDescription.split("\n\n").map((paragraph, i) => (
          <p key={i} className="leading-relaxed text-slate-600 dark:text-slate-300">{paragraph}</p>
        ))}
      </section>

      {/* Editorial content sections */}
      {tool.contentSections && tool.contentSections.length > 0 && (
        <>
          {tool.contentSections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.heading}</h2>
              {section.paragraphs?.map((paragraph, i) => (
                <p key={i} className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{paragraph}</p>
              ))}
              {section.list && section.list.length > 0 && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-slate-600 dark:text-slate-300">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60">
                        {section.table.headers.map((header) => (
                          <th key={header} scope="col" className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, i) => (
                        <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                          {row.map((cell, j) => (
                            j === 0 ? (
                              <th key={j} scope="row" className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                {cell}
                              </th>
                            ) : (
                              <td key={j} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                {cell}
                              </td>
                            )
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </>
      )}

      <div className="mt-10">
        <AdSlot label="Inline ad" minHeight={120} />
      </div>

      {/* Formulas */}
      {tool.formulas && tool.formulas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Formula</h2>
          <div className="mt-4 space-y-4">
            {tool.formulas.map((f) => (
              <div key={f.label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="font-mono text-sm text-primary">{f.expression}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {tool.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {tool.faq.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none font-medium text-slate-900 dark:text-white">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Related tools</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {relatedTools.map((related) => (
              <Link
                key={related.slug}
                href={`/tools/${related.category}/${related.slug}`}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-primary hover:shadow-sm dark:border-slate-800"
              >
                <p className="font-medium text-slate-900 dark:text-white">{related.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{related.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
