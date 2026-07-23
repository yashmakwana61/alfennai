"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { TimeInput, TimeOutput } from "@/config/tools/time-calculator.config";
import { FieldLabel, TextInput, Select, ErrorText, ResultCard } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function TimeCalculator({ tool }: { tool: ToolConfig<TimeInput, TimeOutput> }) {
  const [h1, setH1] = useState("2"); const [m1, setM1] = useState("30"); const [s1, setS1] = useState("0");
  const [h2, setH2] = useState("1"); const [m2, setM2] = useState("45"); const [s2, setS2] = useState("0");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [result, setResult] = useState<TimeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({
      h1: Number(h1), m1: Number(m1), s1: Number(s1),
      h2: Number(h2), m2: Number(m2), s2: Number(s2),
      operation,
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
    setH1(""); setM1(""); setS1(""); setH2(""); setM2(""); setS2("");
    setResult(null);
    setError(null);
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <div><FieldLabel htmlFor="h1">Hours</FieldLabel><TextInput id="h1" type="number" value={h1} onChange={(e) => setH1(e.target.value)} /></div>
        <div><FieldLabel htmlFor="m1">Minutes</FieldLabel><TextInput id="m1" type="number" value={m1} onChange={(e) => setM1(e.target.value)} /></div>
        <div><FieldLabel htmlFor="s1">Seconds</FieldLabel><TextInput id="s1" type="number" value={s1} onChange={(e) => setS1(e.target.value)} /></div>
      </div>

      <div className="my-4">
        <Select value={operation} onChange={(e) => setOperation(e.target.value as "add" | "subtract")} className="w-40">
          <option value="add">+ Add</option>
          <option value="subtract">− Subtract</option>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div><FieldLabel htmlFor="h2">Hours</FieldLabel><TextInput id="h2" type="number" value={h2} onChange={(e) => setH2(e.target.value)} /></div>
        <div><FieldLabel htmlFor="m2">Minutes</FieldLabel><TextInput id="m2" type="number" value={m2} onChange={(e) => setM2(e.target.value)} /></div>
        <div><FieldLabel htmlFor="s2">Seconds</FieldLabel><TextInput id="s2" type="number" value={s2} onChange={(e) => setS2(e.target.value)} /></div>
      </div>

      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            {result.negative ? "−" : ""}{pad(result.hours)}:{pad(result.minutes)}:{pad(result.seconds)}
          </p>
        </ResultCard>
      )}
    </div>
  );
}
