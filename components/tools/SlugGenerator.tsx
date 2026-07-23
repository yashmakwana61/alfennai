"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { SlugGeneratorInput, SlugGeneratorOutput } from "@/config/tools/slug-generator.config";
import { FieldLabel, TextInput, Select, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function SlugGenerator({ tool }: { tool: ToolConfig<SlugGeneratorInput, SlugGeneratorOutput> }) {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ text, separator });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setSlug("");
      return;
    }
    setError(null);
    setSlug(tool.compute(parsed.data).slug);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="text">Text</FieldLabel>
          <TextInput id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="10 Best Online Tools for 2026!" />
        </div>
        <div>
          <FieldLabel htmlFor="separator">Separator</FieldLabel>
          <Select id="separator" value={separator} onChange={(e) => setSeparator(e.target.value as "-" | "_")}>
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
          </Select>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Generate slug</PrimaryButton>
        <SecondaryButton onClick={() => { setText(""); setSlug(""); setError(null); }}>Reset</SecondaryButton>
      </div>
      {slug && (
        <div className="mt-5">
          <p className="break-all rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900">{slug}</p>
          <LinkButton onClick={() => navigator.clipboard.writeText(slug)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
