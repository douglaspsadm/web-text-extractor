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

function findBalancedBlocks(html, openRegex, tagName) {
  const blocks = [];
  let match;
  openRegex.lastIndex = 0;
  while ((match = openRegex.exec(html))) {
    const tag = (tagName || match[1]).toLowerCase();
    const start = match.index;
    const tagRe = new RegExp(`<(\\/)?${tag}\\b[^>]*>`, "gi");
    tagRe.lastIndex = openRegex.lastIndex;
    let depth = 1;
    let m;
    while (depth > 0 && (m = tagRe.exec(html))) {
      if (m[1]) depth--;
      else if (!m[0].endsWith("/>")) depth++;
    }
    const end = depth === 0 ? tagRe.lastIndex : html.length;
    blocks.push({ start, end, html: html.slice(start, end) });
    openRegex.lastIndex = end;
  }
  return blocks;
}

function stripTagBlocks(html, tagNames) {
  let out = html;
  for (const tag of tagNames) {
    const blocks = findBalancedBlocks(out, new RegExp(`<${tag}\\b[^>]*>`, "gi"), tag);
    for (let i = blocks.length - 1; i >= 0; i--) {
      out = out.slice(0, blocks[i].start) + out.slice(blocks[i].end);
    }
  }
  return out;
}

export function isolateMainHtml(html) {
  let slice = html;
  let container = "full";
  for (const tag of ["main", "article", "body"]) {
    const blocks = findBalancedBlocks(html, new RegExp(`<${tag}\\b[^>]*>`, "gi"), tag);
    if (blocks.length > 0) {
      slice = blocks.map((b) => b.html).join("\n");
      container = tag;
      break;
    }
  }
  return { html: stripTagBlocks(slice, ["nav", "aside", "footer"]), container };
}

export function htmlToText(html, { mainOnly = false } = {}) {
  const source = mainOnly ? isolateMainHtml(html).html : html;
  const text = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|li|ul|ol|tr|table|h[1-6]|blockquote|pre)\s*>/gi, "\n\n")
    .replace(/<(li)\b[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(text)
    .replace(/[ \t\f\v\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/^- *$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const norm = (s) => s.replace(/\s+/g, " ").trim();
const countWords = (s) => (s ? s.trim().split(/\s+/).length : 0);

export function auditExtraction(rawHtml, extractedText, { mainOnly = true } = {}) {
  const { html: mainHtml, container } = isolateMainHtml(rawHtml);
  const scopeHtml = mainOnly ? mainHtml : rawHtml;
  const fullText = htmlToText(rawHtml, { mainOnly: false });
  const hay = norm(extractedText);

  const collapsibleBlocks = [
    ...findBalancedBlocks(scopeHtml, /<(details)\b[^>]*>/gi),
    ...findBalancedBlocks(scopeHtml, /<([a-z0-9]+)\b[^>]*\bclass="[^"]*\b(?:mw-collapsible|collapsible)\b[^"]*"[^>]*>/gi),
  ];
  let collapsibleTotal = 0;
  let collapsiblePreserved = 0;
  const missingCollapsibles = [];
  for (const b of collapsibleBlocks) {
    const t = norm(htmlToText(b.html, { mainOnly: false }));
    if (!t) continue;
    collapsibleTotal++;
    if (hay.includes(t)) collapsiblePreserved++;
    else missingCollapsibles.push(t.slice(0, 80));
  }

  const textBlocks = findBalancedBlocks(scopeHtml, /<(p|h[1-6])\b[^>]*>/gi);
  let paragraphsTotal = 0;
  let paragraphsPreserved = 0;
  for (const b of textBlocks) {
    const t = norm(htmlToText(b.html, { mainOnly: false }));
    if (!t) continue;
    paragraphsTotal++;
    if (hay.includes(t)) paragraphsPreserved++;
  }

  return {
    container: mainOnly ? container : "full",
    fullWords: countWords(fullText),
    extractedWords: countWords(extractedText),
    collapsibleTotal,
    collapsiblePreserved,
    missingCollapsibles,
    paragraphsTotal,
    paragraphsPreserved,
  };
}

export async function fetchHtml(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Apenas URLs http(s) são suportadas");
  const res = await fetch(u, { headers: { "user-agent": "web-text-extractor/0.1" }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao acessar ${url}`);
  return res.text();
}

export async function extractFromUrl(url, { mainOnly = true } = {}) {
  return htmlToText(await fetchHtml(url), { mainOnly });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const full = args.includes("--full");
  const audit = args.includes("--audit");
  const url = args.find((a) => !a.startsWith("--"));
  if (!url) {
    console.error("Uso: node src/extract.mjs [--full] [--audit] <url>");
    process.exit(1);
  }
  fetchHtml(url).then(
    (html) => {
      const mainOnly = !full;
      const text = htmlToText(html, { mainOnly });
      console.log(text);
      if (audit) {
        const r = auditExtraction(html, text, { mainOnly });
        console.error(
          `[audit] container=${r.container} palavras=${r.extractedWords}/${r.fullWords} ` +
            `paragrafos_e_titulos=${r.paragraphsPreserved}/${r.paragraphsTotal} ` +
            `caixas_expansiveis=${r.collapsiblePreserved}/${r.collapsibleTotal}`
        );
      }
    },
    (e) => {
      console.error(e.message);
      process.exit(1);
    }
  );
}
