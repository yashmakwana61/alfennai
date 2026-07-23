"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { CharacterCounterInput, CharacterCounterOutput } from "@/config/tools/character-counter.config";
import { FieldLabel, TextArea, TextInput, StatGrid } from "@/components/tools/shared/Fields";
import { SecondaryButton } from "@/components/tools/shared/Buttons";

export function CharacterCounter({ tool }: { tool: ToolConfig<CharacterCounterInput, CharacterCounterOutput> }) {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("280");
  const result: CharacterCounterOutput = tool.compute({ text, limit: limit ? Number(limit) : undefined });

  return (
    <div>
      <div className="mb-3 flex items-end gap-3">
        <div>
          <FieldLabel htmlFor="limit">Character limit (optional)</FieldLabel>
          <TextInput id="limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="w-32" />
        </div>
      </div>
      <FieldLabel htmlFor="text">Your text</FieldLabel>
      <TextArea id="text" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3">
        <SecondaryButton onClick={() => setText("")}>Clear</SecondaryButton>
      </div>
      <StatGrid
        items={[
          { label: "Total characters", value: result.total.toLocaleString() },
          { label: "No spaces", value: result.noSpaces.toLocaleString() },
          { label: "Letters", value: result.letters.toLocaleString() },
          { label: "Digits", value: result.digits.toLocaleString() },
          ...(result.remaining !== undefined ? [{ label: "Remaining", value: result.remaining.toLocaleString() }] : []),
        ]}
      />
    </div>
  );
}
