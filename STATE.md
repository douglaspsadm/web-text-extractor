# STATE

## Arquitetura
CLI Node.js (ESM, zero dependências): `fetch` da URL → `htmlToText` (remove script/style, preserva quebras de bloco, decodifica entidades).

## Implementado
- `src/extract.mjs`: `extractFromUrl`, `htmlToText`, `decodeEntities` e CLI.
- `test/extract.test.mjs`: testes unitários (`npm test`).

## Próximos passos
- Isolar conteúdo principal (article/main) como opção.
- Suporte a páginas com JS (navegador headless), PDF e saída Markdown.
- Respeitar robots.txt / opções de user-agent.
