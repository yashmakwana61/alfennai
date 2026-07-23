import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { MarkdownPreview } from "@/components/tools/MarkdownPreview";

const schema = z.object({ markdown: z.string() });
export type MarkdownPreviewInput = z.infer<typeof schema>;
export interface MarkdownPreviewOutput { html: string }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function compute(input: MarkdownPreviewInput): MarkdownPreviewOutput {
  const escaped = escapeHtml(input.markdown);
  let html = escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`)
    .split(/\n{2,}/)
    .map((block) => (/^<(h1|h2|h3|ul|li)/.test(block) ? block : `<p>${block.replace(/\n/g, "<br/>")}</p>`))
    .join("\n");
  return { html };
}

export const markdownPreviewTool: ToolConfig<MarkdownPreviewInput, MarkdownPreviewOutput> = {
  id: "markdown-preview",
  slug: "markdown-preview",
  title: "Markdown Preview",
  shortDescription: "Preview rendered HTML from Markdown in real time.",
  longDescription:
    "The Markdown Preview tool renders headings, bold, italic, inline code, links and lists from Markdown into safely-escaped HTML, so you can preview formatting before publishing to a blog, README or documentation site.",
  category: "text-tools",
  icon: "FileText",
  seo: {
    metaTitle: "Markdown Preview - Live Markdown Renderer Free",
    metaDescription: "Free Markdown preview tool. Render Markdown to HTML in real time, safely, in your browser.",
    keywords: ["markdown preview", "markdown renderer", "markdown to html"],
  },
  inputSchema: schema,
  compute,
  component: MarkdownPreview,
  faq: [{ question: "Which Markdown features are supported?", answer: "Headings (# ## ###), bold, italic, inline code, links and simple bullet lists. Tables, nested lists and code blocks aren't supported yet." }],
  relatedToolSlugs: ["html-formatter", "word-counter"],
  exampleInput: { markdown: "# Hello AlfennAI\n\nThis is **bold** and *italic* text with a [link](https://alfennai.com)." },
};
