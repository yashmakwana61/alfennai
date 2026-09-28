"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type {
  CtcToInHandToolInput,
  CtcToInHandToolOutput,
} from "@/config/tools/ctc-to-in-hand.config";
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

function YesNo({ id, label, value, onChange, hint }: {
  id: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select id={id} value={value ? "yes" : "no"} onChange={(e) => onChange(e.target.value === "yes")} aria-describedby={hint ? `${id}-hint` : undefined}>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </Select>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function CtcToInHandCalculator({ tool }: { tool: ToolConfig<CtcToInHandToolInput, CtcToInHandToolOutput> }) {
  const [ctc, setCtc] = useState("1200000");
  const [basicPct, setBasicPct] = useState("50");
  const [bonus, setBonus] = useState("");
  const [includePf, setIncludePf] = useState(true);
  const [includeGratuity, setIncludeGratuity] = useState(true);
  const [profTax, setProfTax] = useState("");
  const [otherDed, setOtherDed] = useState("");
  const [pfManual, setPfManual] = useState("");
  const [useCeiling, setUseCeiling] = useState(true);
  const [ceiling, setCeiling] = useState("300000");
  const [empPfManual, setEmpPfManual] = useState("");
  const [gratuityManual, setGratuityManual] = useState("");
  const [otherEmployer, setOtherEmployer] = useState("");
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [fy, setFy] = useState<"2024-25" | "2025-26" | "2026-27">("2026-27");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (ctc.trim() === "") return { error: "Annual CTC is required." as string | null, data: null };
    const nums = {
      annualCtc: toNumber(ctc),
      basicPct: toNumber(basicPct),
      bonusAnnual: toNumber(bonus),
      employerPfManualAnnual: toNumber(pfManual),
      gratuityManualAnnual: toNumber(gratuityManual),
      otherEmployerAnnual: toNumber(otherEmployer),
      pfCeilingAnnual: toNumber(ceiling),
      employeePfManualAnnual: toNumber(empPfManual),
      professionalTaxAnnual: toNumber(profTax),
      otherDeductionsAnnual: toNumber(otherDed),
    };
    if (Object.values(nums).some((v) => v === null)) {
      return { error: "Enter valid numbers only (digits and an optional decimal point).", data: null };
    }
    const candidate = {
      annualCtc: nums.annualCtc as number,
      basicPct: nums.basicPct as number,
      bonusAnnual: nums.bonusAnnual as number,
      includeEmployerPf: includePf,
      employerPfManualAnnual: nums.employerPfManualAnnual as number,
      includeGratuity,
      gratuityManualAnnual: nums.gratuityManualAnnual as number,
      otherEmployerAnnual: nums.otherEmployerAnnual as number,
      usePfCeiling: useCeiling,
      pfCeilingAnnual: nums.pfCeilingAnnual as number,
      employeePfManualAnnual: nums.employeePfManualAnnual as number,
      professionalTaxAnnual: nums.professionalTaxAnnual as number,
      otherDeductionsAnnual: nums.otherDeductionsAnnual as number,
      regime,
      financialYear: fy,
    };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, ctc, basicPct, bonus, includePf, includeGratuity, profTax, otherDed, pfManual, useCeiling, ceiling, empPfManual, gratuityManual, otherEmployer, regime, fy]);

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
    setBasicPct("50");
    setBonus("");
    setIncludePf(true);
    setIncludeGratuity(true);
    setProfTax("");
    setOtherDed("");
    setPfManual("");
    setUseCeiling(true);
    setCeiling("300000");
    setEmpPfManual("");
    setGratuityManual("");
    setOtherEmployer("");
    setRegime("new");
    setFy("2026-27");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const text =
      `Estimated monthly in-hand: ${formatINR(result.averageMonthlyInHand)} (average)\n` +
      `Estimated annual in-hand: ${formatINR(result.takeHomeAnnual)}\n` +
      `CTC: ${formatINR(result.annualCtc)} | Gross cash: ${formatINR(result.grossCashAnnual)} | Tax: ${formatINR(result.incomeTax)} ` +
      `(${regime === "new" ? "New" : "Old"} regime, FY ${fy}) — estimate only`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Estimate only — not an official tax calculation. Confirm the structure assumptions against
        your offer letter; actual CTC components vary by employer.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">CTC &amp; tax year</legend>
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
            />
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
            <Select id="fy" value={fy} onChange={(e) => setFy(e.target.value as "2024-25" | "2025-26" | "2026-27")}>
              <option value="2026-27">FY 2026-27 (AY 2027-28)</option>
              <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
              <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
            </Select>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Salary structure assumptions</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="basicPct">Basic salary (% of CTC)</FieldLabel>
            <TextInput
              id="basicPct"
              type="number"
              min="0"
              max="100"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={basicPct}
              onChange={(e) => setBasicPct(e.target.value)}
              aria-describedby="basicPct-hint"
            />
            <p id="basicPct-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Common default is 50%, but this varies — check your offer letter.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="bonus">Annual bonus / variable pay</FieldLabel>
            <InrInput id="bonus" type="number" min="0" inputMode="decimal" placeholder="e.g. 0" value={bonus} onChange={(e) => setBonus(e.target.value)} />
          </div>
          <YesNo id="incrPf" label="Employer PF included in CTC?" value={includePf} onChange={setIncludePf} hint="Most offer letters include the employer's 12% contribution." />
          <YesNo id="inclGrat" label="Gratuity provision included in CTC?" value={includeGratuity} onChange={setIncludeGratuity} hint="A provision, not monthly cash you receive." />
        </div>

        <details className="mt-4 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
          <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
            Advanced salary assumptions
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="pfManual">Employer PF override (₹/yr)</FieldLabel>
              <InrInput id="pfManual" type="number" min="0" inputMode="decimal" placeholder="Auto-estimate" value={pfManual} onChange={(e) => setPfManual(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="gratuityManual">Gratuity override (₹/yr)</FieldLabel>
              <InrInput id="gratuityManual" type="number" min="0" inputMode="decimal" placeholder="Auto-estimate" value={gratuityManual} onChange={(e) => setGratuityManual(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="empPfManual">Employee PF override (₹/yr)</FieldLabel>
              <InrInput id="empPfManual" type="number" min="0" inputMode="decimal" placeholder="Auto-estimate" value={empPfManual} onChange={(e) => setEmpPfManual(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="otherEmployer">Other employer CTC components (₹/yr)</FieldLabel>
              <InrInput id="otherEmployer" type="number" min="0" inputMode="decimal" placeholder="e.g. insurance, NPS" value={otherEmployer} onChange={(e) => setOtherEmployer(e.target.value)} />
            </div>
            <div>
              <input
                id="useCeiling"
                type="checkbox"
                checked={useCeiling}
                onChange={(e) => setUseCeiling(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              <label htmlFor="useCeiling" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Use PF wage ceiling
              </label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                12% of basic up to the ceiling; unticked means 12% of full basic. The official ceiling
                changed during FY 2026-27, so confirm your employer&apos;s treatment for the estimate.
              </p>
            </div>
            <div>
              <FieldLabel htmlFor="ceiling">PF wage ceiling (₹/yr of basic)</FieldLabel>
              <InrInput id="ceiling" type="number" min="0" inputMode="decimal" placeholder="e.g. 300000" value={ceiling} onChange={(e) => setCeiling(e.target.value)} />
            </div>
          </div>
        </details>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          Employee deductions <span className="font-normal text-slate-500">(optional, per year)</span>
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="profTax">Professional tax</FieldLabel>
            <InrInput id="profTax" type="number" min="0" inputMode="decimal" placeholder="e.g. 2500" value={profTax} onChange={(e) => setProfTax(e.target.value)} />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Varies by state — enter your applicable amount.</p>
          </div>
          <div>
            <FieldLabel htmlFor="otherDed">Other deductions</FieldLabel>
            <InrInput id="otherDed" type="number" min="0" inputMode="decimal" placeholder="e.g. 0" value={otherDed} onChange={(e) => setOtherDed(e.target.value)} />
          </div>
        </div>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate in-hand</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated monthly in-hand</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {formatINR(result.averageMonthlyInHand)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatINR(result.takeHomeAnnual)} per year · average — not a guaranteed monthly payslip
          </p>

          <StatGrid
            items={[
              { label: "Annual CTC", value: formatINR(result.annualCtc) },
              { label: "Gross cash salary", value: formatINR(result.grossCashAnnual) },
              { label: "Estimated income tax", value: formatINR(result.incomeTax) },
              { label: "Take-home annual", value: formatINR(result.takeHomeAnnual) },
              { label: "Regular monthly (excl. bonus)", value: formatINR(result.regularMonthlyInHand) },
              { label: "Annual bonus", value: formatINR(result.bonusAnnual) },
            ]}
          />

          <details className="mt-5 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
              CTC bridge breakdown
            </summary>
            <dl className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between gap-4"><dt>Annual CTC</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.annualCtc)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Employer PF{result.employerPfAuto ? " (estimated)" : ""}</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.employerPfAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Gratuity provision{result.gratuityAuto ? " (estimated)" : ""}</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.gratuityAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Other employer components</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.otherEmployerAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Gross cash salary</dt><dd className="font-medium text-slate-900 dark:text-white">{formatINR(result.grossCashAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Employee PF{result.employeePfAuto ? " (estimated)" : ""}</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.employeePfAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Professional tax</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.professionalTaxAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Other deductions</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.otherDeductionsAnnual)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Less: Estimated income tax</dt><dd className="font-medium text-slate-900 dark:text-white">− {formatINR(result.incomeTax)}</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Estimated gratuity provision — part of CTC, not monthly cash pay. Bonus of {formatINR(result.bonusAnnual)} a
              year is included in the annual take-home above; monthly cash flow depends on when your employer pays it.
            </p>
          </details>

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Simplified model for FY {fy}: employer assumptions as configured above, standard deduction only,
            no HRA/80C, no surcharge, individual below 60. Runs locally in your browser — nothing is sent or stored.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
