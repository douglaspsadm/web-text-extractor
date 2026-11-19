# web-text-extractor

Extrai o texto na íntegra de páginas da internet (HTML → texto puro). Node.js, sem dependências.

## Uso

```bash
# Isola o conteúdo principal (<main>/<article>), preservando caixas expansíveis
node src/extract.mjs https://example.com > saida.txt

# Com relatório de auditoria no stderr (palavras, parágrafos e caixas expansíveis)
node src/extract.mjs --audit https://example.com > saida.txt

# Página inteira (inclui menus, barras laterais e rodapé)
node src/extract.mjs --full https://example.com > saida.txt
```

## Testes

```bash
npm test
```

## Limitações

Páginas cujo conteúdo só é carregado dinamicamente via JavaScript (SPA/lazy-load) não são suportadas nesta versão; ver `STATE.md`.
