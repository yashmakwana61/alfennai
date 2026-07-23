"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { UrlEncoderInput, UrlEncoderOutput } from "@/config/tools/url-encoder.config";
import { FieldLabel, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function UrlEncoder({ tool }: { tool: ToolConfig<UrlEncoderInput, UrlEncoderOutput> }) {
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
    setOutput(tool.compute(parsed.data).encoded);
  }

  return (
    <div>
      <FieldLabel htmlFor="raw">Text or URL to encode</FieldLabel>
      <TextArea id="raw" rows={5} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="https://example.com/search?q=hello world" />
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Encode URL</PrimaryButton>
        <SecondaryButton onClick={() => { setRaw(""); setOutput(""); setError(null); }}>Reset</SecondaryButton>
      </div>
      {output && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Encoded output</FieldLabel>
          <TextArea id="out" rows={5} readOnly value={output} />
          <LinkButton onClick={() => navigator.clipboard.writeText(output)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
