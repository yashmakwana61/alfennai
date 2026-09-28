import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TAX_RULES_BY_FY,
  annualToMonthly,
  applyMarginalRelief,
  calculateSalary,
  cessAmount,
  componentsToGross,
  formatINR,
  incomeTax,
  rebateAmount,
  resolveGrossSalary,
  sanitizeAmount,
  slabTax,
  takeHome,
  taxableIncome,
  totalDeductions,
} from "./salary-calculator";
import { salaryCalculatorTool } from "../../config/tools/salary-calculator.config";

describe("sanitizeAmount", () => {
  it("rejects negative input", () => {
    assert.equal(sanitizeAmount(-5), 0);
  });
  it("rejects NaN and Infinity", () => {
    assert.equal(sanitizeAmount(NaN), 0);
    assert.equal(sanitizeAmount(Number.POSITIVE_INFINITY), 0);
    assert.equal(sanitizeAmount("abc"), 0);
  });
  it("passes through decimals unchanged", () => {
    assert.equal(sanitizeAmount(1250000.75), 1250000.75);
  });
});

describe("zero / empty optional deductions", () => {
  it("CTC 6L FY 2025-26 new regime: no tax, take-home equals CTC", () => {
    const r = calculateSalary({
      annualCtc: 600000,
      components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
      deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
      regime: "new",
      financialYear: "2025-26",
    });
    assert.equal(r.grossAnnual, 600000);
    assert.equal(r.grossAssumedFromCtc, true);
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 600000);
    assert.equal(r.takeHomeMonthly, 50000);
  });
});

describe("decimal salary", () => {
  it("preserves paise through the calculation (CTC 12,50,000.75, FY 2025-26 new)", () => {
    const r = calculateSalary({
      annualCtc: 1250000.75,
      components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
      deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
      regime: "new",
      financialYear: "2025-26",
    });
    // Taxable = 11,75,000.75 <= 12L rebate limit -> zero tax.
    assert.equal(r.taxableIncome, 1175000.75);
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 1250000.75);
  });
});

describe("high salary", () => {
  it("CTC 5cr FY 2025-26 new regime", () => {
    const r = calculateSalary({
      annualCtc: 50000000,
      components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
      deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
      regime: "new",
      financialYear: "2025-26",
    });
    // Slab: 20k + 40k + 60k + 80k + 100k + (49,925,000-2,400,000)*30%.
    assert.equal(r.slabTax, 14557500);
    assert.equal(r.rebate, 0);
    assert.equal(r.cess, 582300);
    assert.equal(r.incomeTax, 15139800);
    assert.equal(r.takeHomeAnnual, 34860200);
  });
});

describe("monthly / annual consistency", () => {
  it("monthly * 12 equals annual within rounding", () => {
    const r = calculateSalary({
      annualCtc: 50000000,
      components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
      deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
      regime: "new",
      financialYear: "2025-26",
    });
    assert.ok(Math.abs(r.takeHomeMonthly * 12 - r.takeHomeAnnual) < 1);
    assert.equal(annualToMonthly(1200000), 100000);
  });
});

describe("deduction calculation", () => {
  it("sums employee-side deductions", () => {
    assert.equal(
      totalDeductions({ employeePfAnnual: 86400, professionalTaxAnnual: 2500, otherDeductionsAnnual: 10000 }),
      98900
    );
  });
  it("reduces take-home by deductions plus tax", () => {
    const r = calculateSalary({
      annualCtc: 1200000,
      components: { basicAnnual: 600000, hraAnnual: 300000, otherAllowancesAnnual: 240000, bonusAnnual: 60000 },
      deductions: { employeePfAnnual: 72000, professionalTaxAnnual: 2500, otherDeductionsAnnual: 0 },
      regime: "new",
      financialYear: "2025-26",
    });
    assert.equal(r.grossAnnual, 1200000);
    assert.equal(r.grossAssumedFromCtc, false);
    assert.equal(r.employerContributionsEstimate, 0);
    assert.equal(r.totalEmployeeDeductions, 74500);
    // Taxable 11,25,000 <= 12L -> zero tax; take-home = 12,00,000 - 74,500.
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 1125500);
  });
});

describe("CTC vs gross resolution", () => {
  it("sums components when provided", () => {
    assert.equal(
      componentsToGross({ basicAnnual: 600000, hraAnnual: 300000, otherAllowancesAnnual: 200000, bonusAnnual: 100000 }),
      1200000
    );
  });
  it("clamps gross to CTC when components exceed CTC and reports no employer share", () => {
    const g = resolveGrossSalary(1200000, {
      basicAnnual: 700000,
      hraAnnual: 300000,
      otherAllowancesAnnual: 200000,
      bonusAnnual: 100000,
    });
    assert.equal(g.grossAnnual, 1200000);
    assert.equal(g.employerContributionsEstimate, 0);
  });
  it("reports CTC remainder as employer-side estimate", () => {
    const g = resolveGrossSalary(1200000, {
      basicAnnual: 600000,
      hraAnnual: 300000,
      otherAllowancesAnnual: 0,
      bonusAnnual: 0,
    });
    assert.equal(g.grossAnnual, 900000);
    assert.equal(g.employerContributionsEstimate, 300000);
  });
});

describe("representative slab tax (FY 2024-25 new regime, CTC 10L)", () => {
  it("computes slab tax, cess and take-home", () => {
    const rules = TAX_RULES_BY_FY["2024-25"].newRegime;
    const taxable = taxableIncome(1000000, rules);
    assert.equal(taxable, 925000);
    // (7L-3L)*5% + (9.25L-7L)*10% = 20,000 + 22,500.
    assert.equal(slabTax(taxable, rules.slabs), 42500);
    const r = calculateSalary({
      annualCtc: 1000000,
      components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
      deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
      regime: "new",
      financialYear: "2024-25",
    });
    assert.equal(r.rebate, 0);
    assert.equal(r.cess, 1700);
    assert.equal(r.incomeTax, 44200);
    assert.equal(r.takeHomeAnnual, 955800);
  });
});

describe("rebate handling", () => {
  it("full rebate at the FY 2024-25 new-regime limit (taxable 7L -> zero tax)", () => {
    const rules = TAX_RULES_BY_FY["2024-25"].newRegime;
    const slab = slabTax(700000, rules.slabs);
    assert.equal(slab, 20000);
    assert.equal(rebateAmount(700000, slab, rules), 20000);
    assert.equal(incomeTax(700000, TAX_RULES_BY_FY["2024-25"], "new"), 0);
  });
  it("no rebate above the limit (FY 2025-26 new regime, taxable 12.1L)", () => {
    const rules = TAX_RULES_BY_FY["2025-26"].newRegime;
    assert.equal(rebateAmount(1210000, slabTax(1210000, rules.slabs), rules), 0);
  });
  it("old-regime rebate zeroes tax at 5L", () => {
    assert.equal(incomeTax(500000, TAX_RULES_BY_FY["2024-25"], "old"), 0);
  });
});

describe("marginal relief", () => {
  it("caps tax at excess income just above FY 2025-26 new-regime rebate limit", () => {
    const rules = TAX_RULES_BY_FY["2025-26"].newRegime;
    const slab = slabTax(1210000, rules.slabs); // 61,500 without relief
    assert.equal(slab, 61500);
    assert.equal(applyMarginalRelief(1210000, slab, rules), 10000);
    // Total tax = 10,000 + 4% cess.
    assert.equal(incomeTax(1210000, TAX_RULES_BY_FY["2025-26"], "new"), 10400);
  });
  it("does not apply within the rebate limit or in the old regime", () => {
    const newRules = TAX_RULES_BY_FY["2025-26"].newRegime;
    assert.equal(applyMarginalRelief(1200000, 0, newRules), 0);
    const oldRules = TAX_RULES_BY_FY["2024-25"].oldRegime;
    assert.equal(applyMarginalRelief(600000, 20000, oldRules), 20000);
  });
});

describe("cess handling", () => {
  it("applies 4% health & education cess", () => {
    assert.equal(cessAmount(100000, 0.04), 4000);
    assert.equal(cessAmount(0, 0.04), 0);
  });
});

describe("final take-home calculation", () => {
  it("subtracts deductions and tax from gross, floored at zero", () => {
    assert.equal(takeHome(1000000, 50000, 44200), 905800);
    assert.equal(takeHome(100000, 90000, 50000), 0);
  });
});

describe("old vs new regime selection (CTC 10L, FY 2024-25)", () => {
  it("old regime costs more than new regime for a plain 10L salary", () => {
    const base = {
      annualCtc: 1000000,
      components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
      deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
      financialYear: "2024-25" as const,
    };
    const oldR = calculateSalary({ ...base, regime: "old" });
    const newR = calculateSalary({ ...base, regime: "new" });
    // Old: taxable 9.5L -> (2.5L*5% + 4.5L*20%) = 102,500 + 4,100 cess.
    assert.equal(oldR.incomeTax, 106600);
    assert.equal(oldR.takeHomeAnnual, 893400);
    assert.equal(newR.incomeTax, 44200);
    assert.ok(newR.takeHomeAnnual > oldR.takeHomeAnnual);
  });
});

describe("invalid input never reaches outputs as NaN/Infinity", () => {
  it("NaN CTC yields zeroed finite outputs", () => {
    const r = calculateSalary({
      annualCtc: NaN,
      components: { basicAnnual: NaN, hraAnnual: NaN, otherAllowancesAnnual: NaN, bonusAnnual: NaN },
      deductions: { employeePfAnnual: NaN, professionalTaxAnnual: NaN, otherDeductionsAnnual: NaN },
      regime: "new",
      financialYear: "2025-26",
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `expected finite, got ${v}`);
    }
    assert.equal(r.takeHomeAnnual, 0);
  });
});

describe("formatINR", () => {
  it("formats full Indian digit grouping", () => {
    assert.equal(formatINR(1200000), "₹12,00,000");
  });
});

const ZERO_PARTS = { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 };
const ZERO_DED = { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 };

describe("FY 2026-27 new-regime slab boundaries", () => {
  const slabs = TAX_RULES_BY_FY["2026-27"].newRegime.slabs;
  const cases: Array<[number, number]> = [
    [400000, 0],
    [800000, 20000], // (8L-4L) * 5%
    [1200000, 60000], // 20,000 + (12L-8L) * 10%
    [1600000, 120000], // 60,000 + (16L-12L) * 15%
    [2000000, 200000], // 120,000 + (20L-16L) * 20%
    [2400000, 300000], // 200,000 + (24L-20L) * 25%
  ];
  for (const [taxable, expected] of cases) {
    it(`slab tax on ${taxable} is ${expected}`, () => {
      assert.equal(slabTax(taxable, slabs), expected);
    });
  }
  it("just below the 8L boundary", () => {
    assert.ok(Math.abs(slabTax(799999, slabs) - 19999.95) < 0.01);
  });
  it("just above the 8L boundary", () => {
    assert.ok(Math.abs(slabTax(800001, slabs) - 20000.1) < 0.01);
  });
  it("just above the top boundary", () => {
    assert.ok(Math.abs(slabTax(2400001, slabs) - 300000.3) < 0.01);
  });
});

describe("FY 2026-27 low income / zero tax", () => {
  it("CTC 5L new regime: rebate wipes slab tax", () => {
    const r = calculateSalary({
      annualCtc: 500000,
      components: ZERO_PARTS,
      deductions: ZERO_DED,
      regime: "new",
      financialYear: "2026-27",
    });
    assert.equal(r.taxableIncome, 425000);
    assert.equal(r.slabTax, 1250);
    assert.equal(r.rebate, 1250);
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 500000);
    assert.ok(Math.abs(r.takeHomeMonthly * 12 - r.takeHomeAnnual) < 1);
  });
});

describe("FY 2026-27 rebate threshold", () => {
  const fy = TAX_RULES_BY_FY["2026-27"];
  it("zero tax at and below Rs 12L taxable", () => {
    assert.equal(incomeTax(1200000, fy, "new"), 0);
    assert.equal(incomeTax(1199999, fy, "new"), 0);
  });
  it("marginal relief just above Rs 12L (tax capped at excess + cess)", () => {
    assert.ok(Math.abs(incomeTax(1200001, fy, "new") - 1.04) < 1e-9);
  });
  it("cess is 4% of tax after relief", () => {
    assert.equal(cessAmount(10000, fy.cessRate), 400);
  });
});

describe("FY 2026-27 old regime", () => {
  it("standard deduction is Rs 50,000 (vs 75,000 new)", () => {
    assert.equal(taxableIncome(1000000, TAX_RULES_BY_FY["2026-27"].oldRegime), 950000);
    assert.equal(taxableIncome(1000000, TAX_RULES_BY_FY["2026-27"].newRegime), 925000);
  });
  it("CTC 10L old regime", () => {
    const r = calculateSalary({
      annualCtc: 1000000,
      components: ZERO_PARTS,
      deductions: ZERO_DED,
      regime: "old",
      financialYear: "2026-27",
    });
    // (2.5L*5% + 4.5L*20%) = 102,500 + 4,100 cess.
    assert.equal(r.incomeTax, 106600);
    assert.equal(r.takeHomeAnnual, 893400);
  });
});

describe("FY 2026-27 combined deductions and exact CTC breakup", () => {
  it("PF + professional tax + other deductions; components exactly equal CTC", () => {
    const r = calculateSalary({
      annualCtc: 1500000,
      components: { basicAnnual: 750000, hraAnnual: 375000, otherAllowancesAnnual: 300000, bonusAnnual: 75000 },
      deductions: { employeePfAnnual: 90000, professionalTaxAnnual: 2500, otherDeductionsAnnual: 5000 },
      regime: "new",
      financialYear: "2026-27",
    });
    assert.equal(r.grossAnnual, 1500000);
    assert.equal(r.grossAssumedFromCtc, false);
    assert.equal(r.employerContributionsEstimate, 0);
    assert.equal(r.totalEmployeeDeductions, 97500);
    // Taxable 14.25L: 20k + 40k + 2.25L*15% = 93,750 + 3,750 cess.
    assert.equal(r.slabTax, 93750);
    assert.equal(r.incomeTax, 97500);
    assert.equal(r.takeHomeAnnual, 1305000);
    assert.equal(r.takeHomeMonthly, 108750);
  });
});

describe("FY 2026-27 decimal income", () => {
  it("paise survive with zero tax below the rebate limit", () => {
    const r = calculateSalary({
      annualCtc: 800000.75,
      components: ZERO_PARTS,
      deductions: ZERO_DED,
      regime: "new",
      financialYear: "2026-27",
    });
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 800000.75);
  });
});

describe("FY 2026-27 high salary (surcharge not modelled)", () => {
  it("CTC 10cr: tax is slab + 4% cess only", () => {
    const r = calculateSalary({
      annualCtc: 100000000,
      components: ZERO_PARTS,
      deductions: ZERO_DED,
      regime: "new",
      financialYear: "2026-27",
    });
    // Slab 29,557,500 + cess 1,182,300; no surcharge added.
    assert.ok(Math.abs(r.slabTax - 29557500) < 1);
    assert.ok(Math.abs(r.incomeTax - 30739800) < 1);
    assert.ok(Math.abs(r.takeHomeAnnual - 69260200) < 1);
    assert.ok(Math.abs(r.takeHomeMonthly * 12 - r.takeHomeAnnual) < 1);
  });
});

describe("FY 2026-27 matches FY 2025-26 (Budget 2026 made no changes)", () => {
  it("identical inputs give identical results across both years", () => {
    const base = {
      annualCtc: 1840000,
      components: { basicAnnual: 920000, hraAnnual: 460000, otherAllowancesAnnual: 360000, bonusAnnual: 100000 },
      deductions: { employeePfAnnual: 110400, professionalTaxAnnual: 2500, otherDeductionsAnnual: 12000 },
      regime: "new" as const,
    };
    assert.deepEqual(
      calculateSalary({ ...base, financialYear: "2026-27" }),
      calculateSalary({ ...base, financialYear: "2025-26" })
    );
  });
});

describe("input validation at the tool schema boundary", () => {
  const valid = {
    annualCtc: 1200000,
    basicAnnual: 600000,
    hraAnnual: 300000,
    otherAllowancesAnnual: 240000,
    bonusAnnual: 60000,
    employeePfAnnual: 72000,
    professionalTaxAnnual: 2500,
    otherDeductionsAnnual: 0,
    regime: "new" as const,
    financialYear: "2026-27" as const,
  };
  it("accepts the valid example input", () => {
    assert.equal(salaryCalculatorTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects salary components exceeding CTC", () => {
    const parsed = salaryCalculatorTool.inputSchema.safeParse({ ...valid, bonusAnnual: 600000 });
    assert.equal(parsed.success, false);
  });
  it("rejects deductions exceeding gross", () => {
    const parsed = salaryCalculatorTool.inputSchema.safeParse({ ...valid, otherDeductionsAnnual: 2000000 });
    assert.equal(parsed.success, false);
  });
  it("rejects negative CTC", () => {
    const parsed = salaryCalculatorTool.inputSchema.safeParse({ ...valid, annualCtc: -100 });
    assert.equal(parsed.success, false);
  });
  it("rejects an unknown financial year", () => {
    const parsed = salaryCalculatorTool.inputSchema.safeParse({ ...valid, financialYear: "2027-28" });
    assert.equal(parsed.success, false);
  });
});
