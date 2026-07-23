"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { CssMinifierInput, CssMinifierOutput } from "@/config/tools/css-minifier.config";
import { FieldLabel, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function CssMinifier({ tool }: { tool: ToolConfig<CssMinifierInput, CssMinifierOutput> }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<CssMinifierOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ raw });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <FieldLabel htmlFor="raw">CSS input</FieldLabel>
      <TextArea id="raw" rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="body { color: red; }" />
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Minify CSS</PrimaryButton>
        <SecondaryButton onClick={() => { setRaw(""); setResult(null); setError(null); }}>Reset</SecondaryButton>
      </div>
      {result && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Minified output ({result.savedPercent.toFixed(0)}% smaller)</FieldLabel>
          <TextArea id="out" rows={6} readOnly value={result.minified} className="font-mono text-sm" />
          <LinkButton onClick={() => navigator.clipboard.writeText(result.minified)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
