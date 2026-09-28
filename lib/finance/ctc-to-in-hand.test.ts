import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PF_CEILING_ANNUAL,
  GRATUITY_FACTOR,
  PF_RATE,
  basicFromCtc,
  calculateCtcToInHand,
  estimateGratuity,
  estimatePfContribution,
  pfWageBase,
  resolveCtcBridge,
  type CtcToInHandInput,
} from "./ctc-to-in-hand";
import { ctcToInHandTool } from "../../config/tools/ctc-to-in-hand.config";
import { calculateSalary } from "./salary-calculator";

const BASE: CtcToInHandInput = {
  annualCtc: 1200000,
  basicPct: 50,
  bonusAnnual: 0,
  includeEmployerPf: true,
  employerPfManualAnnual: 0,
  includeGratuity: true,
  gratuityManualAnnual: 0,
  otherEmployerAnnual: 0,
  usePfCeiling: true,
  pfCeilingAnnual: DEFAULT_PF_CEILING_ANNUAL,
  employeePfManualAnnual: 0,
  professionalTaxAnnual: 0,
  otherDeductionsAnnual: 0,
  regime: "new",
  financialYear: "2026-27",
};

const approx = (actual: number, expected: number, eps = 0.01) =>
  assert.ok(Math.abs(actual - expected) < eps, `expected ~${expected}, got ${actual}`);

describe("CTC with no employer components", () => {
  it("gross cash equals CTC when PF and gratuity are excluded", () => {
    const r = calculateCtcToInHand({ ...BASE, includeEmployerPf: false, includeGratuity: false });
    assert.equal(r.grossCashAnnual, 1200000);
    assert.equal(r.totalEmployerComponents, 0);
    assert.equal(r.employerPfAnnual, 0);
    assert.equal(r.gratuityAnnual, 0);
    // Taxable 11,25,000 <= 12L rebate limit -> zero tax (FY 2026-27 new).
    assert.equal(r.incomeTax, 0);
    // Employee PF still auto-estimated for take-home: 12% of min(600000, 300000).
    assert.equal(r.employeePfAnnual, 36000);
    assert.equal(r.takeHomeAnnual, 1164000);
  });
});

describe("CTC with employer PF", () => {
  it("12% of basic capped at the ceiling reduces gross cash", () => {
    const r = calculateCtcToInHand({ ...BASE, includeGratuity: false });
    assert.equal(r.basicAnnual, 600000);
    assert.equal(r.employerPfAnnual, 36000);
    assert.equal(r.employerPfAuto, true);
    assert.equal(r.grossCashAnnual, 1164000);
  });
  it("ceiling off means 12% of full basic", () => {
    const input: CtcToInHandInput = {
      ...BASE,
      annualCtc: 2000000,
      includeGratuity: false,
      usePfCeiling: false,
    };
    const r = calculateCtcToInHand(input);
    assert.equal(r.basicAnnual, 1000000);
    assert.equal(r.employerPfAnnual, 120000);
    assert.equal(r.employeePfAnnual, 120000);
  });
  it("manual employer PF override is used and flagged", () => {
    const r = calculateCtcToInHand({ ...BASE, includeGratuity: false, employerPfManualAnnual: 50000 });
    assert.equal(r.employerPfAnnual, 50000);
    assert.equal(r.employerPfAuto, false);
    assert.equal(r.grossCashAnnual, 1150000);
  });
});

describe("CTC with gratuity", () => {
  it("basic x 15/26 provision is removed from CTC, not paid monthly", () => {
    const input: CtcToInHandInput = {
      ...BASE,
      annualCtc: 1040000,
      includeEmployerPf: false,
    };
    const r = calculateCtcToInHand(input);
    assert.equal(r.basicAnnual, 520000);
    assert.equal(r.gratuityAnnual, 300000); // 520000 x 15/26
    assert.equal(r.gratuityAuto, true);
    assert.equal(r.grossCashAnnual, 740000);
  });
  it("gratuity can be switched off or overridden", () => {
    const off = calculateCtcToInHand({ ...BASE, includeEmployerPf: false, includeGratuity: false });
    assert.equal(off.gratuityAnnual, 0);
    const manual = calculateCtcToInHand({
      ...BASE,
      includeEmployerPf: false,
      gratuityManualAnnual: 100000,
    });
    assert.equal(manual.gratuityAnnual, 100000);
    assert.equal(manual.gratuityAuto, false);
  });
});

describe("CTC with both PF and gratuity", () => {
  it("exact-integer bridge: CTC 5.2L, basic 50%", () => {
    const input: CtcToInHandInput = {
      ...BASE,
      annualCtc: 520000,
      financialYear: "2026-27",
    };
    const r = calculateCtcToInHand(input);
    assert.equal(r.basicAnnual, 260000);
    assert.equal(r.employerPfAnnual, 31200); // 12% of 260000 (below ceiling)
    assert.equal(r.gratuityAnnual, 150000); // 260000 x 15/26
    assert.equal(r.totalEmployerComponents, 181200);
    assert.equal(r.grossCashAnnual, 338800);
    // Taxable 263,800 < 4L -> zero slab tax; employee PF 31,200 off take-home.
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 307600);
  });
});

describe("CTC with bonus", () => {
  it("bonus stays in gross cash but regular monthly excludes it", () => {
    const withBonus = calculateCtcToInHand({ ...BASE, includeGratuity: false, bonusAnnual: 120000 });
    const noBonus = calculateCtcToInHand({ ...BASE, includeGratuity: false, bonusAnnual: 0 });
    assert.equal(withBonus.fixedGrossAnnual, withBonus.grossCashAnnual - 120000);
    assert.ok(withBonus.regularMonthlyInHand < withBonus.averageMonthlyInHand);
    approx(withBonus.regularMonthlyInHand, (withBonus.takeHomeAnnual - 120000) / 12);
    // Bonus is carved from the same CTC envelope, so the annual total is unchanged —
    // only the monthly presentation differs.
    assert.equal(withBonus.takeHomeAnnual, noBonus.takeHomeAnnual);
    assert.equal(withBonus.averageMonthlyInHand, noBonus.averageMonthlyInHand);
    assert.ok(withBonus.regularMonthlyInHand < noBonus.averageMonthlyInHand);
  });
});

describe("CTC with other employer components", () => {
  it("insurance/NPS-style components reduce gross cash one-for-one", () => {
    const base = calculateCtcToInHand({ ...BASE, includeEmployerPf: false, includeGratuity: false });
    const withOther = calculateCtcToInHand({
      ...BASE,
      includeEmployerPf: false,
      includeGratuity: false,
      otherEmployerAnnual: 50000,
    });
    assert.equal(withOther.grossCashAnnual, base.grossCashAnnual - 50000);
  });
});

describe("employee-side deductions", () => {
  it("employee PF auto-mirrors the 12% basis", () => {
    const r = calculateCtcToInHand({ ...BASE, includeGratuity: false });
    assert.equal(r.employeePfAuto, true);
    assert.equal(r.employeePfAnnual, 36000);
  });
  it("employee PF manual override", () => {
    const r = calculateCtcToInHand({ ...BASE, includeGratuity: false, employeePfManualAnnual: 42000 });
    assert.equal(r.employeePfAnnual, 42000);
    assert.equal(r.employeePfAuto, false);
  });
  it("professional tax and other deductions reduce take-home", () => {
    const plain = calculateCtcToInHand({
      ...BASE,
      includeEmployerPf: false,
      includeGratuity: false,
    });
    const withDed = calculateCtcToInHand({
      ...BASE,
      includeEmployerPf: false,
      includeGratuity: false,
      professionalTaxAnnual: 2500,
      otherDeductionsAnnual: 10000,
    });
    assert.equal(withDed.takeHomeAnnual, plain.takeHomeAnnual - 12500);
  });
});

describe("regimes and financial years", () => {
  const noBridge: CtcToInHandInput = {
    ...BASE,
    includeEmployerPf: false,
    includeGratuity: false,
  };
  it("new regime FY 2026-27 on CTC 12L, no bridge", () => {
    const r = calculateCtcToInHand(noBridge);
    assert.equal(r.taxableIncome, 1125000);
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 1164000);
  });
  it("old regime taxes the same CTC", () => {
    const r = calculateCtcToInHand({ ...noBridge, regime: "old" });
    // Taxable 11.5L: 12,500 + 100,000 + 45,000 = 157,500 + 6,300 cess.
    assert.equal(r.incomeTax, 163800);
    assert.ok(r.takeHomeAnnual < 1164000);
  });
  it("FY 2024-25 new regime differs from FY 2026-27", () => {
    const fy24 = calculateCtcToInHand({ ...noBridge, financialYear: "2024-25" });
    // Taxable 11.25L under FY24-25 slabs: 20,000 + 30,000 + 18,750 = 68,750 + 2,750 cess.
    assert.equal(fy24.incomeTax, 71500);
  });
  it("FY 2025-26 matches FY 2026-27", () => {
    const a = calculateCtcToInHand({ ...BASE, financialYear: "2025-26" });
    const b = calculateCtcToInHand({ ...BASE, financialYear: "2026-27" });
    assert.deepEqual(a, b);
  });
});

describe("zero optional values", () => {
  it("basic 0% with everything off falls back to CTC", () => {
    const r = calculateCtcToInHand({
      ...BASE,
      annualCtc: 600000,
      basicPct: 0,
      includeEmployerPf: false,
      includeGratuity: false,
    });
    assert.equal(r.basicAnnual, 0);
    assert.equal(r.grossCashAnnual, 600000);
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 600000);
  });
});

describe("decimals", () => {
  it("paise survive the bridge when basic is 0%", () => {
    const r = calculateCtcToInHand({
      ...BASE,
      annualCtc: 1250000.5,
      basicPct: 0,
      includeEmployerPf: false,
      includeGratuity: false,
    });
    assert.equal(r.incomeTax, 0);
    assert.equal(r.takeHomeAnnual, 1250000.5);
  });
});

describe("invalid inputs", () => {
  const valid = {
    annualCtc: 1200000,
    basicPct: 50,
    bonusAnnual: 0,
    includeEmployerPf: true,
    employerPfManualAnnual: 0,
    includeGratuity: true,
    gratuityManualAnnual: 0,
    otherEmployerAnnual: 0,
    usePfCeiling: true,
    pfCeilingAnnual: 300000,
    employeePfManualAnnual: 0,
    professionalTaxAnnual: 0,
    otherDeductionsAnnual: 0,
    regime: "new" as const,
    financialYear: "2026-27" as const,
  };
  it("accepts the valid example input", () => {
    assert.equal(ctcToInHandTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects negative CTC", () => {
    assert.equal(ctcToInHandTool.inputSchema.safeParse({ ...valid, annualCtc: -1 }).success, false);
  });
  it("rejects basic percentage above 100", () => {
    assert.equal(ctcToInHandTool.inputSchema.safeParse({ ...valid, basicPct: 101 }).success, false);
  });
  it("rejects employer components consuming the entire CTC", () => {
    assert.equal(
      ctcToInHandTool.inputSchema.safeParse({ ...valid, otherEmployerAnnual: 1200000 }).success,
      false
    );
  });
  it("rejects bonus larger than gross cash", () => {
    assert.equal(
      ctcToInHandTool.inputSchema.safeParse({ ...valid, bonusAnnual: 1200000 }).success,
      false
    );
  });
  it("rejects deductions larger than gross cash", () => {
    assert.equal(
      ctcToInHandTool.inputSchema.safeParse({ ...valid, otherDeductionsAnnual: 2000000 }).success,
      false
    );
  });
  it("NaN input yields finite zeroed outputs, never NaN", () => {
    const r = calculateCtcToInHand({
      ...BASE,
      annualCtc: NaN,
      basicPct: NaN,
      bonusAnnual: NaN,
      professionalTaxAnnual: NaN,
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `expected finite, got ${v}`);
    }
    assert.equal(r.takeHomeAnnual, 0);
  });
});

describe("very large CTC", () => {
  it("stays finite and non-negative", () => {
    const r = calculateCtcToInHand({ ...BASE, annualCtc: 1000000000 });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v));
    }
    assert.ok(r.takeHomeAnnual >= 0);
    assert.ok(Math.abs(r.averageMonthlyInHand * 12 - r.takeHomeAnnual) < 1);
  });
});

describe("monthly consistency and determinism", () => {
  it("average monthly x 12 equals annual take-home", () => {
    const r = calculateCtcToInHand({ ...BASE, bonusAnnual: 100000 });
    assert.ok(Math.abs(r.averageMonthlyInHand * 12 - r.takeHomeAnnual) < 1);
  });
  it("average monthly never presented as bonus-inclusive guaranteed cash", () => {
    const r = calculateCtcToInHand({ ...BASE, bonusAnnual: 240000 });
    // The two monthly figures must differ whenever bonus exists...
    assert.ok(r.averageMonthlyInHand > r.regularMonthlyInHand);
    // ...and the bonus stays visible as its own annual line item.
    assert.equal(r.bonusAnnual, 240000);
  });
  it("outputs are deterministic", () => {
    assert.deepEqual(calculateCtcToInHand(BASE), calculateCtcToInHand({ ...BASE }));
  });
});

describe("salary-tax-engine equivalence", () => {
  it("same taxable income, FY and regime give the same tax in both calculators", () => {
    for (const financialYear of ["2024-25", "2025-26", "2026-27"] as const) {
      for (const regime of ["new", "old"] as const) {
        // No bridge components -> gross cash equals CTC in both calculators.
        const ctc = calculateCtcToInHand({
          ...BASE,
          annualCtc: 2000000,
          includeEmployerPf: false,
          includeGratuity: false,
          regime,
          financialYear,
        });
        const salary = calculateSalary({
          annualCtc: 2000000,
          components: { basicAnnual: 0, hraAnnual: 0, otherAllowancesAnnual: 0, bonusAnnual: 0 },
          deductions: { employeePfAnnual: 0, professionalTaxAnnual: 0, otherDeductionsAnnual: 0 },
          regime,
          financialYear,
        });
        assert.equal(ctc.taxableIncome, salary.taxableIncome);
        assert.equal(ctc.slabTax, salary.slabTax);
        assert.equal(ctc.rebate, salary.rebate);
        assert.equal(ctc.cess, salary.cess);
        assert.equal(ctc.incomeTax, salary.incomeTax);
      }
    }
  });
});

describe("bridge primitives", () => {  it("basicFromCtc clamps percentage to 0-100", () => {
    assert.equal(basicFromCtc(1200000, 50), 600000);
    assert.equal(basicFromCtc(1200000, 150), 1200000);
    assert.equal(basicFromCtc(1200000, -5), 0);
  });
  it("pfWageBase honours the ceiling toggle", () => {
    assert.equal(pfWageBase(1000000, true, 300000), 300000);
    assert.equal(pfWageBase(1000000, false, 300000), 1000000);
  });
  it("PF estimate is 12% and gratuity is basic x 15/26", () => {
    assert.equal(estimatePfContribution(300000, true, 300000), 36000);
    assert.equal(PF_RATE, 0.12);
    assert.equal(GRATUITY_FACTOR, 15 / 26);
    assert.equal(estimateGratuity(260000), 150000);
  });
  it("bridge never yields negative gross cash", () => {
    const b = resolveCtcBridge({ ...BASE, annualCtc: 100000, otherEmployerAnnual: 500000 });
    assert.equal(b.grossCashAnnual, 0);
  });
});
