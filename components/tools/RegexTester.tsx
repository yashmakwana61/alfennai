"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { RegexTesterInput, RegexTesterOutput } from "@/config/tools/regex-tester.config";
import { FieldLabel, TextInput, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function RegexTester({ tool }: { tool: ToolConfig<RegexTesterInput, RegexTesterOutput> }) {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("gi");
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState<RegexTesterOutput | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ pattern, flags, testString });
    if (!parsed.success) {
      setResult({ matches: [], error: parsed.error.issues[0]?.message });
      return;
    }
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="pattern">Pattern</FieldLabel>
          <TextInput id="pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\\b\\w+@\\w+\\.\\w+\\b" className="font-mono" />
        </div>
        <div>
          <FieldLabel htmlFor="flags">Flags</FieldLabel>
          <TextInput id="flags" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gi" className="font-mono" />
        </div>
      </div>
      <div className="mt-4">
        <FieldLabel htmlFor="testString">Test string</FieldLabel>
        <TextArea id="testString" rows={6} value={testString} onChange={(e) => setTestString(e.target.value)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Run regex</PrimaryButton>
        <SecondaryButton onClick={() => { setResult(null); }}>Clear</SecondaryButton>
      </div>
      {result?.error && <ErrorText>{result.error}</ErrorText>}
      {result && !result.error && (
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{result.matches.length} match(es)</p>
          <div className="mt-2 space-y-2">
            {result.matches.map((m, i) => (
              <div key={i} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm dark:bg-slate-800/60">
                <span className="text-primary">&quot;{m.match}&quot;</span>
                <span className="ml-2 text-slate-400">at index {m.index}</span>
                {m.groups.length > 0 && <span className="ml-2 text-slate-500">groups: [{m.groups.join(", ")}]</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
