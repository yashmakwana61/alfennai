"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { JsonValidatorInput, JsonValidatorOutput } from "@/config/tools/json-validator.config";
import { FieldLabel, TextArea, ResultCard } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function JsonValidator({ tool }: { tool: ToolConfig<JsonValidatorInput, JsonValidatorOutput> }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<JsonValidatorOutput | null>(null);

  function validate() {
    const parsed = tool.inputSchema.safeParse({ raw });
    if (!parsed.success) {
      setResult({ valid: false, error: parsed.error.issues[0]?.message });
      return;
    }
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setRaw("");
    setResult(null);
  }

  return (
    <div>
      <FieldLabel htmlFor="raw">JSON to validate</FieldLabel>
      <TextArea id="raw" rows={12} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder='{"key": "value"}' />
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={validate}>Validate JSON</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          {result.valid ? (
            <p className="font-medium text-success">Valid JSON{result.keyCount !== undefined ? ` — ${result.keyCount} top-level keys` : ""}</p>
          ) : (
            <div>
              <p className="font-medium text-error">Invalid JSON</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {result.error}{result.errorLine ? ` (near line ${result.errorLine})` : ""}
              </p>
            </div>
          )}
        </ResultCard>
      )}
    </div>
  );
}
