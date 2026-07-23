"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { LoanInput, LoanOutput } from "@/config/tools/loan-calculator.config";
import { FieldLabel, TextInput, ErrorText, ResultCard, StatGrid } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function LoanCalculator({ tool }: { tool: ToolConfig<LoanInput, LoanOutput> }) {
  const [loanAmount, setLoanAmount] = useState("1500000");
  const [downPayment, setDownPayment] = useState("300000");
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("15");
  const [result, setResult] = useState<LoanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({
      loanAmount: Number(loanAmount),
      downPayment: Number(downPayment),
      annualRate: Number(rate),
      tenureYears: Number(years),
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
    setLoanAmount("");
    setDownPayment("");
    setRate("");
    setYears("");
    setResult(null);
    setError(null);
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <FieldLabel htmlFor="loanAmount">Total price</FieldLabel>
          <TextInput id="loanAmount" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="downPayment">Down payment</FieldLabel>
          <TextInput id="downPayment" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="rate">Annual rate (%)</FieldLabel>
          <TextInput id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="years">Tenure (years)</FieldLabel>
          <TextInput id="years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            ₹{fmt(result.monthlyPayment)} <span className="text-base font-normal text-slate-500">/ month</span>
          </p>
          <StatGrid
            items={[
              { label: "Principal financed", value: `₹${fmt(result.principalFinanced)}` },
              { label: "Total interest", value: `₹${fmt(result.totalInterest)}` },
              { label: "Total cost", value: `₹${fmt(result.totalCost)}` },
            ]}
          />
        </ResultCard>
      )}
    </div>
  );
}
