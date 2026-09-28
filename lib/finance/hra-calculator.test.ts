import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  METRO_RATE,
  NON_METRO_RATE,
  calculateHra,
  locationRate,
  salaryBasisForHra,
} from "./hra-calculator";
import { hraCalculatorTool } from "../../config/tools/hra-calculator.config";

const approx = (actual: number, expected: number, eps = 0.01) =>
  assert.ok(Math.abs(actual - expected) < eps, `expected ~${expected}, got ${actual}`);

const BASE = {
  basicAnnual: 600000,
  daEligibleAnnual: 0,
  hraReceivedAnnual: 300000,
  rentPaidAnnual: 360000,
  cityType: "metro" as const,
  taxRegime: "old" as const,
};

describe("A. basic metro formula", () => {
  it("6L basic, 3L HRA, 3.6L rent -> exemption 3L, taxable 0", () => {
    const r = calculateHra(BASE);
    assert.equal(r.salaryForHra, 600000);
    assert.equal(r.actualHraComponent, 300000);
    assert.equal(r.rentMinusTenPercentComponent, 300000);
    assert.equal(r.locationLimitComponent, 300000);
    assert.equal(r.hraExemption, 300000);
    assert.equal(r.taxableHra, 0);
    assert.equal(r.exemptionAvailable, true);
  });
});

describe("B. non-metro", () => {
  it("same inputs non-metro -> exemption 2.4L, taxable 60k", () => {
    const r = calculateHra({ ...BASE, cityType: "non-metro" });
    assert.equal(r.locationRate, 0.4);
    assert.equal(r.locationLimitComponent, 240000);
    assert.equal(r.hraExemption, 240000);
    assert.equal(r.taxableHra, 60000);
    assert.equal(r.limitingComponent, "location-limit");
  });
});

describe("C. rent below 10% threshold", () => {
  it("30k rent on 6L salary -> B floored at 0, exemption 0", () => {
    const r = calculateHra({ ...BASE, rentPaidAnnual: 30000 });
    assert.equal(r.rentMinusTenPercentComponent, 0);
    assert.equal(r.hraExemption, 0);
    assert.equal(r.taxableHra, 300000);
    assert.equal(r.exemptionAvailable, false);
  });
});

describe("D. HRA is the limiting component", () => {
  it("1L HRA limits the exemption", () => {
    const r = calculateHra({ ...BASE, hraReceivedAnnual: 100000 });
    assert.equal(r.hraExemption, 100000);
    assert.equal(r.taxableHra, 0);
    assert.equal(r.limitingComponent, "actual-hra");
  });
});

describe("E. location limit is the limiting component", () => {
  it("4L HRA, 6L rent, metro -> exemption 3L", () => {
    const r = calculateHra({ ...BASE, hraReceivedAnnual: 400000, rentPaidAnnual: 600000 });
    assert.equal(r.rentMinusTenPercentComponent, 540000);
    assert.equal(r.locationLimitComponent, 300000);
    assert.equal(r.hraExemption, 300000);
    assert.equal(r.taxableHra, 100000);
    assert.equal(r.limitingComponent, "location-limit");
  });
});

describe("F. DA included in salary basis", () => {
  it("6L basic + 1L DA, 3.5L HRA, 5L rent, metro -> exemption 3.5L", () => {
    const r = calculateHra({
      ...BASE,
      daEligibleAnnual: 100000,
      hraReceivedAnnual: 350000,
      rentPaidAnnual: 500000,
    });
    assert.equal(r.salaryForHra, 700000);
    assert.equal(r.rentMinusTenPercentComponent, 430000);
    assert.equal(r.locationLimitComponent, 350000);
    assert.equal(r.hraExemption, 350000);
    assert.equal(r.taxableHra, 0);
  });
  it("salary basis uses Basic + eligible DA only", () => {
    assert.equal(salaryBasisForHra(600000, 100000), 700000);
    assert.equal(salaryBasisForHra(600000, 0), 600000);
  });
});

describe("G. new regime", () => {
  it("exemption 0, taxable = actual HRA", () => {
    const r = calculateHra({ ...BASE, taxRegime: "new" });
    assert.equal(r.hraExemption, 0);
    assert.equal(r.taxableHra, 300000);
    assert.equal(r.exemptionAvailable, false);
    assert.equal(r.limitingComponent, "none");
  });
});

describe("T. new regime never runs the old formula", () => {
  it("components stay zeroed even when the old formula would exempt", () => {
    const r = calculateHra({ ...BASE, taxRegime: "new" });
    assert.equal(r.rentMinusTenPercentComponent, 0);
    assert.equal(r.locationLimitComponent, 0);
  });
});

describe("H. zero HRA", () => {
  it("exemption 0", () => {
    const r = calculateHra({ ...BASE, hraReceivedAnnual: 0 });
    assert.equal(r.hraExemption, 0);
    assert.equal(r.taxableHra, 0);
  });
});

describe("I. zero rent", () => {
  it("exemption 0, full HRA taxable", () => {
    const r = calculateHra({ ...BASE, rentPaidAnnual: 0 });
    assert.equal(r.rentMinusTenPercentComponent, 0);
    assert.equal(r.hraExemption, 0);
    assert.equal(r.taxableHra, 300000);
  });
});

describe("J. decimal inputs", () => {
  it("precision preserved internally", () => {
    const r = calculateHra({
      ...BASE,
      basicAnnual: 600000.5,
      hraReceivedAnnual: 300000.25,
      rentPaidAnnual: 360000.75,
    });
    approx(r.salaryForHra, 600000.5);
    approx(r.rentMinusTenPercentComponent, 300000.7);
    approx(r.hraExemption, 300000.25);
  });
});

describe("N. metro boundary is exactly 50%", () => {
  it("location limit equals half the salary basis", () => {
    const r = calculateHra({ ...BASE, cityType: "metro" });
    assert.equal(r.locationRate, METRO_RATE);
    assert.equal(r.locationRate, 0.5);
    assert.equal(r.locationLimitComponent, r.salaryForHra * 0.5);
  });
});

describe("O. non-metro boundary is exactly 40%", () => {
  it("location limit equals 40% of the salary basis", () => {
    const r = calculateHra({ ...BASE, cityType: "non-metro" });
    assert.equal(r.locationRate, NON_METRO_RATE);
    assert.equal(r.locationRate, 0.4);
    assert.equal(r.locationLimitComponent, r.salaryForHra * 0.4);
  });
  it("locationRate helper", () => {
    assert.equal(locationRate("metro"), 0.5);
    assert.equal(locationRate("non-metro"), 0.4);
  });
});

describe("P. exactly equal components", () => {
  it("deterministic limiting component on ties", () => {
    const r = calculateHra(BASE); // A=B=C=300000
    assert.equal(r.limitingComponent, "actual-hra");
  });
});

describe("Q. HRA less than exemption candidates", () => {
  it("small HRA caps the exemption", () => {
    const r = calculateHra({ ...BASE, hraReceivedAnnual: 50000 });
    assert.equal(r.hraExemption, 50000);
    assert.equal(r.taxableHra, 0);
  });
});

describe("R. rent exactly equal to 10% of salary", () => {
  it("rent-minus-10% component is 0", () => {
    const r = calculateHra({ ...BASE, rentPaidAnnual: 60000 });
    assert.equal(r.rentMinusTenPercentComponent, 0);
    assert.equal(r.hraExemption, 0);
  });
});

describe("S. rent just above 10%", () => {
  it("small positive component flows into the minimum", () => {
    const r = calculateHra({ ...BASE, rentPaidAnnual: 60001 });
    assert.equal(r.rentMinusTenPercentComponent, 1);
    assert.equal(r.hraExemption, 1);
    assert.equal(r.limitingComponent, "rent-minus-10-percent");
  });
});

describe("M. very large input", () => {
  it("capped safely, outputs finite", () => {
    const r = calculateHra({
      ...BASE,
      basicAnnual: 1e12,
      hraReceivedAnnual: 1e12,
      rentPaidAnnual: 1e12,
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v));
    }
    assert.ok(r.hraExemption >= 0);
    assert.ok(r.taxableHra >= 0);
  });
});

describe("L. NaN and Infinity", () => {
  it("NaN yields finite zeroed outputs", () => {
    const r = calculateHra({
      basicAnnual: NaN,
      daEligibleAnnual: NaN,
      hraReceivedAnnual: NaN,
      rentPaidAnnual: NaN,
      cityType: "metro",
      taxRegime: "old",
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `expected finite, got ${v}`);
    }
    assert.equal(r.hraExemption, 0);
  });
  it("Infinity cannot reach outputs", () => {
    const r = calculateHra({
      ...BASE,
      basicAnnual: Number.POSITIVE_INFINITY,
      rentPaidAnnual: Number.POSITIVE_INFINITY,
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v));
    }
  });
});

describe("K. validation boundary", () => {
  const valid = {
    basicAnnual: 600000,
    daEligibleAnnual: 0,
    hraReceivedAnnual: 300000,
    rentPaidAnnual: 360000,
    cityType: "metro" as const,
    taxRegime: "old" as const,
    period: "annual" as const,
  };
  it("accepts the valid example input", () => {
    assert.equal(hraCalculatorTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects negative values", () => {
    assert.equal(hraCalculatorTool.inputSchema.safeParse({ ...valid, basicAnnual: -1 }).success, false);
    assert.equal(hraCalculatorTool.inputSchema.safeParse({ ...valid, rentPaidAnnual: -5 }).success, false);
  });
  it("rejects NaN", () => {
    assert.equal(hraCalculatorTool.inputSchema.safeParse({ ...valid, hraReceivedAnnual: NaN }).success, false);
  });
  it("rejects invalid city and regime", () => {
    assert.equal(hraCalculatorTool.inputSchema.safeParse({ ...valid, cityType: "tier-2" }).success, false);
    assert.equal(hraCalculatorTool.inputSchema.safeParse({ ...valid, taxRegime: "super-new" }).success, false);
  });
});
