import type { ReactNode } from "react";
import { isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { CopyCode } from "@/components/copy-code";

const highlightSubset = [
  "sql",
  "python",
  "javascript",
  "typescript",
  "bash",
  "sh",
  "json",
  "java",
  "cpp",
  "css",
  "xml",
];

function textOf(nodes: ReactNode): string {
  if (Array.isArray(nodes)) return nodes.map(textOf).join("");
  if (isValidElement(nodes)) {
    const props = nodes.props as { children?: ReactNode };
    return textOf(props.children);
  }
  return String(nodes ?? "");
}

function CodeBlock({ lang, children }: { lang?: string; children?: ReactNode }) {
  return (
    <div className="code-block">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-1.5">
        <span className="font-mono text-xs text-[var(--fg-soft)]">{lang ?? "code"}</span>
        <CopyCode code={textOf(children)} />
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Code({ children, className }: { children?: ReactNode; className?: string }) {
  return <code className={className}>{children}</code>;
}

function Pre({ children }: { children?: ReactNode }) {
  // Output rehype-highlight: <pre class="hljs"><code class="language-x">.
  // Blok kode dirender sebagai <CodeBlock> (header bahasa + tombol salin).
  const first = Array.isArray(children) ? children[0] : children;
  const firstProps = isValidElement(first)
    ? (first.props as { className?: string; children?: ReactNode })
    : undefined;
  const lang = /language-(\w+)/.exec(String(firstProps?.className ?? ""))?.[1];
  if (lang) {
    return <CodeBlock lang={lang}>{firstProps?.children}</CodeBlock>;
  }
  return <pre>{children}</pre>;
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { subset: highlightSubset }]]}
        components={{ pre: Pre, code: Code }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}