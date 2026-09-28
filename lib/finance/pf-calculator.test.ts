import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CEILING_MONTHLY,
  calculatePf,
  pfContribution,
  pfWageUsed,
} from "./pf-calculator";
import { pfCalculatorTool } from "../../config/tools/pf-calculator.config";

const BASE = {
  monthlyWage: 50000,
  employeeRatePct: 12,
  employerRatePct: 12,
  applyCeiling: true,
  ceilingMonthly: 25000,
};

describe("50k wage with ceiling (critical ceiling logic)", () => {
  it("uses 25k wage -> 3k employee + 3k employer", () => {
    const r = calculatePf(BASE);
    assert.equal(r.wageUsed, 25000);
    assert.equal(r.employeeMonthly, 3000);
    assert.equal(r.employerMonthly, 3000);
    assert.equal(r.combinedMonthly, 6000);
  });
});

describe("50k wage without ceiling", () => {
  it("uses full 50k wage -> 6k + 6k", () => {
    const r = calculatePf({ ...BASE, applyCeiling: false });
    assert.equal(r.wageUsed, 50000);
    assert.equal(r.employeeMonthly, 6000);
    assert.equal(r.employerMonthly, 6000);
    assert.equal(r.combinedMonthly, 12000);
  });
});

describe("25k wage with ceiling", () => {
  it("ceiling does not bite at the boundary", () => {
    const r = calculatePf({ ...BASE, monthlyWage: 25000 });
    assert.equal(r.wageUsed, 25000);
    assert.equal(r.employeeMonthly, 3000);
    assert.equal(r.employerMonthly, 3000);
  });
});

describe("20k wage with ceiling", () => {
  it("below-ceiling wage passes through untouched", () => {
    const r = calculatePf({ ...BASE, monthlyWage: 20000 });
    assert.equal(r.wageUsed, 20000);
    assert.equal(r.employeeMonthly, 2400);
    assert.equal(r.employerMonthly, 2400);
  });
});

describe("contribution rates", () => {
  it("12% employee contribution", () => {
    assert.equal(pfContribution(25000, 12), 3000);
  });
  it("12% employer contribution", () => {
    const r = calculatePf(BASE);
    assert.equal(r.employerMonthly, 3000);
  });
  it("custom employee rate", () => {
    const r = calculatePf({ ...BASE, employeeRatePct: 10 });
    assert.equal(r.employeeMonthly, 2500);
    assert.equal(r.employerMonthly, 3000);
  });
  it("custom employer rate", () => {
    const r = calculatePf({ ...BASE, employerRatePct: 8 });
    assert.equal(r.employeeMonthly, 3000);
    assert.equal(r.employerMonthly, 2000);
  });
  it("0% rate contributes nothing", () => {
    const r = calculatePf({ ...BASE, employeeRatePct: 0, employerRatePct: 0 });
    assert.equal(r.employeeMonthly, 0);
    assert.equal(r.employerMonthly, 0);
    assert.equal(r.combinedMonthly, 0);
  });
  it("100% rate contributes the full wage used", () => {
    const r = calculatePf({ ...BASE, employeeRatePct: 100, employerRatePct: 100 });
    assert.equal(r.employeeMonthly, 25000);
    assert.equal(r.employerMonthly, 25000);
  });
});

describe("annualized correctness", () => {
  it("annualized = monthly x 12, labelled as estimates", () => {
    const r = calculatePf(BASE);
    assert.equal(r.employeeAnnualized, 36000);
    assert.equal(r.employerAnnualized, 36000);
    assert.equal(r.combinedAnnualized, 72000);
  });
});

describe("ceiling toggle correctness", () => {
  it("enabled caps, disabled passes through", () => {
    assert.equal(pfWageUsed(50000, true, 25000), 25000);
    assert.equal(pfWageUsed(50000, false, 25000), 50000);
    assert.equal(pfWageUsed(20000, true, 25000), 20000);
  });
  it("default ceiling constant is the current 25k rule", () => {
    assert.equal(DEFAULT_CEILING_MONTHLY, 25000);
  });
});

describe("employee deduction excludes employer share", () => {
  it("employee monthly never contains the employer contribution", () => {
    const r = calculatePf({ ...BASE, employerRatePct: 100 });
    assert.equal(r.employeeMonthly, 3000);
    assert.equal(r.employerMonthly, 25000);
  });
});

describe("decimals and high wages", () => {
  it("decimal wage preserved", () => {
    const r = calculatePf({ ...BASE, monthlyWage: 25500.5, applyCeiling: false });
    assert.equal(r.wageUsed, 25500.5);
    assert.ok(Math.abs(r.employeeMonthly - 3060.06) < 0.01);
  });
  it("high wage stays finite", () => {
    const r = calculatePf({ ...BASE, monthlyWage: 10000000 });
    assert.equal(r.wageUsed, 25000);
    assert.ok(Number.isFinite(r.combinedAnnualized));
  });
});

describe("invalid inputs", () => {
  const valid = {
    monthlyWage: 50000,
    employeeRatePct: 12,
    employerRatePct: 12,
    applyCeiling: true,
    ceilingMonthly: 25000,
  };
  it("accepts the valid example input", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects zero wage", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse({ ...valid, monthlyWage: 0 }).success, false);
  });
  it("rejects negative wage", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse({ ...valid, monthlyWage: -100 }).success, false);
  });
  it("rejects negative rate", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse({ ...valid, employeeRatePct: -1 }).success, false);
  });
  it("rejects rate above 100", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse({ ...valid, employerRatePct: 101 }).success, false);
  });
  it("rejects NaN wage", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse({ ...valid, monthlyWage: NaN }).success, false);
  });
  it("rejects negative ceiling", () => {
    assert.equal(pfCalculatorTool.inputSchema.safeParse({ ...valid, ceilingMonthly: -500 }).success, false);
  });
  it("NaN engine input yields finite zeroed outputs", () => {
    const r = calculatePf({
      monthlyWage: NaN,
      employeeRatePct: NaN,
      employerRatePct: NaN,
      applyCeiling: true,
      ceilingMonthly: NaN,
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `expected finite, got ${v}`);
    }
    assert.equal(r.combinedMonthly, 0);
  });
  it("Infinity engine input cannot reach outputs", () => {
    const r = calculatePf({
      monthlyWage: Number.POSITIVE_INFINITY,
      employeeRatePct: 12,
      employerRatePct: 12,
      applyCeiling: false,
      ceilingMonthly: 25000,
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v));
    }
  });
});
