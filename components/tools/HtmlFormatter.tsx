"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { HtmlFormatterInput, HtmlFormatterOutput } from "@/config/tools/html-formatter.config";
import { FieldLabel, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function HtmlFormatter({ tool }: { tool: ToolConfig<HtmlFormatterInput, HtmlFormatterOutput> }) {
  const [raw, setRaw] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ raw });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setOutput("");
      return;
    }
    setError(null);
    setOutput(tool.compute(parsed.data).formatted);
  }

  return (
    <div>
      <FieldLabel htmlFor="raw">Raw HTML</FieldLabel>
      <TextArea id="raw" rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="<div><p>Hello</p></div>" />
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Format HTML</PrimaryButton>
        <SecondaryButton onClick={() => { setRaw(""); setOutput(""); setError(null); }}>Reset</SecondaryButton>
      </div>
      {output && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Formatted HTML</FieldLabel>
          <TextArea id="out" rows={12} readOnly value={output} />
          <LinkButton onClick={() => navigator.clipboard.writeText(output)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
