"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { WordCounterInput, WordCounterOutput } from "@/config/tools/word-counter.config";
import { FieldLabel, TextArea, StatGrid } from "@/components/tools/shared/Fields";
import { SecondaryButton } from "@/components/tools/shared/Buttons";

export function WordCounter({ tool }: { tool: ToolConfig<WordCounterInput, WordCounterOutput> }) {
  const [text, setText] = useState("");
  const result: WordCounterOutput = tool.compute({ text });

  return (
    <div>
      <FieldLabel htmlFor="text">Your text</FieldLabel>
      <TextArea id="text" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text here..." />
      <div className="mt-3">
        <SecondaryButton onClick={() => setText("")}>Clear</SecondaryButton>
      </div>
      <StatGrid
        items={[
          { label: "Words", value: result.words.toLocaleString() },
          { label: "Characters", value: result.characters.toLocaleString() },
          { label: "Characters (no spaces)", value: result.charactersNoSpaces.toLocaleString() },
          { label: "Sentences", value: result.sentences.toLocaleString() },
          { label: "Paragraphs", value: result.paragraphs.toLocaleString() },
          { label: "Reading time", value: `${result.readingTimeMinutes} min` },
        ]}
      />
    </div>
  );
}
