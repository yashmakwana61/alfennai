/**
 * PF Calculator — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs.
 *
 * This engine is deliberately independent: it imports NOTHING from the
 * salary tax engine or the CTC bridge. No tax slabs, no rebate, no cess,
 * no standard deduction, no CTC logic live here.
 *
 * Model (current-month estimate):
 *   wageUsed          = applyCeiling ? min(monthlyWage, ceilingMonthly) : monthlyWage
 *   employeeMonthly   = wageUsed × employeeRatePct / 100
 *   employerMonthly   = wageUsed × employerRatePct / 100
 *   combinedMonthly   = employeeMonthly + employerMonthly
 *   annualized figures = monthly × 12, explicitly labelled as annualized
 *   estimates — never as reconstructed actuals.
 *
 * Statutory context (assumptions, all user-overridable):
 * - EPF Scheme contribution rate: 12% of basic wages + DA from both
 *   employer and employee (EPFO "Present Rates of Contribution" material).
 * - Wage ceiling: Rs 15,000/month for years; enhanced to Rs 25,000/month
 *   with effect from 17 September 2026 (Union Cabinet decision, Gazette
 *   Notification S.O. 5109(E) under the Code on Social Security, 2020;
 *   Ministry of Labour & Employment / PIB, September 2026). Because the
 *   ceiling changed mid-FY 2026-27, it is a configurable input here —
 *   never a hardcoded universal claim — and this calculator estimates one
 *   representative current month rather than reconstructing earlier months.
 * - The employer 12% is a combined statutory share whose allocation may
 *   include EPF/EPS components under applicable scheme rules; this V1 does
 *   NOT model any EPF/EPS split and reports a single employer estimate.
 */

export const DEFAULT_EMPLOYEE_RATE_PCT = 12;
export const DEFAULT_EMPLOYER_RATE_PCT = 12;

/** Current EPFO wage ceiling assumption: Rs 25,000/month (see header note). */
export const DEFAULT_CEILING_MONTHLY = 25000;

/** Sensible upper bounds for validation (engine clamps too). */
export const MAX_MONTHLY_WAGE = 10000000; // Rs 1 crore/month
export const MAX_RATE_PCT = 100;
export const MAX_CEILING_MONTHLY = 10000000;

function clampAmount(value: unknown, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

function clampRate(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_RATE_PCT);
}

export interface PfCalculatorInput {
  /** User-entered Basic Salary / PF wage (monthly). Never assumed from CTC. */
  monthlyWage: number;
  employeeRatePct: number;
  employerRatePct: number;
  applyCeiling: boolean;
  ceilingMonthly: number;
}

export interface PfCalculatorResult {
  wageEntered: number;
  applyCeiling: boolean;
  ceilingMonthly: number;
  /** min(wage, ceiling) when enabled, else wage. */
  wageUsed: number;
  employeeRatePct: number;
  employerRatePct: number;
  employeeMonthly: number;
  employerMonthly: number;
  combinedMonthly: number;
  employeeAnnualized: number;
  employerAnnualized: number;
  combinedAnnualized: number;
}

/** PF wage used for the estimate: capped at the ceiling only when enabled. */
export function pfWageUsed(monthlyWage: number, applyCeiling: boolean, ceilingMonthly: number): number {
  const wage = clampAmount(monthlyWage, MAX_MONTHLY_WAGE);
  if (!applyCeiling) return wage;
  return Math.min(wage, clampAmount(ceilingMonthly, MAX_CEILING_MONTHLY));
}

/** One side's monthly contribution: wage used × rate / 100. */
export function pfContribution(wageUsed: number, ratePct: number): number {
  return clampAmount(wageUsed, MAX_MONTHLY_WAGE) * (clampRate(ratePct) / 100);
}

/** End-to-end monthly PF estimation. All outputs are finite numbers. */
export function calculatePf(input: PfCalculatorInput): PfCalculatorResult {
  const wageEntered = clampAmount(input.monthlyWage, MAX_MONTHLY_WAGE);
  const applyCeiling = input.applyCeiling === true;
  const ceilingMonthly = clampAmount(input.ceilingMonthly, MAX_CEILING_MONTHLY);
  const employeeRatePct = clampRate(input.employeeRatePct);
  const employerRatePct = clampRate(input.employerRatePct);

  const wageUsed = pfWageUsed(wageEntered, applyCeiling, ceilingMonthly);
  const employeeMonthly = pfContribution(wageUsed, employeeRatePct);
  const employerMonthly = pfContribution(wageUsed, employerRatePct);
  const combinedMonthly = employeeMonthly + employerMonthly;

  return {
    wageEntered,
    applyCeiling,
    ceilingMonthly,
    wageUsed,
    employeeRatePct,
    employerRatePct,
    employeeMonthly,
    employerMonthly,
    combinedMonthly,
    employeeAnnualized: employeeMonthly * 12,
    employerAnnualized: employerMonthly * 12,
    combinedAnnualized: combinedMonthly * 12,
  };
}
