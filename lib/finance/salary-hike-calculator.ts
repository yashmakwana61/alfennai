/**
 * Salary Hike Calculator — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs.
 *
 * This module is mathematically independent from the salary tax engine: it
 * performs no tax, PF, gratuity or CTC computation. It only reuses the
 * generic numeric guard (sanitizeAmount) and the INR formatter from
 * lib/finance/salary-calculator.ts — no tax rules are imported or duplicated.
 *
 * Formulas:
 *   hikeAmount         = currentSalary × hikePercentage / 100
 *   revisedSalary      = currentSalary + hikeAmount
 *   percentageIncrease = hikeAmount / currentSalary × 100
 *
 * Intermediate values keep full precision (no premature rounding); display
 * rounding happens only via formatINR at the UI boundary.
 */

import { MAX_INPUT_AMOUNT, sanitizeAmount } from "./salary-calculator";

export type SalaryPeriod = "annual" | "monthly";

/** Sensible upper bound for a hike percentage (schema-enforced; engine clamps too). */
export const MAX_HIKE_PCT = 1000;

export interface SalaryHikeInput {
  currentSalary: number;
  hikePct: number;
  period: SalaryPeriod;
}

export interface SalaryHikeResult {
  period: SalaryPeriod;
  hikePct: number;
  currentAnnual: number;
  hikeAnnual: number;
  revisedAnnual: number;
  currentMonthly: number;
  hikeMonthly: number;
  revisedMonthly: number;
}

/** Hike amount = current salary × hike percentage / 100. */
export function hikeAmount(currentSalary: number, hikePct: number): number {
  return (sanitizeAmount(currentSalary) * sanitizeAmount(hikePct)) / 100;
}

/** Revised salary = current salary + hike amount. */
export function revisedSalary(currentSalary: number, hikePct: number): number {
  const current = sanitizeAmount(currentSalary);
  return current + hikeAmount(current, hikePct);
}

/**
 * Equivalent percentage increase = hike amount / current salary × 100.
 * Returns 0 for a zero current salary instead of dividing by zero.
 */
export function percentageIncrease(currentSalary: number, hikeAmt: number): number {
  const current = sanitizeAmount(currentSalary);
  if (current <= 0) return 0;
  return (sanitizeAmount(hikeAmt) / current) * 100;
}

/**
 * End-to-end hike calculation. Computes in the selected period's units and
 * derives exact equivalents (÷12 / ×12). All outputs are finite numbers.
 */
export function calculateHike(input: SalaryHikeInput): SalaryHikeResult {
  const pct = Math.min(sanitizeAmount(input.hikePct), MAX_HIKE_PCT);
  const period: SalaryPeriod = input.period === "monthly" ? "monthly" : "annual";

  let currentAnnual: number;
  let hikeAnnual: number;
  let revisedAnnual: number;
  if (period === "annual") {
    currentAnnual = sanitizeAmount(input.currentSalary);
    hikeAnnual = (currentAnnual * pct) / 100;
    revisedAnnual = currentAnnual + hikeAnnual;
  } else {
    const currentMonthly = sanitizeAmount(input.currentSalary);
    const hikeMonthly = (currentMonthly * pct) / 100;
    const revisedMonthly = currentMonthly + hikeMonthly;
    currentAnnual = currentMonthly * 12;
    hikeAnnual = hikeMonthly * 12;
    revisedAnnual = revisedMonthly * 12;
  }

  return {
    period,
    hikePct: pct,
    currentAnnual,
    hikeAnnual,
    revisedAnnual,
    currentMonthly: currentAnnual / 12,
    hikeMonthly: hikeAnnual / 12,
    revisedMonthly: revisedAnnual / 12,
  };
}
