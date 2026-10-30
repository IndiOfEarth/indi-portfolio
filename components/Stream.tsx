import { Fragment, type ReactNode } from "react";

/**
 * A paragraph that "streams" in as you scroll. Each word is its own span so the
 * scroll engine can reveal them one by one without changing layout.
 * Supports **bold**, *italic* and [links](https://...).
 */
type Seg = { text: string; kind: "plain" | "b" | "i" | "a"; href?: string };

function parse(src: string): Seg[] {
  const out: Seg[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index), kind: "plain" });
    const t = m[0];
    if (t.startsWith("**")) out.push({ text: t.slice(2, -2), kind: "b" });
    else if (t.startsWith("*")) out.push({ text: t.slice(1, -1), kind: "i" });
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      out.push({ text: label, kind: "a", href });
    }
    last = m.index + t.length;
  }
  if (last < src.length) out.push({ text: src.slice(last), kind: "plain" });
  return out;
}

function words(text: string, key: string): ReactNode[] {
  // Keep spaces as plain text nodes so the caret can sit right after a word.
  const parts = text.split(/(\s+)/);
  return parts.map((p, i) =>
    /^\s+$/.test(p) || p === "" ? (
      <Fragment key={`${key}-${i}`}>{p}</Fragment>
    ) : (
      <span className="w" key={`${key}-${i}`}>
        {p}
      </span>
    ),
  );
}

export default function Stream({ children, delay }: { children: string; delay?: number }) {
  const segs = parse(children);
  return (
    <p className="s" data-stream="" data-delay={delay ?? 0}>
      {segs.map((s, i) => {
        const inner = words(s.text, String(i));
        if (s.kind === "b") return <strong key={i}>{inner}</strong>;
        if (s.kind === "i") return <em key={i}>{inner}</em>;
        if (s.kind === "a") return <a key={i} href={s.href}>{inner}</a>;
        return <Fragment key={i}>{inner}</Fragment>;
      })}
    </p>
  );
}

export function Block({ children }: { children: ReactNode }) {
  return (
    <div className="blk" data-reveal="">
      {children}
    </div>
  );
}
