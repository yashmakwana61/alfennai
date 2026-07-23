"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { DateDiffInput, DateDiffOutput } from "@/config/tools/date-difference.config";
import { FieldLabel, TextInput, ErrorText, ResultCard, StatGrid } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function DateDifference({ tool }: { tool: ToolConfig<DateDiffInput, DateDiffOutput> }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<DateDiffOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ startDate, endDate });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setStartDate("");
    setEndDate("");
    setResult(null);
    setError(null);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="startDate">Start date</FieldLabel>
          <TextInput id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="endDate">End date</FieldLabel>
          <TextInput id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate difference</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            {result.years}y {result.months}m {result.days}d
          </p>
          <StatGrid
            items={[
              { label: "Total days", value: result.totalDays.toLocaleString() },
              { label: "Total weeks", value: result.totalWeeks.toLocaleString() },
              { label: "Business days", value: result.businessDays.toLocaleString() },
            ]}
          />
        </ResultCard>
      )}
    </div>
  );
}
