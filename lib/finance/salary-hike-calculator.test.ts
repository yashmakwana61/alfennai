import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_HIKE_PCT,
  calculateHike,
  hikeAmount,
  percentageIncrease,
  revisedSalary,
} from "./salary-hike-calculator";
import { salaryHikeTool } from "../../config/tools/salary-hike-calculator.config";

const approx = (actual: number, expected: number, eps = 0.01) =>
  assert.ok(Math.abs(actual - expected) < eps, `expected ~${expected}, got ${actual}`);

describe("10% annual hike", () => {
  it("600000 + 10% = 660000, monthly 55000", () => {
    const r = calculateHike({ currentSalary: 600000, hikePct: 10, period: "annual" });
    assert.equal(r.hikeAnnual, 60000);
    assert.equal(r.revisedAnnual, 660000);
    assert.equal(r.currentMonthly, 50000);
    assert.equal(r.hikeMonthly, 5000);
    assert.equal(r.revisedMonthly, 55000);
  });
});

describe("20% annual hike", () => {
  it("600000 + 20% = 720000", () => {
    const r = calculateHike({ currentSalary: 600000, hikePct: 20, period: "annual" });
    assert.equal(r.hikeAnnual, 120000);
    assert.equal(r.revisedAnnual, 720000);
    assert.equal(r.revisedMonthly, 60000);
  });
});

describe("0% hike", () => {
  it("is valid and leaves salary unchanged", () => {
    const r = calculateHike({ currentSalary: 600000, hikePct: 0, period: "annual" });
    assert.equal(r.hikeAnnual, 0);
    assert.equal(r.revisedAnnual, 600000);
    assert.equal(r.revisedMonthly, 50000);
  });
});

describe("decimal hike", () => {
  it("7.5% on 800000 = 60000", () => {
    const r = calculateHike({ currentSalary: 800000, hikePct: 7.5, period: "annual" });
    assert.equal(r.hikeAnnual, 60000);
    assert.equal(r.revisedAnnual, 860000);
  });
  it("decimal salary preserved", () => {
    const r = calculateHike({ currentSalary: 555555.55, hikePct: 10, period: "annual" });
    approx(r.hikeAnnual, 55555.555);
    approx(r.revisedAnnual, 611111.105);
  });
});

describe("monthly salary", () => {
  it("50000/month + 10% = 55000/month with annual equivalents", () => {
    const r = calculateHike({ currentSalary: 50000, hikePct: 10, period: "monthly" });
    assert.equal(r.hikeMonthly, 5000);
    assert.equal(r.revisedMonthly, 55000);
    assert.equal(r.currentAnnual, 600000);
    assert.equal(r.hikeAnnual, 60000);
    assert.equal(r.revisedAnnual, 660000);
  });
});

describe("monthly/annual equivalence", () => {
  it("same salary via either period gives the same annual figures", () => {
    const viaAnnual = calculateHike({ currentSalary: 600000, hikePct: 12.5, period: "annual" });
    const viaMonthly = calculateHike({ currentSalary: 50000, hikePct: 12.5, period: "monthly" });
    assert.equal(viaAnnual.revisedAnnual, viaMonthly.revisedAnnual);
    assert.equal(viaAnnual.hikeAnnual, viaMonthly.hikeAnnual);
  });
});

describe("core identities", () => {
  it("hike amount = current x percentage / 100", () => {
    assert.equal(hikeAmount(100000, 7.5), 7500);
    assert.equal(hikeAmount(0, 10), 0);
  });
  it("revised salary = current + hike", () => {
    const r = calculateHike({ currentSalary: 437000, hikePct: 13.25, period: "annual" });
    approx(r.revisedAnnual, r.currentAnnual + r.hikeAnnual);
  });
  it("monthly result = annual / 12", () => {
    const r = calculateHike({ currentSalary: 600000, hikePct: 10, period: "annual" });
    assert.equal(r.revisedMonthly, r.revisedAnnual / 12);
    assert.equal(r.hikeMonthly, r.hikeAnnual / 12);
  });
  it("annual result = monthly x 12", () => {
    const r = calculateHike({ currentSalary: 50000, hikePct: 10, period: "monthly" });
    assert.equal(r.revisedAnnual, r.revisedMonthly * 12);
    assert.equal(r.hikeAnnual, r.hikeMonthly * 12);
  });
  it("percentageIncrease inverts the hike", () => {
    assert.equal(percentageIncrease(600000, 60000), 10);
    assert.equal(percentageIncrease(0, 60000), 0);
  });
  it("revisedSalary helper matches", () => {
    assert.equal(revisedSalary(600000, 10), 660000);
  });
});

describe("floating-point precision", () => {
  it("no display-breaking artifacts on awkward values", () => {
    const r = calculateHike({ currentSalary: 999999, hikePct: 12.5, period: "annual" });
    approx(r.hikeAnnual, 124999.875);
    approx(r.revisedAnnual, 1124998.875);
    approx(r.revisedMonthly, 93749.90625);
  });
});

describe("very high values", () => {
  it("very high salary stays finite", () => {
    const r = calculateHike({ currentSalary: 1000000000, hikePct: 10, period: "annual" });
    assert.equal(r.hikeAnnual, 100000000);
    assert.equal(r.revisedAnnual, 1100000000);
  });
  it("very high percentage is bounded", () => {
    const r = calculateHike({ currentSalary: 600000, hikePct: 100000, period: "annual" });
    assert.equal(r.hikePct, MAX_HIKE_PCT);
    assert.equal(r.hikeAnnual, 6000000);
    assert.equal(r.revisedAnnual, 6600000);
  });
});

describe("finite result guarantees", () => {
  it("NaN input yields finite zeroed outputs", () => {
    const r = calculateHike({ currentSalary: NaN, hikePct: NaN, period: "annual" });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `expected finite, got ${v}`);
    }
    assert.equal(r.revisedAnnual, 0);
  });
  it("Infinity input cannot reach outputs", () => {
    const r = calculateHike({
      currentSalary: Number.POSITIVE_INFINITY,
      hikePct: Number.POSITIVE_INFINITY,
      period: "monthly",
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v));
    }
  });
});

describe("input validation at the tool schema boundary", () => {
  const valid = { currentSalary: 600000, hikePct: 10, period: "annual" as const };
  it("accepts the valid example input", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects zero salary", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, currentSalary: 0 }).success, false);
  });
  it("rejects negative salary", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, currentSalary: -100 }).success, false);
  });
  it("rejects negative percentage", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, hikePct: -5 }).success, false);
  });
  it("accepts 0% hike", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, hikePct: 0 }).success, true);
  });
  it("rejects percentage above the upper bound", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, hikePct: 1001 }).success, false);
  });
  it("rejects invalid period", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, period: "weekly" }).success, false);
  });
  it("rejects NaN salary", () => {
    assert.equal(salaryHikeTool.inputSchema.safeParse({ ...valid, currentSalary: NaN }).success, false);
  });
});
