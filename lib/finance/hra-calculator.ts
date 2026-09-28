/**
 * HRA Calculator India — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs. This
 * engine imports NOTHING from the salary tax, CTC, hike, PF or gratuity
 * engines: it computes HRA exemption only — never income tax, take-home,
 * PF, CTC or gratuity.
 *
 * Rule basis (assumptions, never tax/legal advice):
 * - HRA exemption under Section 10(13A) of the Income-tax Act is available
 *   under the OLD tax regime for eligible salaried individuals, and NOT
 *   available under the NEW tax regime (Income Tax Department
 *   new-vs-old-regime material: incometax.gov.in).
 * - Old-regime exemption is the least of:
 *     A. actual annual HRA received;
 *     B. annual rent paid minus 10% of salary (floored at zero);
 *     C. 50% of salary for metro locations, 40% otherwise.
 * - Salary basis for this v1 is Basic Salary plus DA forming part of
 *   retirement benefits ONLY — never gross salary, CTC, bonus or other
 *   allowances. Commission-based salary is out of scope.
 * - Location percentages (50/40) and the "least of three" structure follow
 *   the long-standing statutory rule restated in current Department
 *   material. No FY-specific variation is encoded: if official rules
 *   change, update the constants below and the tests.
 *
 * The result object exposes hraExemption directly so a future salary engine
 * can consume it without duplicating the metro/rent/limit/regime logic.
 * That integration is intentionally NOT done here.
 */

export type HraCityType = "metro" | "non-metro";
export type HraTaxRegime = "old" | "new";

export type HraLimitingComponent =
  | "actual-hra"
  | "rent-minus-10-percent"
  | "location-limit"
  | "none";

/** Metro location rate: 50% of salary. Non-metro: 40%. */
export const METRO_RATE = 0.5;
export const NON_METRO_RATE = 0.4;

/** Sensible upper bound for annual amounts (mirrors finance-engine convention). */
export const MAX_HRA_ANNUAL = 1000000000; // Rs 100 crore

function clampAnnual(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_HRA_ANNUAL);
}

export interface HraCalculatorInput {
  basicAnnual: number;
  /** DA forming part of retirement benefits (annual). */
  daEligibleAnnual: number;
  hraReceivedAnnual: number;
  rentPaidAnnual: number;
  cityType: HraCityType;
  taxRegime: HraTaxRegime;
}

export interface HraCalculatorResult {
  basicAnnual: number;
  daAnnual: number;
  /** Basic + eligible DA: the only salary basis used. Never gross/CTC. */
  salaryForHra: number;
  hraReceivedAnnual: number;
  rentPaidAnnual: number;
  cityType: HraCityType;
  taxRegime: HraTaxRegime;
  /** Component A: actual HRA received. */
  actualHraComponent: number;
  /** Component B: rent minus 10% of salary, floored at zero. */
  rentMinusTenPercentComponent: number;
  /** Component C: location percentage of salary. */
  locationLimitComponent: number;
  locationRate: number;
  hraExemption: number;
  taxableHra: number;
  exemptionAvailable: boolean;
  limitingComponent: HraLimitingComponent;
}

/** Salary considered for HRA calculation: Basic + eligible DA only. */
export function salaryBasisForHra(basicAnnual: number, daEligibleAnnual: number): number {
  return clampAnnual(basicAnnual) + clampAnnual(daEligibleAnnual);
}

/** Location rate: 0.5 metro, 0.4 otherwise. */
export function locationRate(cityType: HraCityType): number {
  return cityType === "metro" ? METRO_RATE : NON_METRO_RATE;
}

/** End-to-end HRA exemption estimation. All outputs are finite numbers. */
export function calculateHra(input: HraCalculatorInput): HraCalculatorResult {
  const basicAnnual = clampAnnual(input.basicAnnual);
  const daAnnual = clampAnnual(input.daEligibleAnnual);
  const salaryForHra = basicAnnual + daAnnual;
  const hraReceivedAnnual = clampAnnual(input.hraReceivedAnnual);
  const rentPaidAnnual = clampAnnual(input.rentPaidAnnual);
  const cityType: HraCityType = input.cityType === "metro" ? "metro" : "non-metro";
  const taxRegime: HraTaxRegime = input.taxRegime === "new" ? "new" : "old";
  const rate = locationRate(cityType);

  if (taxRegime === "new") {
    // Section 10(13A) is not available under the new regime: the old-regime
    // formula must NOT run here.
    return {
      basicAnnual,
      daAnnual,
      salaryForHra,
      hraReceivedAnnual,
      rentPaidAnnual,
      cityType,
      taxRegime,
      actualHraComponent: hraReceivedAnnual,
      rentMinusTenPercentComponent: 0,
      locationLimitComponent: 0,
      locationRate: rate,
      hraExemption: 0,
      taxableHra: hraReceivedAnnual,
      exemptionAvailable: false,
      limitingComponent: "none",
    };
  }

  const actualHraComponent = hraReceivedAnnual;
  const rentMinusTenPercentComponent = Math.max(rentPaidAnnual - salaryForHra * 0.1, 0);
  const locationLimitComponent = salaryForHra * rate;

  const hraExemption = Math.min(actualHraComponent, rentMinusTenPercentComponent, locationLimitComponent);
  const taxableHra = Math.max(hraReceivedAnnual - hraExemption, 0);

  // Deterministic limiting-component reporting on ties: actual HRA wins,
  // then rent-minus-10%, then the location limit.
  const limitingComponent: HraLimitingComponent =
    hraExemption === actualHraComponent
      ? "actual-hra"
      : hraExemption === rentMinusTenPercentComponent
        ? "rent-minus-10-percent"
        : hraExemption === locationLimitComponent
          ? "location-limit"
          : "none";

  return {
    basicAnnual,
    daAnnual,
    salaryForHra,
    hraReceivedAnnual,
    rentPaidAnnual,
    cityType,
    taxRegime,
    actualHraComponent,
    rentMinusTenPercentComponent,
    locationLimitComponent,
    locationRate: rate,
    hraExemption: Math.max(hraExemption, 0),
    taxableHra,
    exemptionAvailable: hraExemption > 0,
    limitingComponent,
  };
}
