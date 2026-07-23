"use client";

import { useState } from "react";
import { Copy, RotateCcw, Download } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { JsonInput, JsonOutput } from "@/config/tools/json-formatter.config";

interface Props {
  tool: ToolConfig<JsonInput, JsonOutput>;
}

export function JsonFormatter({ tool }: Props) {
  const [raw, setRaw] = useState("");
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState<JsonOutput | null>(null);

  function handleFormat() {
    const parsed = tool.inputSchema.safeParse({ raw, indent });
    if (!parsed.success) {
      setOutput({ formatted: "", valid: false, error: parsed.error.issues[0]?.message });
      return;
    }
    setOutput(tool.compute(parsed.data));
  }

  function handleReset() {
    setRaw("");
    setOutput(null);
  }

  function handleCopy() {
    if (output?.formatted) navigator.clipboard.writeText(output.formatted);
  }

  function handleDownload() {
    if (!output?.formatted) return;
    const blob = new Blob([output.formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadExample() {
    setRaw((tool.exampleInput?.raw as string) ?? "");
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="raw" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Raw JSON
          </label>
          <textarea
            id="raw"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={12}
            placeholder='{"key": "value"}'
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Formatted output
          </label>
          <pre className="h-[calc(100%-1.75rem)] min-h-[15rem] overflow-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            {output?.valid ? output.formatted : output?.error ? (
              <span className="text-error">{output.error}</span>
            ) : (
              <span className="text-slate-400">Formatted JSON will appear here</span>
            )}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Indent:
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>Minified</option>
          </select>
        </label>
        <button onClick={handleFormat} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90">
          Format JSON
        </button>
        <button onClick={loadExample} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Try example
        </button>
        <button onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        {output?.valid && (
          <>
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Copy className="h-4 w-4" /> Copy
            </button>
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Download className="h-4 w-4" /> Download
            </button>
          </>
        )}
      </div>
    </div>
  );
}
