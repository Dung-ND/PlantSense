import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Tiny, safe Markdown renderer for chat replies: paragraphs, bullet/numbered
 * lists, **bold** and [links](/path). No raw HTML is ever injected.
 */
export function Markdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={blocks.length} className={`my-1.5 space-y-1 pl-5 ${list.ordered ? "list-decimal" : "list-disc"}`}>
        {list.items.map((item, i) => (
          <li key={i}>{inline(item, onNavigate)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flush();
    if (line.trim() === "") continue;
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    blocks.push(
      <p key={blocks.length} className={`my-1.5 first:mt-0 last:mb-0 ${heading ? "font-semibold" : ""}`}>
        {inline(heading ? heading[1] : line, onNavigate)}
      </p>,
    );
  }
  flush();
  return <>{blocks}</>;
}

function inline(text: string, onNavigate?: () => void): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) {
      const href = match[2];
      const cls = "font-medium text-leaf-700 underline decoration-leaf-300 underline-offset-2 hover:decoration-leaf-700";
      if (href.startsWith("/") && !href.startsWith("//")) {
        parts.push(
          <Link key={match.index} href={href} className={cls} onClick={onNavigate}>
            {match[1]}
          </Link>,
        );
      } else if (/^(https?:|mailto:|tel:)/.test(href)) {
        parts.push(
          <a key={match.index} href={href} className={cls} target="_blank" rel="noopener noreferrer nofollow">
            {match[1]}
          </a>,
        );
      } else {
        parts.push(match[1]);
      }
    } else {
      parts.push(<strong key={match.index}>{match[3]}</strong>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}
