"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { LoremIpsumInput, LoremIpsumOutput } from "@/config/tools/lorem-ipsum.config";
import { FieldLabel, TextInput, TextArea } from "@/components/tools/shared/Fields";
import { PrimaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function LoremIpsumGenerator({ tool }: { tool: ToolConfig<LoremIpsumInput, LoremIpsumOutput> }) {
  const [paragraphs, setParagraphs] = useState("3");
  const [wordsPerParagraph, setWordsPerParagraph] = useState("40");
  const [output, setOutput] = useState("");

  function generate() {
    const parsed = tool.inputSchema.safeParse({ paragraphs: Number(paragraphs), wordsPerParagraph: Number(wordsPerParagraph) });
    if (!parsed.success) return;
    setOutput(tool.compute(parsed.data).text);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="paragraphs">Paragraphs</FieldLabel>
          <TextInput id="paragraphs" type="number" min={1} max={20} value={paragraphs} onChange={(e) => setParagraphs(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="wordsPerParagraph">Words per paragraph</FieldLabel>
          <TextInput id="wordsPerParagraph" type="number" min={5} max={200} value={wordsPerParagraph} onChange={(e) => setWordsPerParagraph(e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <PrimaryButton onClick={generate}>
          <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-4 w-4" /> Generate text</span>
        </PrimaryButton>
      </div>
      {output && (
        <div className="mt-5">
          <FieldLabel htmlFor="out">Generated text</FieldLabel>
          <TextArea id="out" rows={10} readOnly value={output} />
          <LinkButton onClick={() => navigator.clipboard.writeText(output)} className="mt-2">
            <Copy className="h-4 w-4" /> Copy
          </LinkButton>
        </div>
      )}
    </div>
  );
}
