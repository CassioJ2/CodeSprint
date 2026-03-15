# TASKS_WORKFLOW.md

## Visao geral

Este projeto usa um fluxo local-first para tarefas, sincronizado com a branch `tasks`.

## Arquivos sincronizados na branch tasks

- `tasks.md`
- `AGENTS.md`
- `TASKS_WORKFLOW.md`

## Convencoes

- novas tarefas entram como `status: "backlog"`
- tarefas em execucao devem ir para o board
- subtarefas representam passos menores e verificaveis
- responsaveis devem refletir quem esta executando de fato

## Como agentes de IA devem atuar

1. Ler o estado atual das tasks.
2. Atualizar apenas o necessario.
3. Marcar progresso de forma incremental.
4. Criar subtarefas quando uma entrega ainda estiver grande demais.
5. Nao remover contexto util sem justificativa.

## Fluxo de sync

1. O app trabalha localmente primeiro.
2. `Sync` envia os arquivos gerenciados para a branch `tasks`.
3. `Puxar remoto` busca o estado mais recente da branch `tasks`.
4. Em caso de concorrencia, o usuario pode manter local, carregar remoto ou mesclar.
