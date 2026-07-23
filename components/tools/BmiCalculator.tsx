"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { BmiInput, BmiOutput } from "@/config/tools/bmi-calculator.config";
import { FieldLabel, TextInput, ErrorText, ResultCard } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

const categoryColor: Record<BmiOutput["category"], string> = {
  Underweight: "text-warning",
  Normal: "text-success",
  Overweight: "text-warning",
  Obese: "text-error",
};

export function BmiCalculator({ tool }: { tool: ToolConfig<BmiInput, BmiOutput> }) {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [result, setResult] = useState<BmiOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ weightKg: Number(weight), heightCm: Number(height) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setWeight("");
    setHeight("");
    setResult(null);
    setError(null);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
          <TextInput id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
          <TextInput id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate BMI</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">{result.bmi.toFixed(1)}</p>
          <p className={`mt-1 text-sm font-medium ${categoryColor[result.category]}`}>{result.category}</p>
        </ResultCard>
      )}
    </div>
  );
}
