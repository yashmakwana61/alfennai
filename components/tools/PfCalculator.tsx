"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { PfToolInput, PfToolOutput } from "@/config/tools/pf-calculator.config";
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

export function PfCalculator({ tool }: { tool: ToolConfig<PfToolInput, PfToolOutput> }) {
  const [wage, setWage] = useState("50000");
  const [employeeRate, setEmployeeRate] = useState("12");
  const [employerRate, setEmployerRate] = useState("12");
  const [applyCeiling, setApplyCeiling] = useState(true);
  const [ceiling, setCeiling] = useState("25000");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    const wageNum = toNumber(wage);
    const employeeNum = toNumber(employeeRate);
    const employerNum = toNumber(employerRate);
    const ceilingNum = toNumber(ceiling);
    if (wageNum === null) return { error: "Basic salary / PF wage is required." as string | null, data: null };
    if (employeeNum === null || employerNum === null || ceilingNum === null) {
      return { error: "Enter valid numbers only (digits and an optional decimal point).", data: null };
    }
    const candidate = {
      monthlyWage: wageNum,
      employeeRatePct: employeeNum,
      employerRatePct: employerNum,
      applyCeiling,
      ceilingMonthly: ceilingNum,
    };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, wage, employeeRate, employerRate, applyCeiling, ceiling]);

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
    setEmployeeRate("12");
    setEmployerRate("12");
    setApplyCeiling(true);
    setCeiling("25000");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const text =
      "PF Contribution Estimate (monthly)\n" +
      `\nPF wage entered: ${formatINR(result.wageEntered)}/month` +
      `\nPF wage used: ${formatINR(result.wageUsed)}/month` +
      `\nEmployee PF (${result.employeeRatePct}%): ${formatINR(result.employeeMonthly)}/month` +
      `\nEmployer contribution (${result.employerRatePct}%): ${formatINR(result.employerMonthly)}/month` +
      `\nCombined: ${formatINR(result.combinedMonthly)}/month` +
      `\nAnnualized combined: ${formatINR(result.combinedAnnualized)}/year — estimate only`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Estimate only — not an official EPFO calculation. Actual contributions depend on scheme rules,
        your PF wage and your employer&apos;s payroll policy.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">PF wage &amp; rates</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="wage">Basic salary / PF wage, monthly (required)</FieldLabel>
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
              Usually basic plus DA — not CTC or gross salary.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="ceilingMode">Apply wage ceiling</FieldLabel>
            <Select id="ceilingMode" value={applyCeiling ? "yes" : "no"} onChange={(e) => setApplyCeiling(e.target.value === "yes")} aria-describedby="ceiling-hint">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
            <p id="ceiling-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Current rule: ₹25,000/month since 17 September 2026.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="employeeRate">Employee PF rate (%)</FieldLabel>
            <TextInput id="employeeRate" type="number" min="0" max="100" inputMode="decimal" placeholder="e.g. 12" value={employeeRate} onChange={(e) => setEmployeeRate(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="employerRate">Employer contribution rate (%)</FieldLabel>
            <TextInput id="employerRate" type="number" min="0" max="100" inputMode="decimal" placeholder="e.g. 12" value={employerRate} onChange={(e) => setEmployerRate(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="ceiling">Applicable monthly wage ceiling</FieldLabel>
            <InrInput id="ceiling" type="number" min="0" inputMode="decimal" placeholder="e.g. 25000" value={ceiling} onChange={(e) => setCeiling(e.target.value)} />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              An assumption, not a universal rule — confirm what your employer applies.
            </p>
          </div>
        </div>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate PF</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Employee PF contribution</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white" role="status">
            {formatINR(result.employeeMonthly)}
            <span className="text-base font-normal text-slate-500"> / month</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Employer: {formatINR(result.employerMonthly)} / month · Combined: {formatINR(result.combinedMonthly)} / month
          </p>

          <StatGrid
            items={[
              { label: "PF wage entered", value: `${formatINR(result.wageEntered)}/mo` },
              { label: "PF wage used", value: `${formatINR(result.wageUsed)}/mo` },
              { label: "Employee PF", value: `${formatINR(result.employeeMonthly)}/mo` },
              { label: "Employer contribution", value: `${formatINR(result.employerMonthly)}/mo` },
              { label: "Annualized employee", value: `${formatINR(result.employeeAnnualized)}/yr` },
              { label: "Annualized combined", value: `${formatINR(result.combinedAnnualized)}/yr` },
            ]}
          />

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Estimated employee PF deduction of {formatINR(result.employeeMonthly)}/month before other
            deductions — not a complete take-home calculation. Employer-side allocation may include
            EPF/EPS components under applicable rules. Rule reference: EPFO (
            <a href="https://www.epfindia.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">epfindia.gov.in</a>
            ). All calculations run locally in your browser — nothing is sent or stored.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
