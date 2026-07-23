"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { ProfitInput, ProfitOutput } from "@/config/tools/profit-calculator.config";
import { FieldLabel, TextInput, ErrorText, ResultCard } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function ProfitCalculator({ tool }: { tool: ToolConfig<ProfitInput, ProfitOutput> }) {
  const [cost, setCost] = useState("800");
  const [selling, setSelling] = useState("1000");
  const [result, setResult] = useState<ProfitOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ costPrice: Number(cost), sellingPrice: Number(selling) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setCost("");
    setSelling("");
    setResult(null);
    setError(null);
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="cost">Cost price</FieldLabel>
          <TextInput id="cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="selling">Selling price</FieldLabel>
          <TextInput id="selling" type="number" value={selling} onChange={(e) => setSelling(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className={`text-3xl font-semibold ${result.isProfit ? "text-success" : "text-error"}`}>
            {result.isProfit ? "Profit" : "Loss"}: {fmt(result.profitOrLoss)}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{fmt(result.percent)}% of cost price</p>
        </ResultCard>
      )}
    </div>
  );
}
