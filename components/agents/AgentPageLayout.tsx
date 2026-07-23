import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { AgentConfig, AgentIndustry } from "@/types/agent";
import { AgentDownloadPanel } from "@/components/agents/AgentDownloadPanel";

// TODO: replace with PreciseFect's real contact/website URL.
const PRECISEFECT_CONTACT_URL = "https://precisefect.com/contact";

interface Props {
  agent: AgentConfig;
  industry: AgentIndustry;
  relatedAgents: AgentConfig[];
}

export function AgentPageLayout({ agent, industry, relatedAgents }: Props) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/agents" className="hover:text-primary">AI Agents</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href={`/agents/${industry.slug}`} className="hover:text-primary">{industry.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-slate-900 dark:text-white" aria-current="page">{agent.title}</span>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          {agent.compatibleWith.map((c) => (
            <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{c}</span>
          ))}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{agent.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{agent.shortDescription}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Use case</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-200">{agent.useCase}</p>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">System prompt</h2>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          {agent.systemPrompt}
        </pre>

        <div className="mt-6">
          <AgentDownloadPanel slug={agent.slug} />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How it works</h2>
        {agent.longDescription.split("\n\n").map((paragraph, i) => (
          <p key={i} className="leading-relaxed text-slate-600 dark:text-slate-300">{paragraph}</p>
        ))}
      </section>

      <section className="mt-10 rounded-2xl bg-secondary px-6 py-8 text-center sm:px-10">
        <Sparkles className="mx-auto h-6 w-6 text-accent" />
        <h2 className="mt-3 text-xl font-semibold text-white">Want this built and running for you?</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-300">
          This template covers the common case. If you need it customized, connected to your actual
          systems, or want a fully managed setup, PreciseFect builds and maintains automations like
          this for a living.
        </p>
        <a
          href={PRECISEFECT_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Talk to PreciseFect
        </a>
      </section>

      {agent.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {agent.faq.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none font-medium text-slate-900 dark:text-white">{item.question}</summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {relatedAgents.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Related agents</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedAgents.map((related) => (
              <Link
                key={related.slug}
                href={`/agents/${related.industry}/${related.slug}`}
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
