/**
 * Professional Tax Calculator India — pure calculation layer.
 *
 * All functions here are pure, dependency-free and safe to run entirely in
 * the browser: no network, no storage, no logging of user inputs. This
 * engine imports NOTHING from the salary tax, CTC, hike, PF, HRA or
 * gratuity engines.
 *
 * There is NO nationwide PT formula: every supported state is a data entry
 * (slabs + schedule + conditions) evaluated by one generic engine. States
 * without a verified official rule are NOT encoded — they resolve to
 * unsupported instead of a guess.
 *
 * Official rule sources encoded below (rate data cross-checked against
 * these; re-verify before relying on them for payroll):
 * - Maharashtra: Profession Tax Act, 1975 Schedule I rate schedule "as on
 *   31.03.2025" (mahagst.gov.in) — men: nil to 7,500; Rs 175 for
 *   7,501–10,000; Rs 2,500/yr (200 × 11 + 300 Feb) above 10,000. Women: nil
 *   to 25,000; same Rs 2,500/yr structure above (in force 1.4.2023).
 * - Karnataka: ptax.karnataka.gov.in schedule (nil below Rs 25,000;
 *   Rs 200/month at/above) as amended by Karnataka Act No. 33 of 2025
 *   (Gazette 15.4.2025, effective 1.4.2025): February Rs 300, other months
 *   Rs 200. A 2026 amendment exists whose content was not verified here —
 *   re-check the portal before payroll use.
 * - West Bengal: Directorate of Commercial Taxes schedule w.e.f. 1.4.2014
 *   (nil to 10,000; 110 / 130 / 150 / 200 across 10,001–15,000 /
 *   15,001–25,000 / 25,001–40,000 / above 40,000; uniform months), hosted
 *   on comtax.wb.gov.in and reproduced on WB government training portals.
 *   Currency confirmed by Gazette Notification No. 1407-FT (Aug 2026),
 *   which replaces this schedule ONLY from 1.4.2027 — so it governs the
 *   current FY 2026-27. Re-verified 2026-09-28.
 * - Gujarat: commercialtax.gujarat.gov.in rate schedule (effective
 *   1.4.2022): nil to Rs 12,000; Rs 200/month above; uniform months.
 *   Re-verified 2026-09-28.
 * - Andhra Pradesh: apct.gov.in First Schedule (1987 Act, as amended):
 *   nil to 15,000; Rs 150 for 15,001–20,000; Rs 200 above; uniform months —
 *   corroborated by the Act text on India Code (indiacode.nic.in).
 *   Re-verified 2026-09-28.
 * - Telangana: tgct.gov.in First Schedule (1987 Act, as amended): same
 *   three-tier structure as Andhra Pradesh; uniform months.
 *
 * Tamil Nadu / Kerala use local-body-dependent half-yearly scales (no single
 * verifiable statewide slab), and Madhya Pradesh was not verifiable from an
 * official source during implementation — all resolve to unsupported.
 */

export interface PtSlab {
  /** Salary upper bound (inclusive) for this band. */
  upTo: number;
  /** Monthly PT for salaries in this band (regular months). */
  monthly: number;
  /** February amount when this band has a special February deduction. */
  february?: number;
  /** Human-readable band label, e.g. "Above Rs 10,000". */
  label: string;
}

export interface PtStateRule {
  stateCode: string;
  stateName: string;
  /** Salary basis as worded by the state's rule (never assumed universal). */
  salaryBasis: string;
  slabs: PtSlab[];
  /**
   * Optional women-only full exemption up to this monthly salary
   * (Maharashtra). Absent for states without such a rule.
   */
  femaleExemptUpTo?: number;
  annualCapNote?: string;
  effectiveNote: string;
  notes: string;
  sourceUrl: string;
  sourceLabel: string;
  /** Short title/description of the cited official source. */
  sourceTitle: string;
  /** YYYY-MM-DD date the rule data was last verified against the source. */
  verifiedOn: string;
}

const INFINITY = Number.POSITIVE_INFINITY;

export const PT_RULES: PtStateRule[] = [
  {
    stateCode: "MH",
    stateName: "Maharashtra",
    salaryBasis: "Monthly salaries or wages",
    slabs: [
      { upTo: 7500, monthly: 0, label: "Up to Rs 7,500" },
      { upTo: 10000, monthly: 175, label: "Rs 7,501 – Rs 10,000" },
      { upTo: INFINITY, monthly: 200, february: 300, label: "Above Rs 10,000" },
    ],
    femaleExemptUpTo: 25000,
    annualCapNote: "Rs 2,500 per year maximum for the top band.",
    effectiveNote: "Rates in force since 1 April 2023.",
    notes: "Women with monthly salary up to Rs 25,000 are fully exempt.",
    sourceUrl: "https://www.mahagst.gov.in/en/profession-tax-and-other-rate-schedule",
    sourceLabel: "Maharashtra GST Department — Profession Tax rate schedule",
    sourceTitle: "Schedule I rate schedule as on 31.03.2025 (in force 1.4.2023)",
    verifiedOn: "2026-09-28",
  },
  {
    stateCode: "KA",
    stateName: "Karnataka",
    salaryBasis: "Monthly salary or wage",
    slabs: [
      { upTo: 24999, monthly: 0, label: "Below Rs 25,000" },
      { upTo: INFINITY, monthly: 200, february: 300, label: "Rs 25,000 and above" },
    ],
    annualCapNote: "Rs 2,500 per year for the top band.",
    effectiveNote: "Rs 25,000 threshold per portal schedule; February Rs 300 since 1 April 2025 (Amendment Act 33 of 2025).",
    notes: "A 2026 amendment exists; re-check the portal for any newer change before payroll use.",
    sourceUrl: "https://ptax.karnataka.gov.in/FAQ",
    sourceLabel: "Karnataka Commercial Taxes Department — PT portal",
    sourceTitle: "Portal schedule (Rs 25,000 threshold) + Amendment Act 33 of 2025, Gazette 15.4.2025",
    verifiedOn: "2026-09-28",
  },
  {
    stateCode: "WB",
    stateName: "West Bengal",
    salaryBasis: "Monthly salary or wages",
    slabs: [
      { upTo: 10000, monthly: 0, label: "Up to Rs 10,000" },
      { upTo: 15000, monthly: 110, label: "Rs 10,001 – Rs 15,000" },
      { upTo: 25000, monthly: 130, label: "Rs 15,001 – Rs 25,000" },
      { upTo: 40000, monthly: 150, label: "Rs 25,001 – Rs 40,000" },
      { upTo: INFINITY, monthly: 200, label: "Above Rs 40,000" },
    ],
    effectiveNote: "Schedule w.e.f. 1 April 2014; uniform deduction every month.",
    notes: "A revised schedule (No. 1407-FT) applies from 1 April 2027 and is not modelled here.",
    sourceUrl: "https://professiontax.wb.gov.in/",
    sourceLabel: "West Bengal Profession Tax portal",
    sourceTitle: "Directorate schedule w.e.f. 1.4.2014 (current until 31.3.2027 per Gazette No. 1407-FT)",
    verifiedOn: "2026-09-28",
  },
  {
    stateCode: "GJ",
    stateName: "Gujarat",
    salaryBasis: "Monthly salaries or wages",
    slabs: [
      { upTo: 12000, monthly: 0, label: "Up to Rs 12,000" },
      { upTo: INFINITY, monthly: 200, label: "Above Rs 12,000" },
    ],
    annualCapNote: "Rs 2,400 per year at the top band (within the Rs 2,500 constitutional ceiling).",
    effectiveNote: "Simplified two-band schedule effective 1 April 2022.",
    notes: "Uniform deduction every month — no special February amount.",
    sourceUrl: "https://commercialtax.gujarat.gov.in/vatwebsite/download/schedule/Rate_of_Profession_Tax.pdf",
    sourceLabel: "Gujarat Commercial Tax Department — PT rate schedule",
    sourceTitle: "Rate schedule effective 01/04/2022 (nil to Rs 12,000; Rs 200 above)",
    verifiedOn: "2026-09-28",
  },
  {
    stateCode: "AP",
    stateName: "Andhra Pradesh",
    salaryBasis: "Monthly salaries or wages",
    slabs: [
      { upTo: 15000, monthly: 0, label: "Up to Rs 15,000" },
      { upTo: 20000, monthly: 150, label: "Rs 15,001 – Rs 20,000" },
      { upTo: INFINITY, monthly: 200, label: "Above Rs 20,000" },
    ],
    effectiveNote: "1987 Act First Schedule, as amended to date.",
    notes: "Uniform deduction every month.",
    sourceUrl: "https://apct.gov.in/apportal/AllActs/APPT/APPTSchedule.aspx",
    sourceLabel: "AP Commercial Taxes Department — PT schedule",
    sourceTitle: "1987 Act First Schedule as amended (corroborated by India Code Act text)",
    verifiedOn: "2026-09-28",
  },
  {
    stateCode: "TG",
    stateName: "Telangana",
    salaryBasis: "Monthly salaries or wages",
    slabs: [
      { upTo: 15000, monthly: 0, label: "Up to Rs 15,000" },
      { upTo: 20000, monthly: 150, label: "Rs 15,001 – Rs 20,000" },
      { upTo: INFINITY, monthly: 200, label: "Above Rs 20,000" },
    ],
    effectiveNote: "1987 Act First Schedule, as amended to date.",
    notes: "Uniform deduction every month.",
    sourceUrl: "https://www.tgct.gov.in/tgportal/AllActs/APPT/APPTSchedule.aspx",
    sourceLabel: "Telangana Commercial Taxes Department — PT schedule",
    sourceTitle: "1987 Act First Schedule as amended",
    verifiedOn: "2026-09-28",
  },
];

/** States/UTs deliberately not encoded (no verified official rule in v1). */
export const PT_UNSUPPORTED_NOTE =
  "Rules shown here are currently verified for the selected state only.";

export const MAX_MONTHLY_SALARY = 10000000; // Rs 1 crore/month

function clampSalary(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_MONTHLY_SALARY);
}

export function getStateRule(stateCode: string): PtStateRule | undefined {
  return PT_RULES.find((r) => r.stateCode === stateCode);
}

export interface PtCalculatorInput {
  stateCode: string;
  monthlySalary: number;
  /** Only relevant where the rule defines a gender condition (Maharashtra). */
  gender?: "male" | "female";
}

export interface PtMonthEntry {
  monthIndex: number;
  month: string;
  amount: number;
}

export interface PtCalculatorResult {
  supported: boolean;
  stateCode: string;
  stateName: string;
  monthlySalary: number;
  salaryBasis: string;
  applicableSlab: string;
  monthlyProfessionalTax: number;
  februaryProfessionalTax: number;
  annualProfessionalTax: number;
  /** Explicit 12-month schedule — annual is always summed, never 12× assumed. */
  schedule: PtMonthEntry[];
  notes: string;
  sourceUrl: string;
  sourceLabel: string;
  effectiveNote: string;
}

const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

/**
 * End-to-end PT estimation for one state and monthly salary. Unknown states
 * resolve to unsupported with no fabricated amount. All outputs are finite.
 */
export function calculateProfessionalTax(input: PtCalculatorInput): PtCalculatorResult {
  const rule = getStateRule(input.stateCode);
  const monthlySalary = clampSalary(input.monthlySalary);

  if (!rule) {
    return {
      supported: false,
      stateCode: input.stateCode,
      stateName: "Not covered",
      monthlySalary,
      salaryBasis: "",
      applicableSlab: "",
      monthlyProfessionalTax: 0,
      februaryProfessionalTax: 0,
      annualProfessionalTax: 0,
      schedule: [],
      notes: "This state is not yet covered by our verified professional-tax rules.",
      sourceUrl: "",
      sourceLabel: "",
      effectiveNote: "",
    };
  }

  // Gender-conditioned exemption (Maharashtra women up to Rs 25,000).
  if (
    rule.femaleExemptUpTo !== undefined &&
    input.gender === "female" &&
    monthlySalary <= rule.femaleExemptUpTo
  ) {
    const schedule: PtMonthEntry[] = MONTHS.map((month, monthIndex) => ({ monthIndex, month, amount: 0 }));
    return {
      supported: true,
      stateCode: rule.stateCode,
      stateName: rule.stateName,
      monthlySalary,
      salaryBasis: rule.salaryBasis,
      applicableSlab: `Up to Rs ${rule.femaleExemptUpTo.toLocaleString("en-IN")} (women)`,
      monthlyProfessionalTax: 0,
      februaryProfessionalTax: 0,
      annualProfessionalTax: 0,
      schedule,
      notes: rule.notes,
      sourceUrl: rule.sourceUrl,
      sourceLabel: rule.sourceLabel,
      effectiveNote: rule.effectiveNote,
    };
  }

  const slab = rule.slabs.find((s) => monthlySalary <= s.upTo) ?? rule.slabs[rule.slabs.length - 1];
  const schedule: PtMonthEntry[] = MONTHS.map((month, monthIndex) => ({
    monthIndex,
    month,
    amount: month === "February" && slab.february !== undefined ? slab.february : slab.monthly,
  }));
  const annual = schedule.reduce((sum, m) => sum + m.amount, 0);

  return {
    supported: true,
    stateCode: rule.stateCode,
    stateName: rule.stateName,
    monthlySalary,
    salaryBasis: rule.salaryBasis,
    applicableSlab: slab.label,
    monthlyProfessionalTax: schedule[0].amount,
    februaryProfessionalTax: schedule[10].amount,
    annualProfessionalTax: annual,
    schedule,
    notes: [rule.notes, rule.annualCapNote ?? ""].filter(Boolean).join(" "),
    sourceUrl: rule.sourceUrl,
    sourceLabel: rule.sourceLabel,
    effectiveNote: rule.effectiveNote,
  };
}
