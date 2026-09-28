/**
 * CTC to In-Hand Salary — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs.
 *
 * Tax rules are NOT duplicated here: slab tax, rebate, marginal relief,
 * cess and standard deduction are reused from lib/finance/salary-calculator.ts
 * (same FY 2024-25 / 2025-26 / 2026-27 rules, same simplified model:
 * standard deduction only, no HRA/80C, no surcharge, below-60 individual).
 *
 * Statutory basis for the optional assumptions (all user-overridable):
 * - PF: Employees' Provident Funds Scheme — 12% of basic wages + DA from
 *   both employer and employee (EPFO "Present Rates of Contribution" and
 *   EPF Scheme material). The wage ceiling was Rs 15,000/month for years;
 *   the Union Cabinet approved raising it to Rs 25,000/month with effect
 *   from 17 September 2026 (Ministry of Labour & Employment / PIB). Because
 *   the ceiling changed mid-FY 2026-27, it is a configurable input here
 *   (default Rs 25,000/month) — never a hardcoded universal claim.
 * - Gratuity: Payment of Gratuity Act, 1972 s.4(2) — 15 days' wages per
 *   completed year of service; for monthly-rated employees, monthly wage
 *   ÷ 26 × 15. The annual CTC provision estimate used here is therefore
 *   annual basic × 15/26 (≈4.81% of basic), which mirrors common employer
 *   provisioning practice. It is a CTC component, NOT monthly cash, and
 *   carries no eligibility/payout claim.
 *
 * Nothing here asserts an employer's actual salary structure: every
 * assumption (basic %, PF, gratuity, other components) is configurable.
 */

import {
  MAX_INPUT_AMOUNT,
  TAX_RULES_BY_FY,
  annualToMonthly,
  applyMarginalRelief,
  cessAmount,
  incomeTax,
  rebateAmount,
  sanitizeAmount,
  slabTax,
  taxableIncome,
  type FinancialYear,
  type TaxRegime,
} from "./salary-calculator";

/** Statutory EPF contribution rate (employer and employee). */
export const PF_RATE = 0.12;

/** Default PF wage ceiling: Rs 25,000/month (Rs 3,00,000/year), per the Sept 2026 enhancement. */
export const DEFAULT_PF_CEILING_ANNUAL = 300000;

/** Gratuity provision factor: 15 days' wages per year ÷ 26-day month. */
export const GRATUITY_FACTOR = 15 / 26;

export interface CtcToInHandInput {
  annualCtc: number;
  /** Basic salary as a percentage of CTC (0–100). An assumption, not a universal rule. */
  basicPct: number;
  /** Annual variable pay / bonus included in CTC. Paid separately, not guaranteed monthly. */
  bonusAnnual: number;
  includeEmployerPf: boolean;
  /** Manual employer PF override (annual). 0 or less means "auto-estimate". */
  employerPfManualAnnual: number;
  includeGratuity: boolean;
  /** Manual gratuity override (annual). 0 or less means "auto-estimate". */
  gratuityManualAnnual: number;
  /** Other employer-side CTC components (insurance, NPS, benefits...). */
  otherEmployerAnnual: number;
  /** Apply the PF wage ceiling to the 12% estimate. Off = 12% of full basic. */
  usePfCeiling: boolean;
  /** PF wage ceiling (annual basic considered). Configurable — changed mid-FY 2026-27. */
  pfCeilingAnnual: number;
  /** Manual employee PF override (annual). 0 or less means "auto-estimate". */
  employeePfManualAnnual: number;
  professionalTaxAnnual: number;
  otherDeductionsAnnual: number;
  regime: TaxRegime;
  financialYear: FinancialYear;
}

export interface CtcBridgeResult {
  annualCtc: number;
  basicPct: number;
  basicAnnual: number;
  bonusAnnual: number;
  employerPfAnnual: number;
  employerPfAuto: boolean;
  gratuityAnnual: number;
  gratuityAuto: boolean;
  otherEmployerAnnual: number;
  totalEmployerComponents: number;
  /** CTC minus employer-side components: the cash compensation envelope. */
  grossCashAnnual: number;
  /** Gross cash minus annual bonus: the regular monthly-pay envelope. */
  fixedGrossAnnual: number;
  employeePfAnnual: number;
  employeePfAuto: boolean;
  professionalTaxAnnual: number;
  otherDeductionsAnnual: number;
  standardDeduction: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  cess: number;
  incomeTax: number;
  takeHomeAnnual: number;
  /** takeHomeAnnual / 12 — an average, not a guaranteed monthly payslip. */
  averageMonthlyInHand: number;
  /** (takeHomeAnnual − bonus) / 12 — indicative regular month before bonus payout. */
  regularMonthlyInHand: number;
}

/** Basic salary derived from CTC and the configured percentage. */
export function basicFromCtc(annualCtc: number, basicPct: number): number {
  const pct = Math.min(Math.max(sanitizeAmount(basicPct), 0), 100);
  return (sanitizeAmount(annualCtc) * pct) / 100;
}

/** PF-contributable basic: capped at the ceiling when enabled. */
export function pfWageBase(basicAnnual: number, useCeiling: boolean, ceilingAnnual: number): number {
  const basic = sanitizeAmount(basicAnnual);
  if (!useCeiling) return basic;
  return Math.min(basic, sanitizeAmount(ceilingAnnual));
}

/** 12% PF estimate on the wage base. */
export function estimatePfContribution(
  basicAnnual: number,
  useCeiling: boolean,
  ceilingAnnual: number
): number {
  return pfWageBase(basicAnnual, useCeiling, ceilingAnnual) * PF_RATE;
}

/** Annual gratuity provision estimate: basic × 15/26 (see header note). */
export function estimateGratuity(basicAnnual: number): number {
  return sanitizeAmount(basicAnnual) * GRATUITY_FACTOR;
}

export interface EmployerShareResolution {
  employerPfAnnual: number;
  employerPfAuto: boolean;
  gratuityAnnual: number;
  gratuityAuto: boolean;
  otherEmployerAnnual: number;
  totalEmployerComponents: number;
}

/**
 * CTC bridge, step 1: resolve employer-side components and derive gross
 * cash compensation. Pure and bridge-only — no tax involved.
 */
export function resolveCtcBridge(input: CtcToInHandInput): EmployerShareResolution & {
  basicAnnual: number;
  grossCashAnnual: number;
} {
  const ctc = sanitizeAmount(input.annualCtc);
  const basicAnnual = basicFromCtc(ctc, input.basicPct);

  const employerPfAnnual = !input.includeEmployerPf
    ? 0
    : sanitizeAmount(input.employerPfManualAnnual) > 0
      ? Math.min(sanitizeAmount(input.employerPfManualAnnual), MAX_INPUT_AMOUNT)
      : estimatePfContribution(basicAnnual, input.usePfCeiling, input.pfCeilingAnnual);
  const employerPfAuto = input.includeEmployerPf && sanitizeAmount(input.employerPfManualAnnual) <= 0;

  const gratuityAnnual = !input.includeGratuity
    ? 0
    : sanitizeAmount(input.gratuityManualAnnual) > 0
      ? Math.min(sanitizeAmount(input.gratuityManualAnnual), MAX_INPUT_AMOUNT)
      : estimateGratuity(basicAnnual);
  const gratuityAuto = input.includeGratuity && sanitizeAmount(input.gratuityManualAnnual) <= 0;

  const otherEmployerAnnual = sanitizeAmount(input.otherEmployerAnnual);
  const totalEmployerComponents = employerPfAnnual + gratuityAnnual + otherEmployerAnnual;

  return {
    employerPfAnnual,
    employerPfAuto,
    gratuityAnnual,
    gratuityAuto,
    otherEmployerAnnual,
    totalEmployerComponents,
    basicAnnual,
    grossCashAnnual: Math.max(ctc - totalEmployerComponents, 0),
  };
}

/** End-to-end CTC → in-hand estimation. All outputs are finite numbers. */
export function calculateCtcToInHand(input: CtcToInHandInput): CtcBridgeResult {
  const fyRules = TAX_RULES_BY_FY[input.financialYear];
  const rules = input.regime === "new" ? fyRules.newRegime : fyRules.oldRegime;

  const annualCtc = sanitizeAmount(input.annualCtc);
  const bonusAnnual = sanitizeAmount(input.bonusAnnual);
  const bridge = resolveCtcBridge(input);
  const grossCashAnnual = Math.min(bridge.grossCashAnnual, annualCtc);
  const fixedGrossAnnual = Math.max(grossCashAnnual - Math.min(bonusAnnual, grossCashAnnual), 0);

  const employeePfAnnual = sanitizeAmount(input.employeePfManualAnnual) > 0
    ? Math.min(sanitizeAmount(input.employeePfManualAnnual), MAX_INPUT_AMOUNT)
    : estimatePfContribution(bridge.basicAnnual, input.usePfCeiling, input.pfCeilingAnnual);
  const employeePfAuto = sanitizeAmount(input.employeePfManualAnnual) <= 0;
  const professionalTaxAnnual = sanitizeAmount(input.professionalTaxAnnual);
  const otherDeductionsAnnual = sanitizeAmount(input.otherDeductionsAnnual);

  const taxable = taxableIncome(grossCashAnnual, rules);
  const tax = incomeTax(taxable, fyRules, input.regime);

  // Display breakdown via the same engine primitives (no new methodology).
  const slab = slabTax(taxable, rules.slabs);
  const rebate = rebateAmount(taxable, slab, rules);
  const afterRebate = applyMarginalRelief(taxable, slab - rebate, rules);
  const cess = cessAmount(afterRebate, fyRules.cessRate);

  const takeHomeAnnual = Math.max(
    grossCashAnnual - employeePfAnnual - professionalTaxAnnual - otherDeductionsAnnual - tax,
    0
  );

  return {
    annualCtc,
    basicPct: Math.min(Math.max(sanitizeAmount(input.basicPct), 0), 100),
    basicAnnual: bridge.basicAnnual,
    bonusAnnual: Math.min(bonusAnnual, grossCashAnnual),
    employerPfAnnual: bridge.employerPfAnnual,
    employerPfAuto: bridge.employerPfAuto,
    gratuityAnnual: bridge.gratuityAnnual,
    gratuityAuto: bridge.gratuityAuto,
    otherEmployerAnnual: bridge.otherEmployerAnnual,
    totalEmployerComponents: annualCtc - grossCashAnnual,
    grossCashAnnual,
    fixedGrossAnnual,
    employeePfAnnual,
    employeePfAuto,
    professionalTaxAnnual,
    otherDeductionsAnnual,
    standardDeduction: rules.standardDeduction,
    taxableIncome: taxable,
    slabTax: slab,
    rebate,
    cess,
    incomeTax: tax,
    takeHomeAnnual,
    averageMonthlyInHand: annualToMonthly(takeHomeAnnual),
    regularMonthlyInHand: annualToMonthly(Math.max(takeHomeAnnual - Math.min(bonusAnnual, grossCashAnnual), 0)),
  };
}
