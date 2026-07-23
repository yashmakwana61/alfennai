"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import type { ToolConfig } from "@/types/tool";
import type { UuidGeneratorInput, UuidGeneratorOutput } from "@/config/tools/uuid-generator.config";
import { FieldLabel, TextInput } from "@/components/tools/shared/Fields";
import { PrimaryButton, LinkButton } from "@/components/tools/shared/Buttons";

export function UuidGenerator({ tool }: { tool: ToolConfig<UuidGeneratorInput, UuidGeneratorOutput> }) {
  const [count, setCount] = useState("5");
  const [uuids, setUuids] = useState<string[]>([]);

  function generate() {
    const parsed = tool.inputSchema.safeParse({ count: Number(count) });
    if (!parsed.success) return;
    setUuids(tool.compute(parsed.data).uuids);
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <div>
          <FieldLabel htmlFor="count">How many?</FieldLabel>
          <TextInput id="count" type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} className="w-28" />
        </div>
        <PrimaryButton onClick={generate}>
          <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-4 w-4" /> Generate</span>
        </PrimaryButton>
      </div>
      {uuids.length > 0 && (
        <div className="mt-5 space-y-2">
          {uuids.map((u) => (
            <div key={u} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm dark:bg-slate-800/60">
              <span>{u}</span>
              <LinkButton onClick={() => navigator.clipboard.writeText(u)}><Copy className="h-4 w-4" /></LinkButton>
            </div>
          ))}
          <LinkButton onClick={() => navigator.clipboard.writeText(uuids.join("\n"))}>
            <Copy className="h-4 w-4" /> Copy all
          </LinkButton>
        </div>
      )}
    </div>
  );
}
