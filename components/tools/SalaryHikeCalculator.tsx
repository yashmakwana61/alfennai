"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type {
  SalaryHikeToolInput,
  SalaryHikeToolOutput,
} from "@/config/tools/salary-hike-calculator.config";
import {
  FieldLabel,
  TextInput,
  Select,
  ErrorText,
  ResultCard,
  StatGrid,
} from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";
import { formatINR } from "@/lib/finance/salary-calculator";

function toNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function InrInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        ₹
      </span>
      <TextInput {...props} className="pl-7" />
    </div>
  );
}

export function SalaryHikeCalculator({ tool }: { tool: ToolConfig<SalaryHikeToolInput, SalaryHikeToolOutput> }) {
  const [salary, setSalary] = useState("600000");
  const [hike, setHike] = useState("10");
  const [period, setPeriod] = useState<"annual" | "monthly">("annual");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (salary.trim() === "") return { error: "Current salary is required." as string | null, data: null };
    if (hike.trim() === "") return { error: "Hike percentage is required." as string | null, data: null };
    const salaryNum = toNumber(salary);
    const hikeNum = toNumber(hike);
    if (salaryNum === null || hikeNum === null) {
      return { error: "Enter valid numbers only (digits and an optional decimal point).", data: null };
    }
    const candidate = { currentSalary: salaryNum, hikePct: hikeNum, period };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, salary, hike, period]);

  const result = useMemo(
    () => (parsed.data ? tool.compute(parsed.data) : null),
    [tool, parsed.data]
  );

  function calculate() {
    setError(parsed.error);
    setCopied(false);
  }

  function reset() {
    setSalary("");
    setHike("");
    setPeriod("annual");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const unit = period === "annual" ? "year" : "month";
    const text =
      "Salary Hike Calculation\n" +
      `\nCurrent Salary: ${formatINR(period === "annual" ? result.currentAnnual : result.currentMonthly)}/${unit}` +
      `\nHike: ${result.hikePct}%` +
      `\nIncrease: +${formatINR(period === "annual" ? result.hikeAnnual : result.hikeMonthly)}/${unit}` +
      `\nRevised Salary: ${formatINR(period === "annual" ? result.revisedAnnual : result.revisedMonthly)}/${unit}` +
      `\nRevised ${period === "annual" ? "Monthly" : "Annual"} Salary: ${formatINR(period === "annual" ? result.revisedMonthly : result.revisedAnnual)}/${period === "annual" ? "month" : "year"}`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);
  const unit = period === "annual" ? "year" : "month";

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Mathematical estimate of the raise only — actual payslips differ after deductions, taxes and
        bonuses. Figures are rounded to the nearest rupee for display.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Current salary &amp; hike</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel htmlFor="salary">Current salary (required)</FieldLabel>
            <InrInput
              id="salary"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 600000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="hike">Hike percentage (required)</FieldLabel>
            <TextInput
              id="hike"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 10"
              value={hike}
              onChange={(e) => setHike(e.target.value)}
              aria-describedby="hike-hint"
            />
            <p id="hike-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter 0 for no hike; decimals allowed.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="period">Salary period</FieldLabel>
            <Select id="period" value={period} onChange={(e) => setPeriod(e.target.value as "annual" | "monthly")}>
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
        </div>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate hike</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revised salary</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white" role="status">
            {formatINR(period === "annual" ? result.revisedAnnual : result.revisedMonthly)}
            <span className="text-base font-normal text-slate-500"> / {unit}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Increase of +{formatINR(period === "annual" ? result.hikeAnnual : result.hikeMonthly)} / {unit} ({result.hikePct}%)
          </p>

          <StatGrid
            items={[
              { label: `Current salary (/${unit})`, value: `${formatINR(period === "annual" ? result.currentAnnual : result.currentMonthly)}` },
              { label: "Hike percentage", value: `${result.hikePct}%` },
              { label: `Increase (/${unit})`, value: `+${formatINR(period === "annual" ? result.hikeAnnual : result.hikeMonthly)}` },
              { label: "Current annual", value: formatINR(result.currentAnnual) },
              { label: "Revised annual", value: formatINR(result.revisedAnnual) },
              { label: "Revised monthly", value: formatINR(result.revisedMonthly) },
            ]}
          />

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Actual payroll may differ if hike timing, bonuses, deductions or variable pay change.
            All calculations run locally in your browser — nothing is sent or stored.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
