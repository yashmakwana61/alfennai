/**
 * Salary Calculator India — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs.
 *
 * Tax-rule source:
 * - FY 2024-25 (AY 2025-26): new-regime slabs u/s 115BAC as amended by
 *   Finance Act 2024 (nil to 3L, 5% 3-7L, 10% 7-10L, 15% 10-12L, 20% 12-15L,
 *   30% above 15L), section 87A rebate up to Rs 25,000 for taxable income
 *   up to Rs 7,00,000 with marginal relief just above that level, standard
 *   deduction Rs 75,000 for salaried taxpayers; old-regime slabs unchanged
 *   (nil to 2.5L, 5% 2.5-5L, 20% 5-10L, 30% above 10L), 87A rebate up to
 *   Rs 12,500 for taxable income up to Rs 5,00,000, standard deduction
 *   Rs 50,000. Health & education cess 4% in both regimes.
 * - FY 2025-26 (AY 2026-27): new-regime slabs restructured by Union Budget
 *   2025 (nil to 4L, 5% 4-8L, 10% 8-12L, 15% 12-16L, 20% 16-20L, 25% 20-24L,
 *   30% above 24L), section 87A rebate up to Rs 60,000 for taxable income
 *   up to Rs 12,00,000 with marginal relief just above that level, standard
 *   deduction Rs 75,000 (unchanged); old regime unchanged from FY 2024-25.
 *   Health & education cess 4%.
 *
 * Simplifications (shown to the user as assumptions, not hidden):
 * - Individual below 60 years (basic exemption Rs 2,50,000, old regime).
 * - Surcharge on very high incomes is NOT modelled.
 * - No Chapter VI-A deductions (80C etc.), HRA exemption or professional-tax
 *   relief is modelled: taxable income = gross salary minus the standard
 *   deduction only. Old-regime tax may therefore read higher than a payslip
 *   where such deductions are claimed.
 */

export type TaxRegime = "new" | "old";
export type FinancialYear = "2024-25" | "2025-26";

export interface TaxSlab {
  /** Slab upper bound (inclusive). Use Number.POSITIVE_INFINITY for the last slab. */
  upTo: number;
  rate: number; // e.g. 0.05 for 5%
}

export interface RegimeTaxRules {
  slabs: TaxSlab[];
  /** Section 87A: full rebate of slab tax when taxable income <= this limit. */
  rebateLimit: number;
  /** Marginal relief: when income is just above rebateLimit, tax is capped at (income - rebateLimit). */
  marginalRelief: boolean;
  /** Standard deduction for salaried taxpayers. */
  standardDeduction: number;
}

export interface FinancialYearTaxRules {
  financialYear: FinancialYear;
  assessmentYear: string;
  cessRate: number; // 0.04 = 4% health & education cess
  newRegime: RegimeTaxRules;
  oldRegime: RegimeTaxRules;
}

export const MAX_INPUT_AMOUNT = 100_00_00_000; // Rs 100 crore — guards against absurd input

const INFINITY = Number.POSITIVE_INFINITY;

export const TAX_RULES_BY_FY: Record<FinancialYear, FinancialYearTaxRules> = {
  "2024-25": {
    financialYear: "2024-25",
    assessmentYear: "2025-26",
    cessRate: 0.04,
    newRegime: {
      slabs: [
        { upTo: 300000, rate: 0 },
        { upTo: 700000, rate: 0.05 },
        { upTo: 1000000, rate: 0.1 },
        { upTo: 1200000, rate: 0.15 },
        { upTo: 1500000, rate: 0.2 },
        { upTo: INFINITY, rate: 0.3 },
      ],
      rebateLimit: 700000,
      marginalRelief: true,
      standardDeduction: 75000,
    },
    oldRegime: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.2 },
        { upTo: INFINITY, rate: 0.3 },
      ],
      rebateLimit: 500000,
      marginalRelief: false,
      standardDeduction: 50000,
    },
  },
  "2025-26": {
    financialYear: "2025-26",
    assessmentYear: "2026-27",
    cessRate: 0.04,
    newRegime: {
      slabs: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.1 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.2 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: INFINITY, rate: 0.3 },
      ],
      rebateLimit: 1200000,
      marginalRelief: true,
      standardDeduction: 75000,
    },
    oldRegime: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.2 },
        { upTo: INFINITY, rate: 0.3 },
      ],
      rebateLimit: 500000,
      marginalRelief: false,
      standardDeduction: 50000,
    },
  },
};

export interface SalaryComponents {
  basicAnnual: number;
  hraAnnual: number;
  otherAllowancesAnnual: number;
  bonusAnnual: number;
}

export interface SalaryDeductions {
  employeePfAnnual: number;
  professionalTaxAnnual: number;
  otherDeductionsAnnual: number;
}

export interface SalaryTaxResult {
  annualCtc: number;
  grossAnnual: number;
  grossMonthly: number;
  /** True when no salary components were supplied, so gross was assumed equal to CTC. */
  grossAssumedFromCtc: boolean;
  /** CTC minus gross: employer contributions / CTC-only components. Never negative. */
  employerContributionsEstimate: number;
  employeePfAnnual: number;
  professionalTaxAnnual: number;
  otherDeductionsAnnual: number;
  totalEmployeeDeductions: number;
  standardDeduction: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  taxAfterRebate: number;
  cess: number;
  incomeTax: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
}

export function sanitizeAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_INPUT_AMOUNT);
}

/** Sum of the salary components that make up gross salary. */
export function componentsToGross(c: SalaryComponents): number {
  return (
    sanitizeAmount(c.basicAnnual) +
    sanitizeAmount(c.hraAnnual) +
    sanitizeAmount(c.otherAllowancesAnnual) +
    sanitizeAmount(c.bonusAnnual)
  );
}

export interface GrossResolution {
  grossAnnual: number;
  grossAssumedFromCtc: boolean;
  employerContributionsEstimate: number;
}

/**
 * CTC is NOT gross salary: CTC also bundles employer-side costs (employer PF,
 * gratuity, insurance, etc.). When the user supplies salary components, gross
 * is their sum; otherwise gross is assumed equal to CTC and flagged.
 */
export function resolveGrossSalary(annualCtc: number, components: SalaryComponents): GrossResolution {
  const ctc = sanitizeAmount(annualCtc);
  const sum = componentsToGross(components);
  const hasComponents =
    components.basicAnnual > 0 ||
    components.hraAnnual > 0 ||
    components.otherAllowancesAnnual > 0 ||
    components.bonusAnnual > 0;
  if (!hasComponents) {
    return { grossAnnual: ctc, grossAssumedFromCtc: true, employerContributionsEstimate: 0 };
  }
  return {
    grossAnnual: Math.min(sum, ctc),
    grossAssumedFromCtc: false,
    employerContributionsEstimate: Math.max(ctc - sum, 0),
  };
}

/** Annual → monthly conversion. */
export function annualToMonthly(annual: number): number {
  const n = sanitizeAmount(annual);
  return n / 12;
}

/** Sum of employee-side deductions (excludes income tax). */
export function totalDeductions(d: SalaryDeductions): number {
  return (
    sanitizeAmount(d.employeePfAnnual) +
    sanitizeAmount(d.professionalTaxAnnual) +
    sanitizeAmount(d.otherDeductionsAnnual)
  );
}

/** Taxable income = gross salary minus the regime's standard deduction, floored at 0. */
export function taxableIncome(grossAnnual: number, rules: RegimeTaxRules): number {
  return Math.max(sanitizeAmount(grossAnnual) - rules.standardDeduction, 0);
}

/** Plain slab tax on taxable income (before rebate/cess). */
export function slabTax(taxable: number, slabs: TaxSlab[]): number {
  const income = Math.max(sanitizeAmount(taxable), 0);
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (income <= lower) break;
    const portion = Math.min(income, slab.upTo) - lower;
    tax += portion * slab.rate;
    lower = slab.upTo;
  }
  return tax;
}

/**
 * Section 87A rebate: full rebate of slab tax when taxable income is within
 * the limit; otherwise zero. Returns the rebate amount.
 */
export function rebateAmount(taxable: number, slabTaxValue: number, rules: RegimeTaxRules): number {
  if (taxable <= rules.rebateLimit) return slabTaxValue;
  return 0;
}

/**
 * Marginal relief (new regime): just above the rebate limit, the extra tax
 * payable must not exceed the extra income earned. Caps tax-after-rebate at
 * (taxable - rebateLimit) when the slab tax overshoots that excess.
 */
export function applyMarginalRelief(
  taxable: number,
  taxAfterRebate: number,
  rules: RegimeTaxRules
): number {
  if (!rules.marginalRelief) return taxAfterRebate;
  if (taxable <= rules.rebateLimit) return taxAfterRebate;
  const excess = taxable - rules.rebateLimit;
  return Math.min(taxAfterRebate, Math.max(excess, 0));
}

/** Health & education cess on tax after rebate/relief. */
export function cessAmount(taxAfterRebate: number, cessRate: number): number {
  return Math.max(sanitizeAmount(taxAfterRebate), 0) * cessRate;
}

/** Full income-tax computation for one regime/FY. Never returns NaN/Infinity. */
export function incomeTax(taxable: number, fyRules: FinancialYearTaxRules, regime: TaxRegime): number {
  const rules = regime === "new" ? fyRules.newRegime : fyRules.oldRegime;
  const safe = Math.max(sanitizeAmount(taxable), 0);
  const slab = slabTax(safe, rules.slabs);
  const rebate = rebateAmount(safe, slab, rules);
  const afterRebate = applyMarginalRelief(safe, slab - rebate, rules);
  return afterRebate + cessAmount(afterRebate, fyRules.cessRate);
}

/**
 * Final take-home: gross minus employee deductions minus income tax,
 * floored at 0 so deductions can never drive it negative.
 */
export function takeHome(grossAnnual: number, employeeDeductions: number, tax: number): number {
  return Math.max(
    sanitizeAmount(grossAnnual) - sanitizeAmount(employeeDeductions) - sanitizeAmount(tax),
    0
  );
}

export interface SalaryCalculationInput {
  annualCtc: number;
  components: SalaryComponents;
  deductions: SalaryDeductions;
  regime: TaxRegime;
  financialYear: FinancialYear;
}

/** End-to-end salary estimation. All outputs are finite numbers. */
export function calculateSalary(input: SalaryCalculationInput): SalaryTaxResult {
  const fyRules = TAX_RULES_BY_FY[input.financialYear];
  const rules = input.regime === "new" ? fyRules.newRegime : fyRules.oldRegime;

  const annualCtc = sanitizeAmount(input.annualCtc);
  const { grossAnnual, grossAssumedFromCtc, employerContributionsEstimate } = resolveGrossSalary(
    annualCtc,
    input.components
  );

  const employeePfAnnual = sanitizeAmount(input.deductions.employeePfAnnual);
  const professionalTaxAnnual = sanitizeAmount(input.deductions.professionalTaxAnnual);
  const otherDeductionsAnnual = sanitizeAmount(input.deductions.otherDeductionsAnnual);
  const totalEmployeeDeductions = employeePfAnnual + professionalTaxAnnual + otherDeductionsAnnual;

  const taxable = taxableIncome(grossAnnual, rules);
  const slab = slabTax(taxable, rules.slabs);
  const rebate = rebateAmount(taxable, slab, rules);
  const taxAfterRebate = applyMarginalRelief(taxable, slab - rebate, rules);
  const cess = cessAmount(taxAfterRebate, fyRules.cessRate);
  const tax = taxAfterRebate + cess;

  const takeHomeAnnual = takeHome(grossAnnual, totalEmployeeDeductions, tax);

  return {
    annualCtc,
    grossAnnual,
    grossMonthly: annualToMonthly(grossAnnual),
    grossAssumedFromCtc,
    employerContributionsEstimate,
    employeePfAnnual,
    professionalTaxAnnual,
    otherDeductionsAnnual,
    totalEmployeeDeductions,
    standardDeduction: rules.standardDeduction,
    taxableIncome: taxable,
    slabTax: slab,
    rebate,
    taxAfterRebate,
    cess,
    incomeTax: tax,
    takeHomeAnnual,
    takeHomeMonthly: annualToMonthly(takeHomeAnnual),
  };
}

/** Indian-rupee formatting with full amounts (no abbreviations like "12L"). */
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return inrFormatter.format(Math.round(n));
}
