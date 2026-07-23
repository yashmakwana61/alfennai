"use client";

import { useState } from "react";
import type { ToolConfig } from "@/types/tool";
import type { MarkdownPreviewInput, MarkdownPreviewOutput } from "@/config/tools/markdown-preview.config";
import { FieldLabel, TextArea } from "@/components/tools/shared/Fields";

export function MarkdownPreview({ tool }: { tool: ToolConfig<MarkdownPreviewInput, MarkdownPreviewOutput> }) {
  const [markdown, setMarkdown] = useState("# Hello AlfennAI\n\nThis is **bold** and *italic* text.");
  const result = tool.compute({ markdown });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div>
        <FieldLabel htmlFor="markdown">Markdown</FieldLabel>
        <TextArea id="markdown" rows={14} value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
      </div>
      <div>
        <FieldLabel htmlFor="preview">Preview</FieldLabel>
        <div
          id="preview"
          className="prose prose-slate min-h-[15rem] max-w-none rounded-lg border border-slate-300 bg-white px-4 py-3 dark:prose-invert dark:border-slate-700 dark:bg-slate-900"
          dangerouslySetInnerHTML={{ __html: result.html }}
        />
      </div>
    </div>
  );
}
