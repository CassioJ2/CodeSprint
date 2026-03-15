import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'

export function getTasksPath(localPath) {
    return join(localPath, 'tasks.md')
}

export function getAgentsPath(localPath) {
    return join(localPath, 'AGENTS.md')
}

export function getTasksWorkflowPath(localPath) {
    return join(localPath, 'TASKS_WORKFLOW.md')
}

export function getRepoContextFilePath(localPath, fileName) {
    return join(localPath, fileName)
}

async function readGitConfig(localPath) {
    const gitEntryPath = join(localPath, '.git')
    const gitEntryStats = await stat(gitEntryPath)

    if (gitEntryStats.isDirectory()) {
        return readFile(join(gitEntryPath, 'config'), 'utf-8')
    }

    const gitEntry = await readFile(gitEntryPath, 'utf-8')
    const gitDirMatch = gitEntry.match(/^gitdir:\s*(.+)$/im)

    if (gitDirMatch) {
        const gitDir = gitDirMatch[1].trim()
        const resolvedGitDir = isAbsolute(gitDir)
            ? gitDir
            : resolve(dirname(gitEntryPath), gitDir)

        return readFile(join(resolvedGitDir, 'config'), 'utf-8')
    }

    return readFile(join(gitEntryPath, 'config'), 'utf-8')
}

function extractGithubRepo(remoteUrl) {
    const match = remoteUrl.match(/github\.com[:/](?<owner>[^/\s]+)\/(?<repo>[^/\s]+?)(?:\.git)?$/i)

    if (!match?.groups) {
        return null
    }

    return {
        owner: match.groups.owner,
        repo: match.groups.repo
    }
}

export async function validateLocalRepoPath(localPath, owner, repo) {
    if (!localPath) {
        return {
            valid: false,
            reason: 'missing_path',
            remoteUrl: null,
            detectedRepo: null
        }
    }

    try {
        const config = await readGitConfig(localPath)
        const remoteMatch = config.match(/\[remote\s+"origin"\][\s\S]*?url\s*=\s*(.+)/i)
        const remoteUrl = remoteMatch?.[1]?.trim() || null

        if (!remoteUrl) {
            return {
                valid: false,
                reason: 'missing_origin',
                remoteUrl: null,
                detectedRepo: null
            }
        }

        const detectedRepo = extractGithubRepo(remoteUrl)

        if (!detectedRepo) {
            return {
                valid: false,
                reason: 'unsupported_remote',
                remoteUrl,
                detectedRepo: null
            }
        }

        const isValid =
            detectedRepo.owner.toLowerCase() === owner.toLowerCase() &&
            detectedRepo.repo.toLowerCase() === repo.toLowerCase()

        return {
            valid: isValid,
            reason: isValid ? null : 'repo_mismatch',
            remoteUrl,
            detectedRepo
        }
    } catch (error) {
        if (error?.code === 'ENOENT') {
            return {
                valid: false,
                reason: 'missing_git',
                remoteUrl: null,
                detectedRepo: null
            }
        }

        throw error
    }
}

export async function readRepoTasksMarkdown(localPath) {
    if (!localPath) {
        return null
    }

    try {
        return await readFile(getTasksPath(localPath), 'utf-8')
    } catch (error) {
        if (error?.code === 'ENOENT') {
            return null
        }

        throw error
    }
}

export async function writeRepoTasksMarkdown(localPath, markdown) {
    if (!localPath) {
        return
    }

    await mkdir(localPath, { recursive: true })
    await writeFile(getTasksPath(localPath), markdown, 'utf-8')
}

export async function readRepoContextFile(localPath, fileName) {
    if (!localPath) {
        return null
    }

    try {
        return await readFile(getRepoContextFilePath(localPath, fileName), 'utf-8')
    } catch (error) {
        if (error?.code === 'ENOENT') {
            return null
        }

        throw error
    }
}

export async function writeRepoContextFile(localPath, fileName, content) {
    if (!localPath) {
        return
    }

    await mkdir(localPath, { recursive: true })
    await writeFile(getRepoContextFilePath(localPath, fileName), content, 'utf-8')
}

async function fileExists(path) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

function createAgentsMarkdown({ owner, repo, tasksBranch = 'tasks' }) {
    return `# AGENTS.md

## Objetivo

Este repositorio usa o CodeSprint como camada de planejamento conectada ao projeto.

## Fonte de verdade

- O arquivo principal de planejamento e \`tasks.md\`
- A branch dedicada para tarefas e \`${tasksBranch}\`
- Alteracoes de planejamento devem manter consistencia entre backlog, board e subtarefas

## Regras para agentes de IA

1. Sempre ler \`tasks.md\` antes de propor ou implementar mudancas relevantes.
2. Ao concluir uma entrega, atualizar a task ou subtask correspondente.
3. Se surgir trabalho novo, adicionar uma task no backlog em vez de apagar contexto existente.
4. Preservar metadados como \`status\`, \`priority\`, \`labels\`, \`assignee\`, \`description\` e \`cardType\`.
5. Manter descricoes curtas, objetivas e acionaveis.
6. Evitar reescrever toda a estrutura do arquivo quando apenas uma parte precisar mudar.
7. Tratar \`${owner}/${repo}\` como o repositorio ativo deste fluxo.

## Fluxo esperado

- backlog para organizacao e planejamento
- board para execucao
- sync remoto pela branch \`${tasksBranch}\`
- atualizacoes pequenas e frequentes no \`tasks.md\`
`
}

function createTasksWorkflowMarkdown({ owner, repo, tasksBranch = 'tasks' }) {
    return `# TASKS_WORKFLOW.md

## Visao geral

Este repositorio usa um fluxo local-first com sincronizacao para a branch \`${tasksBranch}\`.

## Arquivos importantes

- \`tasks.md\`: backlog e board
- \`AGENTS.md\`: regras operacionais para IA

## Convencoes

- novas tarefas entram como \`status: "backlog"\`
- tarefas em execucao devem migrar para o board
- subtarefas representam passos menores e verificaveis
- responsaveis devem refletir quem executa de fato a entrega

## Como a IA deve atuar

1. Ler o estado atual das tasks.
2. Atualizar apenas o necessario.
3. Marcar progresso de forma incremental.
4. Criar subtarefas quando a entrega ainda estiver grande demais.
5. Nao remover contexto util sem justificativa clara.

## Repositorio alvo

- owner: \`${owner}\`
- repo: \`${repo}\`
- branch de tarefas: \`${tasksBranch}\`
`
}

export async function ensureRepoAiContextFiles(localPath, repoInfo) {
    if (!localPath) {
        return { created: [] }
    }

    await mkdir(localPath, { recursive: true })

    const created = []
    const agentsPath = getAgentsPath(localPath)
    const workflowPath = getTasksWorkflowPath(localPath)

    if (!(await fileExists(agentsPath))) {
        await writeFile(agentsPath, createAgentsMarkdown(repoInfo), 'utf-8')
        created.push('AGENTS.md')
    }

    if (!(await fileExists(workflowPath))) {
        await writeFile(workflowPath, createTasksWorkflowMarkdown(repoInfo), 'utf-8')
        created.push('TASKS_WORKFLOW.md')
    }

    return { created }
}

export async function readRepoAiContextFiles(localPath) {
    return {
        'AGENTS.md': await readRepoContextFile(localPath, 'AGENTS.md'),
        'TASKS_WORKFLOW.md': await readRepoContextFile(localPath, 'TASKS_WORKFLOW.md')
    }
}
