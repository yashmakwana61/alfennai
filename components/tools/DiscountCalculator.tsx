"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { DiscountInput, DiscountOutput } from "@/config/tools/discount-calculator.config";
import { FieldLabel, TextInput, ErrorText, ResultCard, StatGrid } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton } from "@/components/tools/shared/Buttons";

export function DiscountCalculator({ tool }: { tool: ToolConfig<DiscountInput, DiscountOutput> }) {
  const [price, setPrice] = useState("2000");
  const [discount, setDiscount] = useState("25");
  const [result, setResult] = useState<DiscountOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsed = tool.inputSchema.safeParse({ originalPrice: Number(price), discountPercent: Number(discount) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function reset() {
    setPrice("");
    setDiscount("");
    setResult(null);
    setError(null);
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="price">Original price</FieldLabel>
          <TextInput id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="discount">Discount (%)</FieldLabel>
          <TextInput id="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton onClick={calculate}>Calculate</PrimaryButton>
        <SecondaryButton onClick={reset}>Reset</SecondaryButton>
      </div>
      {result && (
        <ResultCard>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">{fmt(result.finalPrice)}</p>
          <StatGrid items={[{ label: "You save", value: fmt(result.savedAmount) }]} />
        </ResultCard>
      )}
    </div>
  );
}
