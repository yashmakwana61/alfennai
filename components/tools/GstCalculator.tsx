"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { GstInput, GstOutput } from "@/config/tools/gst-calculator.config";
import { FieldLabel, TextInput, Select, ErrorText, ResultCard, StatGrid } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function GstCalculator({ tool }: { tool: ToolConfig<GstInput, GstOutput> }) {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [result, setResult] = useState<GstOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ amount: Number(amount), gstRate: Number(rate), mode });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setAmount("");
    setRate("");
    setResult(null);
    setError(null);
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <TextInput id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="rate">GST rate (%)</FieldLabel>
          <TextInput id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="mode">Amount is</FieldLabel>
          <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value as "exclusive" | "inclusive")}>
            <option value="exclusive">Exclusive of GST</option>
            <option value="inclusive">Inclusive of GST</option>
          </Select>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate GST</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">₹{fmt(result.totalAmount)}</p>
          <StatGrid
            items={[
              { label: "Base amount", value: `₹${fmt(result.baseAmount)}` },
              { label: "GST amount", value: `₹${fmt(result.gstAmount)}` },
            ]}
          />
        </ResultCard>
      )}
    </div>
  );
}
