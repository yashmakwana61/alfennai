/**
 * Gratuity Calculator India — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs. This
 * engine imports NOTHING from the salary tax, CTC, hike or PF engines.
 *
 * Legal basis (assumptions, never legal advice):
 * - Code on Social Security, 2020, Section 53 (carrying forward Payment of
 *   Gratuity Act, 1972 s.4(2)): for every completed year of service or part
 *   thereof IN EXCESS OF six months, gratuity at 15 days' wages on
 *   last-drawn wages. For monthly-rated employees: monthly wage ÷ 26 × 15.
 *   The Code preserves better gratuity terms via award/agreement/contract
 *   and makes the amount subject to the maximum notified by the Central
 *   Government.
 * - Applicability from 21 November 2025 (Code enforcement date; ESIC
 *   implementation notice Dec 2025; Labour Ministry FAQs).
 * - Regular employees: standard estimate assumes not less than five years
 *   of continuous service (death/disablement exceptions exist but are NOT
 *   modelled here — no such mode is offered).
 * - Fixed-term employees directly engaged by the employer: eligible after
 *   one year of service under the contract, on a pro-rata basis (Labour
 *   Ministry Additional FAQs on Labour Codes). This is NOT generalised to
 *   contract labour supplied through a contractor (separate five-year
 *   continuous-service rule per the Ministry FAQ) — the UI says so.
 * - Maximum cap: the Code refers to a notified maximum, but no current
 *   notification verified from a primary source during implementation sets
 *   a general ceiling under the Code, so this engine applies NO cap and
 *   discloses that. (The Rs 20 lakh figure belongs to the repealed Act's
 *   2018 notification and is therefore not encoded as current law.)
 * - "Monthly wage used" is a USER-PROVIDED gratuity-relevant wage
 *   assumption. The Code's "wages" definition can differ from payroll
 *   labels (Basic, Gross, CTC) — the engine never equates them.
 *
 * Rounding rule (strictly "in excess of six months", never >= 6):
 *   qualifyingYears = completedYears + (additionalMonths > 6 ? 1 : 0)
 */

export type GratuityEmployeeType = "regular" | "fixed-term";

/** Statutory rate: 15 days' wages per qualifying year. */
export const STATUTORY_RATE_DAYS = 15;

/** Monthly-wage divisor for monthly-rated employees. */
export const MONTH_DIVISOR = 26;

/** Standard regular-employee service assumption: 60 months. */
export const REGULAR_MIN_MONTHS = 60;

/** Fixed-term employee service assumption: 12 months under the contract. */
export const FTE_MIN_MONTHS = 12;

export const MAX_MONTHLY_WAGE = 10000000; // Rs 1 crore/month
export const MAX_SERVICE_YEARS = 60;
export const MAX_RATE_DAYS = 31;

function clampWage(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_MONTHLY_WAGE);
}

function clampYears(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), MAX_SERVICE_YEARS);
}

function clampMonths(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), 11);
}

export interface GratuityInput {
  monthlyWage: number;
  completedYears: number;
  additionalMonths: number;
  employeeType: GratuityEmployeeType;
  /** True only when the user explicitly selects a better contractual rate. */
  useContractualRate: boolean;
  contractualRateDays: number;
}

export interface GratuityResult {
  monthlyWage: number;
  completedYears: number;
  additionalMonths: number;
  totalMonths: number;
  qualifyingYears: number;
  employeeType: GratuityEmployeeType;
  rateDays: number;
  rateSource: "statutory" | "contractual";
  dailyBasis: number;
  gratuityAmount: number;
  /** Standard-assumption eligibility (5y regular / 1y fixed-term). */
  eligible: boolean;
}

/**
 * Qualifying years: completed years plus one only when the extra part of
 * the final year is IN EXCESS OF six months. Six months exactly never rounds up.
 */
export function qualifyingServiceYears(completedYears: number, additionalMonths: number): number {
  return clampYears(completedYears) + (clampMonths(additionalMonths) > 6 ? 1 : 0);
}

/** Total service in months (for eligibility comparison). */
export function totalServiceMonths(completedYears: number, additionalMonths: number): number {
  return clampYears(completedYears) * 12 + clampMonths(additionalMonths);
}

/**
 * Standard-assumption eligibility: regular employees need 60 months of
 * continuous service; fixed-term employees need 12 months under the
 * contract. Anything else (death/disablement, disputes) is out of scope
 * and reported as not-eligible under the standard assumption.
 */
export function isEligible(employeeType: GratuityEmployeeType, totalMonths: number): boolean {
  const months = Math.max(Math.floor(Number.isFinite(totalMonths) ? totalMonths : 0), 0);
  return employeeType === "fixed-term" ? months >= FTE_MIN_MONTHS : months >= REGULAR_MIN_MONTHS;
}

/** Formula amount: monthlyWage ÷ 26 × rateDays × qualifyingYears. */
export function gratuityFormulaAmount(monthlyWage: number, rateDays: number, qualifyingYears: number): number {
  const wage = clampWage(monthlyWage);
  const rate = Math.min(Math.max(Number.isFinite(rateDays) ? rateDays : 0, 0), MAX_RATE_DAYS);
  const years = Math.max(Math.floor(Number.isFinite(qualifyingYears) ? qualifyingYears : 0), 0);
  return (wage / MONTH_DIVISOR) * rate * years;
}

/** End-to-end gratuity estimation. All outputs are finite numbers. */
export function calculateGratuity(input: GratuityInput): GratuityResult {
  const monthlyWage = clampWage(input.monthlyWage);
  const completedYears = clampYears(input.completedYears);
  const additionalMonths = clampMonths(input.additionalMonths);
  const employeeType: GratuityEmployeeType = input.employeeType === "fixed-term" ? "fixed-term" : "regular";

  const totalMonths = completedYears * 12 + additionalMonths;
  const qualifyingYears = completedYears + (additionalMonths > 6 ? 1 : 0);

  const useContractual = input.useContractualRate === true;
  const rateDays = useContractual
    ? Math.min(Math.max(Number.isFinite(input.contractualRateDays) ? input.contractualRateDays : 0, 0), MAX_RATE_DAYS)
    : STATUTORY_RATE_DAYS;

  const dailyBasis = monthlyWage / MONTH_DIVISOR;
  const gratuityAmount = dailyBasis * rateDays * qualifyingYears;

  return {
    monthlyWage,
    completedYears,
    additionalMonths,
    totalMonths,
    qualifyingYears,
    employeeType,
    rateDays,
    rateSource: useContractual ? "contractual" : "statutory",
    dailyBasis: Number.isFinite(dailyBasis) ? dailyBasis : 0,
    gratuityAmount: Number.isFinite(gratuityAmount) ? gratuityAmount : 0,
    eligible: isEligible(employeeType, totalMonths),
  };
}
