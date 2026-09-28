import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PT_RULES,
  calculateProfessionalTax,
  getStateRule,
} from "./professional-tax-calculator";
import { professionalTaxCalculatorTool } from "../../config/tools/professional-tax-calculator.config";

describe("Maharashtra (official schedule, in force 1.4.2023)", () => {
  const mh = (salary: number, gender: "male" | "female" = "male") =>
    calculateProfessionalTax({ stateCode: "MH", monthlySalary: salary, gender });
  it("men: nil to 7,500", () => {
    assert.equal(mh(7000).monthlyProfessionalTax, 0);
    assert.equal(mh(7500).annualProfessionalTax, 0);
  });
  it("men: 175/month for 7,501–10,000 (uniform, annual 2,100)", () => {
    const r = mh(7501);
    assert.equal(r.monthlyProfessionalTax, 175);
    assert.equal(r.februaryProfessionalTax, 175);
    assert.equal(r.annualProfessionalTax, 2100);
    assert.equal(mh(10000).annualProfessionalTax, 2100);
  });
  it("men: above 10,000 -> 200 x 11 + 300 Feb = 2,500", () => {
    const r = mh(10001);
    assert.equal(r.monthlyProfessionalTax, 200);
    assert.equal(r.februaryProfessionalTax, 300);
    assert.equal(r.annualProfessionalTax, 2500);
    assert.equal(r.schedule.length, 12);
  });
  it("women: exempt to 25,000", () => {
    assert.equal(mh(20000, "female").annualProfessionalTax, 0);
    assert.equal(mh(25000, "female").monthlyProfessionalTax, 0);
  });
  it("women: above 25,000 follows the 2,500 structure", () => {
    const r = mh(25001, "female");
    assert.equal(r.monthlyProfessionalTax, 200);
    assert.equal(r.februaryProfessionalTax, 300);
    assert.equal(r.annualProfessionalTax, 2500);
  });
  it("annual is schedule-driven, not 200 x 12", () => {
    const r = mh(50000);
    assert.equal(r.annualProfessionalTax, 11 * 200 + 300);
    assert.ok(r.annualProfessionalTax !== 200 * 12);
  });
});

describe("Karnataka (portal schedule + 2025 amendment)", () => {
  const ka = (salary: number) => calculateProfessionalTax({ stateCode: "KA", monthlySalary: salary });
  it("nil below 25,000", () => {
    assert.equal(ka(24000).annualProfessionalTax, 0);
    assert.equal(ka(24999).monthlyProfessionalTax, 0);
  });
  it("25,000 and above -> 200 x 11 + 300 Feb", () => {
    const r = ka(25000);
    assert.equal(r.monthlyProfessionalTax, 200);
    assert.equal(r.februaryProfessionalTax, 300);
    assert.equal(r.annualProfessionalTax, 2500);
  });
  it("high salary stays at the top band", () => {
    assert.equal(ka(200000).annualProfessionalTax, 2500);
  });
});

describe("West Bengal (schedule w.e.f. 1.4.2014)", () => {
  const wb = (salary: number) => calculateProfessionalTax({ stateCode: "WB", monthlySalary: salary });
  it("nil to 10,000", () => {
    assert.equal(wb(8000).monthlyProfessionalTax, 0);
    assert.equal(wb(10000).annualProfessionalTax, 0);
  });
  it("10,001–15,000 -> 110 uniform", () => {
    const r = wb(10001);
    assert.equal(r.monthlyProfessionalTax, 110);
    assert.equal(r.februaryProfessionalTax, 110);
    assert.equal(r.annualProfessionalTax, 1320);
  });
  it("boundary 15,000 stays at 110, 15,001 moves to 130", () => {
    assert.equal(wb(15000).monthlyProfessionalTax, 110);
    assert.equal(wb(15001).monthlyProfessionalTax, 130);
  });
  it("25,001–40,000 -> 150", () => {
    assert.equal(wb(25001).monthlyProfessionalTax, 150);
    assert.equal(wb(40000).annualProfessionalTax, 1800);
  });
  it("above 40,000 -> 200", () => {
    const r = wb(40001);
    assert.equal(r.monthlyProfessionalTax, 200);
    assert.equal(r.annualProfessionalTax, 2400);
  });
});

describe("Gujarat (schedule effective 1.4.2022)", () => {
  const gj = (salary: number) => calculateProfessionalTax({ stateCode: "GJ", monthlySalary: salary });
  it("nil to 12,000", () => {
    assert.equal(gj(12000).annualProfessionalTax, 0);
  });
  it("above 12,000 -> flat 200 uniform", () => {
    const r = gj(12001);
    assert.equal(r.monthlyProfessionalTax, 200);
    assert.equal(r.februaryProfessionalTax, 200);
    assert.equal(r.annualProfessionalTax, 2400);
  });
});

describe("Andhra Pradesh and Telangana (1987 Act schedules)", () => {
  it("AP: nil/150/200 tiers", () => {
    const ap = (s: number) => calculateProfessionalTax({ stateCode: "AP", monthlySalary: s });
    assert.equal(ap(15000).monthlyProfessionalTax, 0);
    assert.equal(ap(15001).monthlyProfessionalTax, 150);
    assert.equal(ap(20000).annualProfessionalTax, 1800);
    assert.equal(ap(20001).monthlyProfessionalTax, 200);
    assert.equal(ap(20001).annualProfessionalTax, 2400);
  });
  it("TG: same three tiers", () => {
    const tg = (s: number) => calculateProfessionalTax({ stateCode: "TG", monthlySalary: s });
    assert.equal(tg(15000).monthlyProfessionalTax, 0);
    assert.equal(tg(18000).monthlyProfessionalTax, 150);
    assert.equal(tg(50000).annualProfessionalTax, 2400);
  });
});

describe("source metadata completeness", () => {
  it("every supported state carries verifiable source provenance", () => {
    assert.ok(PT_RULES.length > 0);
    for (const rule of PT_RULES) {
      assert.ok(rule.sourceUrl.startsWith("https://"), `${rule.stateCode} source must be https`);
      assert.ok(rule.sourceTitle.length > 10, `${rule.stateCode} needs a source title`);
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(rule.verifiedOn), `${rule.stateCode} needs a verification date`);
      assert.ok(rule.effectiveNote.length > 5, `${rule.stateCode} needs an effective-date note`);
      assert.ok(rule.slabs.length >= 2, `${rule.stateCode} needs a real rate table`);
    }
  });
  it("West Bengal encodes the schedule current through FY 2026-27", () => {
    const wb = getStateRule("WB")!;
    assert.ok(wb.effectiveNote.includes("2014") || wb.notes.includes("2027"));
    assert.ok(wb.verifiedOn === "2026-09-28");
  });
});

describe("unsupported states never fabricate results", () => {  it("unknown code resolves to unsupported with zeros", () => {
    const r = calculateProfessionalTax({ stateCode: "XX", monthlySalary: 100000 });
    assert.equal(r.supported, false);
    assert.equal(r.monthlyProfessionalTax, 0);
    assert.equal(r.annualProfessionalTax, 0);
    assert.deepEqual(r.schedule, []);
  });
  it("Tamil Nadu / Kerala / MP are not encoded without verification", () => {
    for (const code of ["TN", "KL", "MP", "DL"]) {
      assert.equal(getStateRule(code), undefined);
      assert.equal(calculateProfessionalTax({ stateCode: code, monthlySalary: 60000 }).supported, false);
    }
  });
  it("six states are encoded", () => {
    assert.equal(PT_RULES.length, 6);
  });
});

describe("invalid and extreme inputs", () => {
  const valid = { stateCode: "MH", monthlySalary: 30000, gender: "male" as const };
  it("accepts the valid example input", () => {
    assert.equal(professionalTaxCalculatorTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects negative salary", () => {
    assert.equal(
      professionalTaxCalculatorTool.inputSchema.safeParse({ ...valid, monthlySalary: -1 }).success,
      false
    );
  });
  it("rejects NaN salary", () => {
    assert.equal(
      professionalTaxCalculatorTool.inputSchema.safeParse({ ...valid, monthlySalary: NaN }).success,
      false
    );
  });
  it("rejects invalid state", () => {
    assert.equal(
      professionalTaxCalculatorTool.inputSchema.safeParse({ ...valid, stateCode: "XX" }).success,
      false
    );
  });
  it("rejects invalid gender option", () => {
    assert.equal(
      professionalTaxCalculatorTool.inputSchema.safeParse({ ...valid, gender: "other" }).success,
      false
    );
  });
  it("decimals work", () => {
    const r = calculateProfessionalTax({ stateCode: "GJ", monthlySalary: 12000.5 });
    assert.equal(r.monthlyProfessionalTax, 200);
  });
  it("NaN engine input yields finite zeroed outputs", () => {
    const r = calculateProfessionalTax({ stateCode: "MH", monthlySalary: NaN, gender: "male" });
    assert.ok(Number.isFinite(r.monthlyProfessionalTax));
    assert.ok(Number.isFinite(r.annualProfessionalTax));
    assert.equal(r.annualProfessionalTax, 0);
  });
  it("Infinity engine input cannot reach outputs", () => {
    const r = calculateProfessionalTax({ stateCode: "KA", monthlySalary: Number.POSITIVE_INFINITY });
    assert.ok(Number.isFinite(r.monthlyProfessionalTax));
    assert.ok(Number.isFinite(r.annualProfessionalTax));
  });
  it("deterministic results", () => {
    const a = calculateProfessionalTax({ stateCode: "WB", monthlySalary: 28000 });
    const b = calculateProfessionalTax({ stateCode: "WB", monthlySalary: 28000 });
    assert.deepEqual(a, b);
    assert.equal(a.annualProfessionalTax, 1800);
  });
});
