"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { HraToolInput, HraToolOutput } from "@/config/tools/hra-calculator.config";
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

const LIMIT_LABELS: Record<string, string> = {
  "actual-hra": "Actual HRA received",
  "rent-minus-10-percent": "Rent minus 10% of salary",
  "location-limit": "Location limit",
  none: "No exemption (new regime)",
};

export function HraCalculator({ tool }: { tool: ToolConfig<HraToolInput, HraToolOutput> }) {
  const [basic, setBasic] = useState("600000");
  const [da, setDa] = useState("");
  const [hra, setHra] = useState("300000");
  const [rent, setRent] = useState("360000");
  const [city, setCity] = useState<"metro" | "non-metro">("metro");
  const [regime, setRegime] = useState<"old" | "new">("old");
  const [period, setPeriod] = useState<"annual" | "monthly">("annual");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    const basicNum = toNumber(basic);
    const daNum = toNumber(da === "" ? "0" : da);
    const hraNum = toNumber(hra === "" ? "0" : hra);
    const rentNum = toNumber(rent === "" ? "0" : rent);
    if (basicNum === null) return { error: "Basic salary is required." as string | null, data: null };
    if (daNum === null || hraNum === null || rentNum === null) {
      return { error: "Enter valid numbers only (digits and an optional decimal point).", data: null };
    }
    // Convert monthly entries to annual once at the input boundary.
    const factor = period === "monthly" ? 12 : 1;
    const candidate = {
      basicAnnual: basicNum * factor,
      daEligibleAnnual: daNum * factor,
      hraReceivedAnnual: hraNum * factor,
      rentPaidAnnual: rentNum * factor,
      cityType: city,
      taxRegime: regime,
      period,
    };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, basic, da, hra, rent, city, regime, period]);

  const result = useMemo(
    () => (parsed.data ? tool.compute(parsed.data) : null),
    [tool, parsed.data]
  );

  function calculate() {
    setError(parsed.error);
    setCopied(false);
  }

  function reset() {
    setBasic("");
    setDa("");
    setHra("");
    setRent("");
    setCity("metro");
    setRegime("old");
    setPeriod("annual");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const text =
      "HRA Exemption Estimate\n" +
      `\nSalary basis (Basic + eligible DA): ${formatINR(result.salaryForHra)}/year` +
      `\nHRA exemption: ${formatINR(result.hraExemption)}/year` +
      `\nTaxable HRA: ${formatINR(result.taxableHra)}/year` +
      `\n(${city === "metro" ? "Metro (50%)" : "Non-metro (40%)"}, ${regime === "old" ? "old" : "new"} regime) — estimate only`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);
  const per = period === "monthly" ? "month" : "year";
  const disp = (annual: number) => (period === "monthly" ? formatINR(annual / 12) : formatINR(annual));

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Estimate only — not an official tax assessment. HRA exemption applies under the old tax regime;
        the new regime offers no Section 10(13A) exemption.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Salary, HRA &amp; rent</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="basic">Basic salary (required)</FieldLabel>
            <InrInput id="basic" type="number" min="0" inputMode="decimal" placeholder="e.g. 600000" value={basic} onChange={(e) => setBasic(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="da">DA forming part of retirement benefits</FieldLabel>
            <InrInput id="da" type="number" min="0" inputMode="decimal" placeholder="e.g. 0" value={da} onChange={(e) => setDa(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="hra">HRA received</FieldLabel>
            <InrInput id="hra" type="number" min="0" inputMode="decimal" placeholder="e.g. 300000" value={hra} onChange={(e) => setHra(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="rent">Rent paid</FieldLabel>
            <InrInput id="rent" type="number" min="0" inputMode="decimal" placeholder="e.g. 360000" value={rent} onChange={(e) => setRent(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="city">City type</FieldLabel>
            <Select id="city" value={city} onChange={(e) => setCity(e.target.value as "metro" | "non-metro")}>
              <option value="metro">Metro (50%)</option>
              <option value="non-metro">Non-metro (40%)</option>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="regime">Tax regime</FieldLabel>
            <Select id="regime" value={regime} onChange={(e) => setRegime(e.target.value as "old" | "new")}>
              <option value="old">Old Tax Regime</option>
              <option value="new">New Tax Regime</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="period">Input period</FieldLabel>
            <Select id="period" value={period} onChange={(e) => setPeriod(e.target.value as "annual" | "monthly")}>
              <option value="annual">Annual amounts</option>
              <option value="monthly">Monthly amounts</option>
            </Select>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Salary basis here is Basic plus eligible DA only — never CTC, gross salary, bonus or other allowances.
        </p>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate HRA</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">HRA exemption (old regime)</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white" role="status">
            {disp(result.hraExemption)}
            <span className="text-base font-normal text-slate-500"> / {per}</span>
          </p>
          {regime === "new" ? (
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              HRA exemption under Section 10(13A) is not available under the new tax regime.
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Taxable HRA: {disp(result.taxableHra)} / {per} · Limited by: {LIMIT_LABELS[result.limitingComponent]}
            </p>
          )}

          <StatGrid
            items={[
              { label: "Salary basis", value: `${disp(result.salaryForHra)} / ${per}` },
              { label: "Actual HRA (A)", value: `${disp(result.actualHraComponent)} / ${per}` },
              { label: "Rent − 10% salary (B)", value: `${disp(result.rentMinusTenPercentComponent)} / ${per}` },
              { label: `Location limit (C, ${result.locationRate * 100}%)`, value: `${disp(result.locationLimitComponent)} / ${per}` },
              { label: "HRA exemption", value: `${disp(result.hraExemption)} / ${per}` },
              { label: "Taxable HRA", value: `${disp(result.taxableHra)} / ${per}` },
            ]}
          />

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Exemption = least of the three limits above. All calculations run locally in your browser —
            nothing is sent or stored.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
