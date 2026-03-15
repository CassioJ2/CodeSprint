# AGENTS.md

## Objetivo

Este repositorio usa o CodeSprint como camada de planejamento conectada ao projeto.

## Fonte de verdade

- O arquivo principal de planejamento e `tasks.md`
- A branch dedicada para tarefas e `tasks`
- A branch `tasks` deve conter apenas:
  - `tasks.md`
  - `AGENTS.md`
  - `TASKS_WORKFLOW.md`

## Regras para agentes de IA

1. Ler `tasks.md` antes de alterar ou propor trabalho relevante.
2. Atualizar tasks e subtasks de forma incremental.
3. Criar novas tasks no backlog quando surgir trabalho adicional.
4. Preservar metadados como `status`, `priority`, `labels`, `assignee`, `description` e `cardType`.
5. Evitar reescrever o arquivo inteiro sem necessidade.
6. Nao misturar arquivos de codigo com a branch `tasks`.

## Fluxo esperado

- backlog para planejamento
- board para execucao
- sync remoto pela branch `tasks`
- atualizacoes pequenas e frequentes no `tasks.md`
