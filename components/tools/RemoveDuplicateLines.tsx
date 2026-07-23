"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { RemoveDuplicateLinesInput, RemoveDuplicateLinesOutput } from "@/config/tools/remove-duplicate-lines.config";
import { FieldLabel, TextArea } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function RemoveDuplicateLines({ tool }: { tool: ToolConfig<RemoveDuplicateLinesInput, RemoveDuplicateLinesOutput> }) {
  const [text, setText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [result, setResult] = useState<RemoveDuplicateLinesOutput | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ text, caseSensitive, trimLines });
    if (!parsed.success) return;
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <FieldLabel htmlFor="text">Lines</FieldLabel>
      <TextArea id="text" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={"apple\nbanana\napple"} />
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="h-4 w-4 rounded accent-primary" />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="h-4 w-4 rounded accent-primary" />
          Trim lines
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Remove duplicates</PrimaryButton>
        <SecondaryButton onClick={() => { setText(""); setResult(null); }}>Reset</SecondaryButton>
      </div>
      {result && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Result ({result.removedCount} duplicate{result.removedCount === 1 ? "" : "s"} removed)</FieldLabel>
          <TextArea id="out" rows={10} readOnly value={result.result} />
          <LinkButton onClick={() => navigator.clipboard.writeText(result.result)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
