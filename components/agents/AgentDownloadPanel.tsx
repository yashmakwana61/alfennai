"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";

interface Props {
  slug: string;
}

const AGENT_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {
  "real-estate-lead-qualifier": () => import("@/config/agents/real-estate-lead-qualifier.config"),
  "real-estate-listing-description": () => import("@/config/agents/real-estate-listing-description.config"),
  "real-estate-tenant-inquiry": () => import("@/config/agents/real-estate-tenant-inquiry.config"),
  "real-estate-market-report": () => import("@/config/agents/real-estate-market-report.config"),
  "ecommerce-abandoned-cart": () => import("@/config/agents/ecommerce-abandoned-cart.config"),
  "ecommerce-product-description": () => import("@/config/agents/ecommerce-product-description.config"),
  "ecommerce-review-response": () => import("@/config/agents/ecommerce-review-response.config"),
  "ecommerce-order-support": () => import("@/config/agents/ecommerce-order-support.config"),
};

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AgentDownloadPanel({ slug }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function loadAgentAndConfig() {
    const configLoader = AGENT_LOADERS[slug];
    if (!configLoader) {
      setError(true);
      return null;
    }
    const [configMod, engineMod] = await Promise.all([
      configLoader(),
      import("@/lib/engine/n8n-templates"),
    ]);
    const agent = Object.values(configMod)[0] as import("@/types/agent").AgentConfig;
    const workflow = engineMod.buildWorkflowJson(agent);
    return { agent, workflow };
  }

  async function handleDownloadPrompt() {
    const result = await loadAgentAndConfig();
    if (!result) return;
    const { agent } = result;
    const content = `# ${agent.title}\n\n## System Prompt\n\n${agent.systemPrompt}\n\n## User Prompt Template\n\n${agent.userPromptTemplate}\n\n---\nCompatible with: ${agent.compatibleWith.join(", ")}\n`;
    downloadFile(`${agent.slug}-prompt.md`, content, "text/markdown");
  }

  async function handleDownloadWorkflow() {
    const result = await loadAgentAndConfig();
    if (!result) return;
    const { agent, workflow } = result;
    downloadFile(`${agent.slug}-workflow.json`, JSON.stringify(workflow, null, 2), "application/json");
  }

  async function handleCopyPrompt() {
    const result = await loadAgentAndConfig();
    if (!result) return;
    await navigator.clipboard.writeText(result.agent.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return <p className="text-sm text-error">Could not load this agent's files.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownloadPrompt}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        <Download className="h-4 w-4" /> Download prompt (.md)
      </button>
      <button
        onClick={handleDownloadWorkflow}
        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary/90"
      >
        <Download className="h-4 w-4" /> Download n8n workflow (.json)
      </button>
      <button
        onClick={handleCopyPrompt}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy prompt"}
      </button>
    </div>
  );
}
