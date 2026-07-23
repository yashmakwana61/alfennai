"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { PasswordInput, PasswordOutput } from "@/config/tools/password-generator.config";

interface Props {
  tool: ToolConfig<PasswordInput, PasswordOutput>;
}

const strengthColor: Record<PasswordOutput["strength"], string> = {
  Weak: "text-error",
  Fair: "text-warning",
  Strong: "text-success",
  "Very strong": "text-success",
};

export function PasswordGenerator({ tool }: Props) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [result, setResult] = useState<PasswordOutput | null>(null);

  function generate() {
    const parsed = tool.inputSchema.safeParse({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    });
    if (!parsed.success) return;
    setResult(tool.compute(parsed.data));
  }

  function handleCopy() {
    if (result) navigator.clipboard.writeText(result.password);
  }

  const checkboxes: { label: string; value: boolean; set: (v: boolean) => void }[] = [
    { label: "Uppercase (A-Z)", value: includeUppercase, set: setIncludeUppercase },
    { label: "Lowercase (a-z)", value: includeLowercase, set: setIncludeLowercase },
    { label: "Numbers (0-9)", value: includeNumbers, set: setIncludeNumbers },
    { label: "Symbols (!@#$)", value: includeSymbols, set: setIncludeSymbols },
  ];

  return (
    <div>
      <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3.5 font-mono text-lg text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        {result?.password ?? "Click generate to create a password"}
      </div>

      {result && (
        <p className={`mt-2 text-sm font-medium ${strengthColor[result.strength]}`}>
          Strength: {result.strength}
        </p>
      )}

      <div className="mt-5">
        <label htmlFor="length" className="mb-1.5 flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
          <span>Length</span>
          <span>{length} characters</span>
        </label>
        <input
          id="length"
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {checkboxes.map((cb) => (
          <label key={cb.label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={cb.value}
              onChange={(e) => cb.set(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            {cb.label}
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generate} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90">
          <RefreshCw className="h-4 w-4" /> Generate password
        </button>
        {result && (
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Copy className="h-4 w-4" /> Copy
          </button>
        )}
      </div>
    </div>
  );
}
