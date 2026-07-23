"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { Base64DecodeInput, Base64DecodeOutput } from "@/config/tools/base64-decode.config";
import { FieldLabel, TextArea, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function Base64Decode({ tool }: { tool: ToolConfig<Base64DecodeInput, Base64DecodeOutput> }) {
  const [encoded, setEncoded] = useState("");
  const [result, setResult] = useState<Base64DecodeOutput | null>(null);
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
      <FieldLabel htmlFor="encoded">Base64 to decode</FieldLabel>
      <TextArea id="encoded" rows={6} value={encoded} onChange={(e) => setEncoded(e.target.value)} placeholder="SGVsbG8sIEFsZmVubkFJIQ==" />
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Decode Base64</PrimaryButton>
        <SecondaryButton onClick={() => { setEncoded(""); setResult(null); setError(null); }}>Reset</SecondaryButton>
      </div>
      {result && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Decoded text</FieldLabel>
          {result.error ? (
            <p className="text-sm text-error">{result.error}</p>
          ) : (
            <>
              <TextArea id="out" rows={6} readOnly value={result.decoded} />
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
