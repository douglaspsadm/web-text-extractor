# STATE

## Arquitetura
CLI Node.js (ESM, zero dependências): `fetchHtml` → `isolateMainHtml` (`<main>`/`<article>`/`<body>` sem `<nav>`/`<aside>`/`<footer>`) → `htmlToText` (remove script/style/svg, limpa `<li>` vazios, preserva quebras e caixas expansíveis) + `auditExtraction`.

## Implementado
- `src/extract.mjs`: `fetchHtml`, `extractFromUrl`, `isolateMainHtml`, `htmlToText`, `decodeEntities`, `auditExtraction` e CLI (`--full`, `--audit`).
- `test/extract.test.mjs`: 4 testes unitários (`npm test`).
- Validado em página real da Wikipédia (`744/744` parágrafos/títulos e `83/83` caixas `mw-collapsible` preservadas).

## Próximos passos
- Suporte a páginas renderizadas via JS (navegador headless), PDF e saída Markdown.
- Respeitar robots.txt / opções de user-agent.
