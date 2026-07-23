"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { JwtEncoderInput, JwtEncoderOutput } from "@/config/tools/jwt-encoder.config";
import { FieldLabel, TextArea, TextInput, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function JwtEncoder({ tool }: { tool: ToolConfig<JwtEncoderInput, JwtEncoderOutput> }) {
  const [payload, setPayload] = useState('{"sub":"1234567890","name":"John Doe"}');
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState<JwtEncoderOutput | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ payload, secret });
    if (!parsed.success) {
      setResult({ token: "", error: parsed.error.issues[0]?.message });
      return;
    }
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <FieldLabel htmlFor="payload">JSON payload</FieldLabel>
      <TextArea id="payload" rows={5} value={payload} onChange={(e) => setPayload(e.target.value)} />
      <div className="mt-4">
        <FieldLabel htmlFor="secret">Signing secret (HS256)</FieldLabel>
        <TextInput id="secret" type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="your-256-bit-secret" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Generate JWT</PrimaryButton>
        <SecondaryButton onClick={() => { setResult(null); }}>Clear result</SecondaryButton>
      </div>
      {result?.error && <ErrorText>{result.error}</ErrorText>}
      {result?.token && (
        <div className="mt-5">
          <FieldLabel htmlFor="token">Signed JWT</FieldLabel>
          <TextArea id="token" rows={4} readOnly value={result.token} className="break-all" />
          <LinkButton onClick={() => navigator.clipboard.writeText(result.token)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy token
          </LinkButton>
        </div>
      )}
    </div>
  );
}
