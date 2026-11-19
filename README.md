# web-text-extractor

Extrai o texto na íntegra de páginas da internet (HTML → texto puro). Node.js, sem dependências.

## Uso

```bash
node src/extract.mjs https://example.com > saida.txt
```

## Testes

```bash
npm test
```

## Limitações

Páginas renderizadas apenas via JavaScript (SPA) não são suportadas nesta versão; ver `STATE.md`.
