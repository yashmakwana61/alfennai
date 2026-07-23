"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { UrlDecoderInput, UrlDecoderOutput } from "@/config/tools/url-decoder.config";
import { FieldLabel, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function UrlDecoder({ tool }: { tool: ToolConfig<UrlDecoderInput, UrlDecoderOutput> }) {
  const [encoded, setEncoded] = useState("");
  const [result, setResult] = useState<UrlDecoderOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ encoded });
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
      <FieldLabel htmlFor="encoded">Percent-encoded text</FieldLabel>
      <TextArea id="encoded" rows={5} value={encoded} onChange={(e) => setEncoded(e.target.value)} placeholder="https%3A%2F%2Fexample.com%2F..." />
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Decode URL</PrimaryButton>
        <SecondaryButton onClick={() => { setEncoded(""); setResult(null); setError(null); }}>Reset</SecondaryButton>
      </div>
      {result && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Decoded output</FieldLabel>
          {result.error ? (
            <p className="text-sm text-error">{result.error}</p>
          ) : (
            <>
              <TextArea id="out" rows={5} readOnly value={result.decoded} />
              <LinkButton onClick={() => navigator.clipboard.writeText(result.decoded)} className="mt-2">
                <Copy className="h-4 w-4" /> Copy
              </LinkButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}
