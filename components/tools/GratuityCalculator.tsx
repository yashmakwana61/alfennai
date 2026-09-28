"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type {
  GratuityToolInput,
  GratuityToolOutput,
} from "@/config/tools/gratuity-calculator.config";
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

export function GratuityCalculator({ tool }: { tool: ToolConfig<GratuityToolInput, GratuityToolOutput> }) {
  const [wage, setWage] = useState("50000");
  const [years, setYears] = useState("5");
  const [months, setMonths] = useState("0");
  const [employeeType, setEmployeeType] = useState<"regular" | "fixed-term">("regular");
  const [basis, setBasis] = useState<"statutory" | "contractual">("statutory");
  const [rateDays, setRateDays] = useState("15");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    const wageNum = toNumber(wage);
    const yearsNum = toNumber(years);
    const monthsNum = toNumber(months);
    const rateNum = toNumber(rateDays);
    if (wageNum === null) return { error: "Monthly wage is required." as string | null, data: null };
    if (yearsNum === null || monthsNum === null || rateNum === null) {
      return { error: "Enter valid numbers only (digits, no decimals for years/months).", data: null };
    }
    const candidate = {
      monthlyWage: wageNum,
      completedYears: yearsNum,
      additionalMonths: monthsNum,
      employeeType,
      useContractualRate: basis === "contractual",
      contractualRateDays: rateNum,
    };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, wage, years, months, employeeType, basis, rateDays]);

  const result = useMemo(
    () => (parsed.data ? tool.compute(parsed.data) : null),
    [tool, parsed.data]
  );

  function calculate() {
    setError(parsed.error);
    setCopied(false);
  }

  function reset() {
    setWage("");
    setYears("");
    setMonths("0");
    setEmployeeType("regular");
    setBasis("statutory");
    setRateDays("15");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const text =
      "Gratuity Estimate\n" +
      `\nMonthly wage used: ${formatINR(result.monthlyWage)}` +
      `\nService: ${result.completedYears} years ${result.additionalMonths} months (qualifying: ${result.qualifyingYears} years)` +
      `\nRate: ${result.rateDays} days/year (${result.rateSource})` +
      `\nEstimated gratuity: ${formatINR(result.gratuityAmount)} — estimate only, not a guaranteed payout`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Estimate only — not legal advice and not a guaranteed payout. Verify entitlement, wage basis
        and terms with your employer.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Wage &amp; service</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="wage">Monthly wage used for gratuity (required)</FieldLabel>
            <InrInput
              id="wage"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 50000"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              aria-describedby="wage-hint"
            />
            <p id="wage-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The gratuity-relevant monthly wage — may differ from Basic Salary or CTC.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="employeeType">Employment type</FieldLabel>
            <Select id="employeeType" value={employeeType} onChange={(e) => setEmployeeType(e.target.value as "regular" | "fixed-term")}>
              <option value="regular">Regular employee</option>
              <option value="fixed-term">Fixed-term employee</option>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="years">Completed years of service</FieldLabel>
            <TextInput id="years" type="number" min="0" step="1" inputMode="numeric" placeholder="e.g. 5" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="months">Additional months (0–11)</FieldLabel>
            <TextInput id="months" type="number" min="0" max="11" step="1" inputMode="numeric" placeholder="e.g. 0" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="basis">Calculation basis</FieldLabel>
            <Select id="basis" value={basis} onChange={(e) => setBasis(e.target.value as "statutory" | "contractual")}>
              <option value="statutory">Standard statutory estimate (15 days/year)</option>
              <option value="contractual">Better contractual rate (specify below)</option>
            </Select>
          </div>
          {basis === "contractual" && (
            <div>
              <FieldLabel htmlFor="rateDays">Contractual rate (days/year)</FieldLabel>
              <TextInput id="rateDays" type="number" min="1" max="31" step="1" inputMode="decimal" placeholder="e.g. 20" value={rateDays} onChange={(e) => setRateDays(e.target.value)} aria-describedby="rate-hint" />
              <p id="rate-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                A user-specified better-term assumption, not the statutory default.
              </p>
            </div>
          )}
        </div>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate gratuity</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated gratuity</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white" role="status">
            {formatINR(result.gratuityAmount)}
          </p>
          <p className={`mt-2 text-sm font-medium ${result.eligible ? "text-success" : "text-error"}`}>
            {result.eligible
              ? "Eligible under the standard service assumption for this estimate."
              : "Standard five-year eligibility assumption is not met for this estimate."}
          </p>
          {!result.eligible && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The amount above is the mathematical formula result only — not an eligible payout.
            </p>
          )}

          <StatGrid
            items={[
              { label: "Monthly wage used", value: formatINR(result.monthlyWage) },
              { label: "Service", value: `${result.completedYears}y ${result.additionalMonths}m` },
              { label: "Qualifying years", value: `${result.qualifyingYears}` },
              { label: "Rate", value: `${result.rateDays} days/yr (${result.rateSource})` },
              { label: "Daily wage basis", value: formatINR(result.dailyBasis) },
              { label: "Formula", value: `${formatINR(result.monthlyWage)} ÷ 26 × ${result.rateDays} × ${result.qualifyingYears}` },
            ]}
          />

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            No statutory maximum cap is applied — verify the currently notified ceiling. Framework:
            Code on Social Security, 2020 position applicable from 21 November 2025. All calculations
            run locally in your browser — nothing is sent or stored.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
