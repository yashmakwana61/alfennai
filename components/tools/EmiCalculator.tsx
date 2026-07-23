"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { EmiInput, EmiOutput } from "@/config/tools/emi-calculator.config";
import { FieldLabel, TextInput, ErrorText, ResultCard, StatGrid } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function EmiCalculator({ tool }: { tool: ToolConfig<EmiInput, EmiOutput> }) {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("9.5");
  const [tenure, setTenure] = useState("60");
  const [result, setResult] = useState<EmiOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({
      principal: Number(principal),
      annualRate: Number(rate),
      tenureMonths: Number(tenure),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setPrincipal("");
    setRate("");
    setTenure("");
    setResult(null);
    setError(null);
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="principal">Loan amount</FieldLabel>
          <TextInput id="principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="rate">Annual interest rate (%)</FieldLabel>
          <TextInput id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="tenure">Tenure (months)</FieldLabel>
          <TextInput id="tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate EMI</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            ₹{fmt(result.emi)} <span className="text-base font-normal text-slate-500">/ month</span>
          </p>
          <StatGrid
            items={[
              { label: "Total interest", value: `₹${fmt(result.totalInterest)}` },
              { label: "Total payment", value: `₹${fmt(result.totalPayment)}` },
            ]}
          />
        </ResultCard>
      )}
    </div>
  );
}
