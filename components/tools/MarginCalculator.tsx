"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { MarginInput, MarginOutput } from "@/config/tools/margin-calculator.config";
import { FieldLabel, TextInput, ErrorText, ResultCard, StatGrid } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function MarginCalculator({ tool }: { tool: ToolConfig<MarginInput, MarginOutput> }) {
  const [cost, setCost] = useState("800");
  const [revenue, setRevenue] = useState("1000");
  const [result, setResult] = useState<MarginOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ cost: Number(cost), revenue: Number(revenue) });
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
    setRevenue("");
    setResult(null);
    setError(null);
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="cost">Cost</FieldLabel>
          <TextInput id="cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="revenue">Revenue</FieldLabel>
          <TextInput id="revenue" type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">{fmt(result.marginPercent)}% margin</p>
          <StatGrid
            items={[
              { label: "Profit", value: fmt(result.profit) },
              { label: "Markup", value: `${fmt(result.markupPercent)}%` },
            ]}
          />
        </ResultCard>
      )}
    </div>
  );
}
