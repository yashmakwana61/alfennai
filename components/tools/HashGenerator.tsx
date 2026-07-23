"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { HashGeneratorInput, HashGeneratorOutput } from "@/config/tools/hash-generator.config";
import { FieldLabel, TextArea } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function HashGenerator({ tool }: { tool: ToolConfig<HashGeneratorInput, HashGeneratorOutput> }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<HashGeneratorOutput | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ text });
    if (!parsed.success) return;
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <FieldLabel htmlFor="text">Text to hash</FieldLabel>
      <TextArea id="text" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Generate SHA-256</PrimaryButton>
        <SecondaryButton onClick={() => { setText(""); setResult(null); }}>Reset</SecondaryButton>
      </div>
      {result && (
        <div className="mt-5">
          <FieldLabel htmlFor="hash">SHA-256 hash</FieldLabel>
          <p id="hash" className="break-all rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900">
            {result.sha256}
          </p>
          <LinkButton onClick={() => navigator.clipboard.writeText(result.sha256)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy hash
          </LinkButton>
        </div>
      )}
    </div>
  );
}
