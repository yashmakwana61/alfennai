"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type {
  SalaryCalculatorInput,
  SalaryCalculatorOutput,
} from "@/config/tools/salary-calculator.config";
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
  if (raw.trim() === "") return 0;
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

export function SalaryCalculator({ tool }: { tool: ToolConfig<SalaryCalculatorInput, SalaryCalculatorOutput> }) {
  const [ctc, setCtc] = useState("1200000");
  const [basic, setBasic] = useState("");
  const [basicMode, setBasicMode] = useState<"amount" | "percent">("amount");
  const [hra, setHra] = useState("");
  const [allowances, setAllowances] = useState("");
  const [bonus, setBonus] = useState("");
  const [pf, setPf] = useState("");
  const [profTax, setProfTax] = useState("");
  const [otherDed, setOtherDed] = useState("");
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [fy, setFy] = useState<"2024-25" | "2025-26">("2025-26");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (ctc.trim() === "") return { error: "Annual CTC is required." as string | null, data: null };
    const ctcNum = toNumber(ctc);
    const basicNum = toNumber(basic);
    const hraNum = toNumber(hra);
    const allowancesNum = toNumber(allowances);
    const bonusNum = toNumber(bonus);
    const pfNum = toNumber(pf);
    const profTaxNum = toNumber(profTax);
    const otherDedNum = toNumber(otherDed);
    const values = [ctcNum, basicNum, hraNum, allowancesNum, bonusNum, pfNum, profTaxNum, otherDedNum];
    if (values.some((v) => v === null)) {
      return { error: "Enter valid numbers only (digits and an optional decimal point).", data: null };
    }
    let basicAnnual = basicNum as number;
    if (basicMode === "percent") {
      if ((basicNum as number) > 100) {
        return { error: "Basic salary cannot be more than 100% of CTC.", data: null };
      }
      basicAnnual = ((ctcNum as number) * (basicNum as number)) / 100;
    }
    const candidate = {
      annualCtc: ctcNum as number,
      basicAnnual,
      hraAnnual: hraNum as number,
      otherAllowancesAnnual: allowancesNum as number,
      bonusAnnual: bonusNum as number,
      employeePfAnnual: pfNum as number,
      professionalTaxAnnual: profTaxNum as number,
      otherDeductionsAnnual: otherDedNum as number,
      regime,
      financialYear: fy,
    };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, ctc, basic, basicMode, hra, allowances, bonus, pf, profTax, otherDed, regime, fy]);

  const result = useMemo(
    () => (parsed.data ? tool.compute(parsed.data) : null),
    [tool, parsed.data]
  );

  function calculate() {
    setError(parsed.error);
    setCopied(false);
  }

  function reset() {
    setCtc("");
    setBasic("");
    setBasicMode("amount");
    setHra("");
    setAllowances("");
    setBonus("");
    setPf("");
    setProfTax("");
    setOtherDed("");
    setRegime("new");
    setFy("2025-26");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const text =
      `Estimated monthly take-home: ${formatINR(result.takeHomeMonthly)}\n` +
      `Estimated annual take-home: ${formatINR(result.takeHomeAnnual)}\n` +
      `Gross annual: ${formatINR(result.grossAnnual)} | Income tax: ${formatINR(result.incomeTax)} ` +
      `(${regime === "new" ? "New" : "Old"} regime, FY ${fy}) — estimate only`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Estimate only — not an official tax calculation. Your actual payslip may differ based on salary
        structure, exemptions and employer policies.
      </p>

      {/* CTC + regime */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Salary &amp; tax year</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel htmlFor="ctc">Annual CTC (required)</FieldLabel>
            <InrInput
              id="ctc"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 1200000"
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
              aria-describedby="ctc-hint"
            />
            <p id="ctc-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cost to Company per year, in INR.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="regime">Tax regime</FieldLabel>
            <Select id="regime" value={regime} onChange={(e) => setRegime(e.target.value as "new" | "old")}>
              <option value="new">New Tax Regime</option>
              <option value="old">Old Tax Regime</option>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="fy">Financial year</FieldLabel>
            <Select id="fy" value={fy} onChange={(e) => setFy(e.target.value as "2024-25" | "2025-26")}>
              <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
              <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* Salary components */}
      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          Salary breakup <span className="font-normal text-slate-500">(optional, per year)</span>
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="basic">Basic salary</FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <InrInput
                  id="basic"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder={basicMode === "percent" ? "e.g. 50" : "e.g. 600000"}
                  value={basic}
                  onChange={(e) => setBasic(e.target.value)}
                  aria-label={basicMode === "percent" ? "Basic salary as percent of CTC" : "Basic salary in INR per year"}
                />
              </div>
              <Select
                aria-label="Basic salary input mode"
                value={basicMode}
                onChange={(e) => setBasicMode(e.target.value as "amount" | "percent")}
                className="w-28 shrink-0"
              >
                <option value="amount">₹ / yr</option>
                <option value="percent">% of CTC</option>
              </Select>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="hra">HRA</FieldLabel>
            <InrInput id="hra" type="number" min="0" inputMode="decimal" placeholder="e.g. 300000" value={hra} onChange={(e) => setHra(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="allowances">Other allowances</FieldLabel>
            <InrInput id="allowances" type="number" min="0" inputMode="decimal" placeholder="e.g. 240000" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="bonus">Bonus / variable pay</FieldLabel>
            <InrInput id="bonus" type="number" min="0" inputMode="decimal" placeholder="e.g. 60000" value={bonus} onChange={(e) => setBonus(e.target.value)} />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Leave blank if you don&apos;t know the breakup — gross salary is then assumed equal to CTC and
          labelled as an assumption in the result.
        </p>
      </fieldset>

      {/* Deductions */}
      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          Deductions <span className="font-normal text-slate-500">(optional, per year)</span>
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel htmlFor="pf">Employee PF</FieldLabel>
            <InrInput id="pf" type="number" min="0" inputMode="decimal" placeholder="e.g. 72000" value={pf} onChange={(e) => setPf(e.target.value)} />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your contribution only, not the employer&apos;s.</p>
          </div>
          <div>
            <FieldLabel htmlFor="profTax">Professional tax</FieldLabel>
            <InrInput id="profTax" type="number" min="0" inputMode="decimal" placeholder="e.g. 2500" value={profTax} onChange={(e) => setProfTax(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="otherDed">Other deductions</FieldLabel>
            <InrInput id="otherDed" type="number" min="0" inputMode="decimal" placeholder="e.g. 0" value={otherDed} onChange={(e) => setOtherDed(e.target.value)} />
          </div>
        </div>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate take-home</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated monthly take-home</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {formatINR(result.takeHomeMonthly)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatINR(result.takeHomeAnnual)} per year
          </p>

          {result.grossAssumedFromCtc && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Assumption: no salary breakup entered, so gross salary was taken as equal to CTC. Enter a
              breakup above for a sharper estimate.
            </p>
          )}

          <StatGrid
            items={[
              { label: "Annual CTC", value: formatINR(result.annualCtc) },
              { label: "Gross annual", value: formatINR(result.grossAnnual) },
              { label: "Gross monthly", value: formatINR(result.grossMonthly) },
              { label: "Employee PF", value: formatINR(result.employeePfAnnual) },
              { label: "Professional tax", value: formatINR(result.professionalTaxAnnual) },
              { label: "Estimated income tax", value: formatINR(result.incomeTax) },
              { label: "Other deductions", value: formatINR(result.otherDeductionsAnnual) },
              { label: "Take-home annual", value: formatINR(result.takeHomeAnnual) },
              { label: "Take-home monthly", value: formatINR(result.takeHomeMonthly) },
            ]}
          />

          <details className="mt-5 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
              Detailed breakdown
            </summary>
            <dl className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between gap-4"><dt>Annual CTC</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.annualCtc)}</dd></div>
              {result.employerContributionsEstimate > 0 && (
                <div className="flex justify-between gap-4"><dt>Employer-side CTC share (not paid to you)</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.employerContributionsEstimate)}</dd></div>
              )}
              <div className="flex justify-between gap-4"><dt>Gross annual salary</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.grossAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Standard deduction ({regime === "new" ? "new" : "old"} regime)</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.standardDeduction)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Taxable income</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.taxableIncome)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Slab tax</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.slabTax)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Section 87A rebate</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.rebate)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Health &amp; education cess (4%)</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.cess)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Employee PF</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.employeePfAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Professional tax</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.professionalTaxAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Other deductions</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.otherDeductionsAnnual)}</dd></div>
            </dl>
          </details>

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Simplified model for FY {fy}: standard deduction only, no HRA/80C exemptions, no surcharge,
            individual below 60. All calculations run locally in your browser — nothing is sent or stored.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
