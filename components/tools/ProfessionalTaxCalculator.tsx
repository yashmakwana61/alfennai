"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type {
  ProfessionalTaxToolInput,
  ProfessionalTaxToolOutput,
} from "@/config/tools/professional-tax-calculator.config";
import {
  FieldLabel,
  TextInput,
  Select,
  ErrorText,
  ResultCard,
  StatGrid,
} from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";
import { PT_RULES, getStateRule } from "@/lib/finance/professional-tax-calculator";
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

export function ProfessionalTaxCalculator({ tool }: { tool: ToolConfig<ProfessionalTaxToolInput, ProfessionalTaxToolOutput> }) {
  const [stateCode, setStateCode] = useState("MH");
  const [salary, setSalary] = useState("30000");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rule = getStateRule(stateCode);
  const needsGender = rule?.femaleExemptUpTo !== undefined;

  const parsed = useMemo(() => {
    if (salary.trim() === "") return { error: "Monthly salary is required." as string | null, data: null };
    const salaryNum = toNumber(salary);
    if (salaryNum === null) {
      return { error: "Enter a valid salary (digits and an optional decimal point).", data: null };
    }
    const candidate = { stateCode, monthlySalary: salaryNum, gender };
    const result = tool.inputSchema.safeParse(candidate);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid input.", data: null };
    }
    return { error: null, data: result.data };
  }, [tool, stateCode, salary, gender]);

  const result = useMemo(
    () => (parsed.data ? tool.compute(parsed.data) : null),
    [tool, parsed.data]
  );

  function calculate() {
    setError(parsed.error);
    setCopied(false);
  }

  function reset() {
    setStateCode("MH");
    setSalary("");
    setGender("male");
    setError(null);
    setCopied(false);
  }

  function copyResult() {
    if (!result || !result.supported) return;
    const text =
      "Professional Tax Estimate\n" +
      `\nState: ${result.stateName}` +
      `\nMonthly salary: ${formatINR(result.monthlySalary)}` +
      `\nSlab: ${result.applicableSlab}` +
      `\nMonthly PT: ${formatINR(result.monthlyProfessionalTax)}` +
      `\nAnnual PT: ${formatINR(result.annualProfessionalTax)} — estimate only`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  const showError = error ?? (parsed.data ? null : parsed.error);

  return (
    <div>
      <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Estimate for salaried employment under verified state rules only — not an official assessment.
        Rules shown here are currently verified for the selected state.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">State &amp; salary</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="state">State / UT of employment</FieldLabel>
            <Select id="state" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
              {PT_RULES.map((r) => (
                <option key={r.stateCode} value={r.stateCode}>{r.stateName}</option>
              ))}
              <option value="OTHER">Other state / UT (not covered)</option>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="salary">Monthly salary / wages (required)</FieldLabel>
            <InrInput
              id="salary"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 30000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              aria-describedby="salary-hint"
            />
            <p id="salary-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The salary figure your employer&apos;s payroll uses — not CTC.
            </p>
          </div>
          {needsGender && (
            <div>
              <FieldLabel htmlFor="gender">Employee category</FieldLabel>
              <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}>
                <option value="male">Male employee</option>
                <option value="female">Female employee</option>
              </Select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Maharashtra exempts women earning up to ₹25,000/month.
              </p>
            </div>
          )}
        </div>
      </fieldset>

      <ErrorText>{showError}</ErrorText>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate PT</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>

      {result && result.supported && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly professional tax</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white" role="status">
            {formatINR(result.monthlyProfessionalTax)}
            <span className="text-base font-normal text-slate-500"> / month</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatINR(result.annualProfessionalTax)} per year · {result.applicableSlab}
          </p>

          <StatGrid
            items={[
              { label: "State", value: result.stateName },
              { label: "Salary basis", value: result.salaryBasis },
              { label: "Applicable slab", value: result.applicableSlab },
              { label: "February deduction", value: formatINR(result.februaryProfessionalTax) },
              { label: "Annual PT", value: formatINR(result.annualProfessionalTax) },
              { label: "Rule basis", value: result.effectiveNote },
            ]}
          />

          <div className="mt-4">
            <LinkButton onClick={copyResult} aria-live="polite">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy result"}
            </LinkButton>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {result.notes} Source: {result.sourceLabel} (
            <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              official source
            </a>
            ). All calculations run locally in your browser — nothing is sent or stored.
          </p>
        </ResultCard>
      )}

      {result && !result.supported && (
        <ResultCard>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Not covered</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white" role="status">
            This state is not yet covered by our verified professional-tax rules.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {result.notes} Select a verified state above, or check the state&apos;s official
            commercial-tax portal for the applicable rule.
          </p>
        </ResultCard>
      )}
    </div>
  );
}
