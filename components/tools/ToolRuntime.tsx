"use client";

import { useEffect, useState } from "react";
import type { ToolConfig } from "@/types/tool";

interface Props {
  slug: string;
}

/**
 * ToolPageLayout (a Server Component) can't pass the full tool config to a
 * Client Component prop -- it contains a Zod schema instance and a compute
 * function, neither of which are serializable across the RSC boundary.
 *
 * Instead we pass only the slug (a plain string) down, and this client
 * component dynamically imports that one tool's config file itself. The
 * rich object is constructed entirely client-side, so it never needs to
 * cross the server/client boundary. This also means each tool page's
 * client bundle only ever loads the one tool it needs, not all 37 (or,
 * eventually, all 100,000).
 */
export function ToolRuntime({ slug }: Props) {
  const [tool, setTool] = useState<ToolConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    import(`@/config/tools/${slug}.config`).then((mod) => {
      if (cancelled) return;
      const toolConfig = Object.values(mod)[0] as ToolConfig;
      setTool(toolConfig);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!tool) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        Loading tool...
      </div>
    );
  }

  const Component = tool.component;
  return <Component tool={tool} />;
}
