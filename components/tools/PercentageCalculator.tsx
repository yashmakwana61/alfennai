"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { PercentageInput, PercentageOutput } from "@/config/tools/percentage-calculator.config";
import { FieldLabel, TextInput, Select, ErrorText, ResultCard } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

const modeLabels: Record<PercentageInput["mode"], { x: string; y: string }> = {
  of: { x: "Percent (%)", y: "Of value" },
  isWhatPercent: { x: "Value X", y: "Value Y" },
  percentChange: { x: "Original value", y: "New value" },
};

export function PercentageCalculator({ tool }: { tool: ToolConfig<PercentageInput, PercentageOutput> }) {
  const [mode, setMode] = useState<PercentageInput["mode"]>("of");
  const [x, setX] = useState("20");
  const [y, setY] = useState("150");
  const [result, setResult] = useState<PercentageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ mode, x: Number(x), y: Number(y) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setX("");
    setY("");
    setResult(null);
    setError(null);
  }

  const labels = modeLabels[mode];

  return (
    <div>
      <div className="mb-4">
        <FieldLabel htmlFor="mode">Calculation type</FieldLabel>
        <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value as PercentageInput["mode"])}>
          <option value="of">X% of Y</option>
          <option value="isWhatPercent">X is what percent of Y</option>
          <option value="percentChange">Percentage change from X to Y</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="x">{labels.x}</FieldLabel>
          <TextInput id="x" type="number" value={x} onChange={(e) => setX(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="y">{labels.y}</FieldLabel>
          <TextInput id="y" type="number" value={y} onChange={(e) => setY(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-sm text-slate-500 dark:text-slate-400">{result.label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
            {result.result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            {mode !== "of" ? "%" : ""}
          </p>
        </ResultCard>
      )}
    </div>
  );
}
