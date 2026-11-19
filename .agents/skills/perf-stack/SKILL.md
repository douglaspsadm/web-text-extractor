---
name: perf-stack
description: >
  Stack de performance e economia de tokens em 5 frentes para o OpenClaude: Ponytail (código mínimo e respostas diretas),
  RTK (comandos comprimidos), Graphify (grafo AST de código), Context Mode (saídas gigantes isoladas)
  e Headroom (compressão de contexto/tráfego). Deve ser garantida e executada em toda tarefa de código.
---

# Performance Stack (5 Frentes)

## 1. Instalação e Inicialização Automática
Antes de iniciar tarefas de código em uma nova sessão ou VM, garanta que as ferramentas estão instaladas em `~/.local/bin`:

```bash
export PATH="$HOME/.local/bin:$PATH"
command -v rtk graphify context-mode headroom >/dev/null 2>&1 || bash scripts/setup-perf-tools.sh
```

## 2. Regras de Execução (5 Frentes)

1. **Ponytail (Respostas & Código Mínimo)**
   - Faça a menor mudança completa que resolve o problema, reutilizando padrões e utilitários existentes.
   - Zero abstrações prematuras, wrappers desnecessários ou dependências novas sem ganho real.
   - Nunca corte validação de borda, segurança ou testes da mudança.

2. **RTK (Comandos)**
   - Prefixe comandos barulhentos (`git status`, `git diff`, `git log`, `ls`, `grep`, testes) com `rtk` quando disponível no `PATH`.

3. **Graphify (Leitura de Código)**
   - Mantenha `graphify-out/graph.json` atualizado (`graphify extract .`) e consulte o grafo antes de fazer buscas amplas em múltiplos arquivos.

4. **Context Mode (Saídas Gigantes)**
   - Nunca despeje logs extensos, builds enormes ou arquivos inteiros no contexto; filtre com `tail`, `grep`, intervalos de linhas ou `context-mode`.

5. **Headroom (Tráfego & Contexto)**
   - Mantenha leituras de arquivos direcionadas (`StartLine`/`EndLine`) e use `headroom` ao operar proxies/sessões CLI compatíveis.
