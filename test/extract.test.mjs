import { test } from "node:test";
import assert from "node:assert/strict";
import { htmlToText, auditExtraction } from "../src/extract.mjs";

test("remove scripts/estilos e preserva o texto", () => {
  const html = "<style>a{}</style><h1>Título</h1><p>Olá &amp; bem-vindo<br>linha&nbsp;2</p><script>x()</script>";
  assert.equal(htmlToText(html), "Título\n\nOlá & bem-vindo\nlinha 2");
});

test("decodifica entidades numéricas", () => {
  assert.equal(htmlToText("<p>&#233;&#x41;</p>"), "éA");
});

test("isola <main>, remove <nav>/<aside>/<footer> e limpa <li> vazios", () => {
  const html = `
    <header><nav>Menu topo</nav></header>
    <main>
      <h1>Artigo</h1>
      <nav>Abas internas</nav>
      <ul><li><svg></svg></li><li>Item real</li></ul>
      <p>Corpo principal.</p>
      <aside>Relacionados</aside>
    </main>
    <footer>Rodapé</footer>
  `;
  const text = htmlToText(html, { mainOnly: true });
  assert.equal(text, "Artigo\n\n- Item real\n\nCorpo principal.");
});

test("preserva caixas expansíveis (details e mw-collapsible) e valida no audit", () => {
  const html = `
    <nav>Menu</nav>
    <main>
      <h1>Página</h1>
      <p>Introdução.</p>
      <details><summary>Ver mais</summary><p>Conteúdo oculto 1.</p></details>
      <table class="mw-collapsible mw-collapsed"><tr><td>Exemplo expandido 2.</td></tr></table>
    </main>
  `;
  const text = htmlToText(html, { mainOnly: true });
  assert.match(text, /Conteúdo oculto 1\./);
  assert.match(text, /Exemplo expandido 2\./);
  const report = auditExtraction(html, text, { mainOnly: true });
  assert.equal(report.container, "main");
  assert.equal(report.collapsibleTotal, 2);
  assert.equal(report.collapsiblePreserved, 2);
  assert.equal(report.paragraphsPreserved, report.paragraphsTotal);
});
