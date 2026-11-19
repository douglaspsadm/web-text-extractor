import { test } from "node:test";
import assert from "node:assert/strict";
import { htmlToText } from "../src/extract.mjs";

test("remove scripts/estilos e preserva o texto", () => {
  const html = "<style>a{}</style><h1>Título</h1><p>Olá &amp; bem-vindo<br>linha&nbsp;2</p><script>x()</script>";
  assert.equal(htmlToText(html), "Título\n\nOlá & bem-vindo\nlinha 2");
});

test("decodifica entidades numéricas", () => {
  assert.equal(htmlToText("<p>&#233;&#x41;</p>"), "éA");
});
