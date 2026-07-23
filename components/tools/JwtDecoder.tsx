"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { JwtDecoderInput, JwtDecoderOutput } from "@/config/tools/jwt-decoder.config";
import { FieldLabel, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function JwtDecoder({ tool }: { tool: ToolConfig<JwtDecoderInput, JwtDecoderOutput> }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<JwtDecoderOutput | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ token });
    if (!parsed.success) {
      setResult({ header: "", payload: "", error: parsed.error.issues[0]?.message });
      return;
    }
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <FieldLabel htmlFor="token">JWT</FieldLabel>
      <TextArea id="token" rows={5} value={token} onChange={(e) => setToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." />
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Decode JWT</PrimaryButton>
        <SecondaryButton onClick={() => { setToken(""); setResult(null); }}>Reset</SecondaryButton>
      </div>
      {result?.error && <ErrorText>{result.error}</ErrorText>}
      {result && !result.error && (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <FieldLabel htmlFor="header">Header</FieldLabel>
            <pre className="overflow-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900">{result.header}</pre>
          </div>
          <div>
            <FieldLabel htmlFor="payload">Payload</FieldLabel>
            <pre className="overflow-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900">{result.payload}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
