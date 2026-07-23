"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { TextCleanerInput, TextCleanerOutput } from "@/config/tools/text-cleaner.config";
import { FieldLabel, TextArea } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function TextCleaner({ tool }: { tool: ToolConfig<TextCleanerInput, TextCleanerOutput> }) {
  const [text, setText] = useState("");
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [stripPunctuation, setStripPunctuation] = useState(false);
  const [output, setOutput] = useState("");

  function run() {
    const parsed = tool.inputSchema.safeParse({ text, trimLines, collapseSpaces, removeEmptyLines, stripPunctuation });
    if (!parsed.success) return;
    setOutput(tool.compute(parsed.data).cleaned);
  }

  const options: { label: string; value: boolean; set: (v: boolean) => void }[] = [
    { label: "Trim each line", value: trimLines, set: setTrimLines },
    { label: "Collapse extra spaces", value: collapseSpaces, set: setCollapseSpaces },
    { label: "Remove empty lines", value: removeEmptyLines, set: setRemoveEmptyLines },
    { label: "Strip punctuation", value: stripPunctuation, set: setStripPunctuation },
  ];

  return (
    <div>
      <FieldLabel htmlFor="text">Text to clean</FieldLabel>
      <TextArea id="text" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={opt.value} onChange={(e) => opt.set(e.target.checked)} className="h-4 w-4 rounded accent-primary" />
            {opt.label}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Clean text</PrimaryButton>
        <SecondaryButton onClick={() => { setText(""); setOutput(""); }}>Reset</SecondaryButton>
      </div>
      {output && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Cleaned text</FieldLabel>
          <TextArea id="out" rows={8} readOnly value={output} />
          <LinkButton onClick={() => navigator.clipboard.writeText(output)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
