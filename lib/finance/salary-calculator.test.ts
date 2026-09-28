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
