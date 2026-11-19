# AGENTS.md

## Mandatory Performance Stack (`perf-stack`)

Em toda tarefa de código, análise ou manutenção:

1. **Ferramentas**: verifique `rtk`, `graphify`, `context-mode`, `headroom` em `$HOME/.local/bin`; se faltarem, rode `bash scripts/setup-perf-tools.sh`.
2. **Ponytail**: menor mudança completa, reutilize código existente, sem over-engineering; mantenha validações, segurança e testes.
3. **RTK**: prefixe comandos ruidosos (`git status`, `git diff`, `ls`, testes) com `rtk`.
4. **Graphify**: mantenha `graphify-out/graph.json` atualizado (`graphify extract .`) e consulte antes de buscas amplas.
5. **Context Mode & Headroom**: nunca despeje saídas gigantes; leia só os trechos necessários.

## Convenções

- Node.js ESM, sem dependências salvo benefício claro. Testes: `npm test`.
- Atualize `STATE.md` a cada mudança e sempre faça commit + push antes de encerrar.
