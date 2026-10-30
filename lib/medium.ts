// Reads Indi's public Medium RSS feed on the server and turns each story into
// the small set of fields the essay cards need. No dependencies.

export type Post = {
  title: string;
  subtitle: string;
  url: string;
  date: string;      // ISO date
  minutes: number;   // estimated reading time
  cover: string | null;
  opening: string;   // first real paragraph, plain text
};

export const MEDIUM_FEED = "https://medium.com/feed/@indi.caburian";

// Shown if the feed can't be reached (and in the offline preview).
export const FALLBACK_POSTS: Post[] = [
  {
    title: "The Cost of “Always Available” Systems — Amazon and Dynamo",
    subtitle: "What a highly available database asks of the people using it, and why the answer changes when the operation is a payment.",
    url: "https://medium.com/@indi.caburian/the-cost-of-always-available-systems-amazon-and-dynamo-602494e5fb5f",
    date: "2026-10-11",
    minutes: 17,
    cover: null,
    opening: "",
  },
];

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function unwrap(s: string | undefined): string {
  if (!s) return "";
  const m = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(s);
  return m ? m[1] : decode(s);
}

function tag(xml: string, name: string): string | undefined {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
  return re.exec(xml)?.[1];
}

const text = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

export function parseMediumFeed(xml: string): Post[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  return items.map((item) => {
    const title = text(unwrap(tag(item, "title")));
    const rawLink = unwrap(tag(item, "link")).trim();
    const url = rawLink.split("?")[0];
    const pub = unwrap(tag(item, "pubDate")).trim();
    const html = unwrap(tag(item, "content:encoded")) || unwrap(tag(item, "description"));

    const cover = /<img[^>]+src="([^"]+)"/i.exec(html)?.[1] ?? null;
    const subtitle = text(/<h4[^>]*>([\s\S]*?)<\/h4>/i.exec(html)?.[1] ?? "");
    const paras = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map((m) => text(m[1]));
    const opening = paras.find((p) => p.split(" ").length >= 12) ?? "";
    const words = text(html).split(" ").filter(Boolean).length;
    const images = (html.match(/<img/gi) ?? []).length;
    const minutes = Math.max(1, Math.round(words / 265 + images * (12 / 60)));
    const date = pub ? new Date(pub).toISOString().slice(0, 10) : "";
    return { title, subtitle, url, date, minutes, cover, opening };
  }).filter((p) => p.title && p.url);
}

export async function getMediumPosts(): Promise<Post[]> {
  try {
    const res = await fetch(MEDIUM_FEED, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; indicaburian.com portfolio)", Accept: "application/rss+xml, application/xml" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_POSTS;
    const posts = parseMediumFeed(await res.text());
    return posts.length ? posts : FALLBACK_POSTS;
  } catch {
    return FALLBACK_POSTS;
  }
}
