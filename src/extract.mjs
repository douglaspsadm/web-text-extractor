#!/usr/bin/env node
// Extrai o texto na íntegra de uma página web (HTML -> texto), sem dependências.

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const cp = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(cp); } catch { return m; }
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

export function htmlToText(html) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|li|ul|ol|tr|table|h[1-6]|blockquote|pre)\s*>/gi, "\n\n")
    .replace(/<(li)\b[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(text)
    .replace(/[ \t\f\v\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractFromUrl(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Apenas URLs http(s) são suportadas");
  const res = await fetch(u, { headers: { "user-agent": "web-text-extractor/0.1" }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao acessar ${url}`);
  return htmlToText(await res.text());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2];
  if (!url) {
    console.error("Uso: node src/extract.mjs <url>");
    process.exit(1);
  }
  extractFromUrl(url).then((t) => console.log(t), (e) => { console.error(e.message); process.exit(1); });
}
