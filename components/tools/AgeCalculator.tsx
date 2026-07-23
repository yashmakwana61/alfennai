"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Copy, Share2 } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { AgeInput, AgeOutput } from "@/config/tools/age-calculator.config";

interface Props {
  tool: ToolConfig<AgeInput, AgeOutput>;
}

export function AgeCalculator({ tool }: Props) {
  const [birthDate, setBirthDate] = useState("");
  const [compareDate, setCompareDate] = useState("");
  const [result, setResult] = useState<AgeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCalculate() {
    const parsed = tool.inputSchema.safeParse({ birthDate, compareDate: compareDate || undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setResult(null);
      return;
    }
    setError(null);
    setResult(tool.compute(parsed.data));
  }

  function handleReset() {
    setBirthDate("");
    setCompareDate("");
    setResult(null);
    setError(null);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(
      `${result.years} years, ${result.months} months, ${result.days} days`
    );
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: tool.title, url: window.location.href });
    }
  }

  function loadExample() {
    setBirthDate((tool.exampleInput?.birthDate as string) ?? "1995-06-15");
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="birthDate" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Date of birth
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="compareDate" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Age as of (optional, defaults to today)
          </label>
          <input
            id="compareDate"
            type="date"
            value={compareDate}
            onChange={(e) => setCompareDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={handleCalculate}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Calculate age
        </button>
        <button
          onClick={loadExample}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Try example
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl bg-slate-50 p-6 dark:bg-slate-800/60"
        >
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            {result.years} <span className="text-base font-normal text-slate-500">years</span>{" "}
            {result.months} <span className="text-base font-normal text-slate-500">months</span>{" "}
            {result.days} <span className="text-base font-normal text-slate-500">days</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Total days lived</p>
              <p className="font-medium text-slate-900 dark:text-white">{result.totalDays.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Total weeks</p>
              <p className="font-medium text-slate-900 dark:text-white">{result.totalWeeks.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Next birthday in</p>
              <p className="font-medium text-slate-900 dark:text-white">{result.nextBirthdayInDays} days</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Copy className="h-4 w-4" /> Copy result
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
