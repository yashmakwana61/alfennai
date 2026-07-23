"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { CaseConverterInput, CaseConverterOutput } from "@/config/tools/case-converter.config";
import { FieldLabel, TextArea, Select, ErrorText } from "@/components/tools/shared/Fields";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function CaseConverter({ tool }: { tool: ToolConfig<CaseConverterInput, CaseConverterOutput> }) {
  const [text, setText] = useState("");
  const [targetCase, setTargetCase] = useState<CaseConverterInput["targetCase"]>("title");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run() {
    const parsed = tool.inputSchema.safeParse({ text, targetCase });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setOutput("");
      return;
    }
    setError(null);
    setOutput(tool.compute(parsed.data).converted);
  }

  return (
    <div>
      <div className="mb-4">
        <FieldLabel htmlFor="targetCase">Convert to</FieldLabel>
        <Select id="targetCase" value={targetCase} onChange={(e) => setTargetCase(e.target.value as CaseConverterInput["targetCase"])}>
          <option value="upper">UPPERCASE</option>
          <option value="lower">lowercase</option>
          <option value="title">Title Case</option>
          <option value="sentence">Sentence case</option>
          <option value="camel">camelCase</option>
          <option value="snake">snake_case</option>
          <option value="kebab">kebab-case</option>
        </Select>
      </div>
      <FieldLabel htmlFor="text">Text</FieldLabel>
      <TextArea id="text" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Hello AlfennAI World" />
      <ErrorText>{error}</ErrorText>
      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton onClick={run}>Convert</PrimaryButton>
        <SecondaryButton onClick={() => { setText(""); setOutput(""); setError(null); }}>Reset</SecondaryButton>
      </div>
      {output && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Result</FieldLabel>
          <TextArea id="out" rows={4} readOnly value={output} />
          <LinkButton onClick={() => navigator.clipboard.writeText(output)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
