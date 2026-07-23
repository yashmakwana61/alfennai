"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { QrGeneratorInput, QrGeneratorOutput } from "@/config/tools/qr-generator.config";
import { FieldLabel, TextInput, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function QrGenerator({ tool }: { tool: ToolConfig<QrGeneratorInput, QrGeneratorOutput> }) {
  const [text, setText] = useState("");
  const [size, setSize] = useState("300");
  const [result, setResult] = useState<QrGeneratorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ text, size: Number(size) });
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="text">Text or URL</FieldLabel>
          <TextInput id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="https://alfennai.com" />
        </div>
        <div>
          <FieldLabel htmlFor="size">Size (px)</FieldLabel>
          <TextInput id="size" type="number" min={100} max={500} value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Generate QR code</PrimaryButton>
        <SecondaryButton onClick={() => { setText(""); setResult(null); setError(null); }}>Reset</SecondaryButton>
      </div>
      {result && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.imageUrl} alt="Generated QR code" width={Number(size)} height={Number(size)} className="rounded-lg border border-slate-200 dark:border-slate-800" />
          <a href={result.imageUrl} download="qr-code.png" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Download className="h-4 w-4" /> Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
