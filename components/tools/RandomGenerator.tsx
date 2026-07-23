"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { RandomGeneratorInput, RandomGeneratorOutput } from "@/config/tools/random-generator.config";
import { FieldLabel, TextInput, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function RandomGenerator({ tool }: { tool: ToolConfig<RandomGeneratorInput, RandomGeneratorOutput> }) {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [result, setResult] = useState<RandomGeneratorOutput | null>(null);

  function generate() {
    const parsed = tool.inputSchema.safeParse({ min: Number(min), max: Number(max), count: Number(count), allowDuplicates });
    if (!parsed.success) {
      setResult({ numbers: [], error: parsed.error.issues[0]?.message });
      return;
    }
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div><FieldLabel htmlFor="min">Min</FieldLabel><TextInput id="min" type="number" value={min} onChange={(e) => setMin(e.target.value)} /></div>
        <div><FieldLabel htmlFor="max">Max</FieldLabel><TextInput id="max" type="number" value={max} onChange={(e) => setMax(e.target.value)} /></div>
        <div><FieldLabel htmlFor="count">How many</FieldLabel><TextInput id="count" type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} /></div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input type="checkbox" checked={allowDuplicates} onChange={(e) => setAllowDuplicates(e.target.checked)} className="h-4 w-4 rounded accent-primary" />
        Allow duplicates
      </label>
      <div className="mt-4">
        <PrimaryButton onClick={generate}>
          <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-4 w-4" /> Generate</span>
        </PrimaryButton>
      </div>
      {result?.error && <ErrorText>{result.error}</ErrorText>}
      {result && result.numbers.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            {result.numbers.map((n, i) => (
              <span key={i} className="rounded-lg bg-slate-50 px-3 py-1.5 font-mono text-sm dark:bg-slate-800/60">{n}</span>
            ))}
          </div>
          <LinkButton onClick={() => navigator.clipboard.writeText(result.numbers.join(", "))} className="mt-3">
            <Copy className="h-4 w-4" /> Copy all
          </LinkButton>
        </div>
      )}
    </div>
  );
}
