"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { ColorPickerInput, ColorPickerOutput } from "@/config/tools/color-picker.config";
import { FieldLabel, TextInput, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton } from "@/components/tools/shared/Buttons";

export function ColorPicker({ tool }: { tool: ToolConfig<ColorPickerInput, ColorPickerOutput> }) {
  const [hex, setHex] = useState("#2563EB");
  const [result, setResult] = useState<ColorPickerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ hex });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid color");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <div>
          <FieldLabel htmlFor="hex">HEX color</FieldLabel>
          <div className="flex items-center gap-2">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#2563eb"} onChange={(e) => setHex(e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-slate-300 dark:border-slate-700" />
            <TextInput id="hex" value={hex} onChange={(e) => setHex(e.target.value)} className="w-32 font-mono" />
          </div>
        </div>
        <PrimaryButton onClick={run}>Convert</PrimaryButton>
      </div>
      <ErrorText>{error}</ErrorText>
      {result && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="h-16 w-full rounded-lg" style={{ backgroundColor: result.hex }} />
            <p className="mt-3 font-mono text-sm text-slate-700 dark:text-slate-300">HEX: {result.hex}</p>
            <p className="font-mono text-sm text-slate-700 dark:text-slate-300">RGB: {result.rgb.r}, {result.rgb.g}, {result.rgb.b}</p>
            <p className="font-mono text-sm text-slate-700 dark:text-slate-300">HSL: {result.hsl.h}°, {result.hsl.s}%, {result.hsl.l}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="h-16 w-full rounded-lg" style={{ backgroundColor: result.complementaryHex }} />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Complementary color</p>
            <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{result.complementaryHex}</p>
          </div>
        </div>
      )}
    </div>
  );
}
