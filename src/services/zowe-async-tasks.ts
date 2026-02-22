import { ZoweResult, executeZowe } from '@gestell/mcp/services/zowe-executor'
import { randomUUID } from 'crypto'

type TaskStatus = 'running' | 'completed'

interface InternalTask {
  id: string
  command: string
  args: string[]
  status: TaskStatus
  startedAt: string
  completedAt?: string
  result?: ZoweResult
  promise: Promise<void>
}

export interface ZoweAsyncTask {
  id: string
  command: string
  args: string[]
  status: TaskStatus
  startedAt: string
  completedAt?: string
  result?: ZoweResult
}

export interface ManagedExecutionPending {
  pending: true
  taskId: string
}

export interface ManagedExecutionCompleted {
  pending: false
  taskId: string
  result: ZoweResult
}

export type ManagedExecution = ManagedExecutionPending | ManagedExecutionCompleted

const tasks = new Map<string, InternalTask>()
const DEFAULT_INLINE_WAIT_MS = 10_000
const DEFAULT_WAIT_TOOL_MAX_WAIT_MS = 300_000
const DEFAULT_WAIT_TOOL_POLL_INTERVAL_MS = 2_000
const DEFAULT_TASK_TTL_MS = 60 * 60 * 1000
const DEFAULT_MAX_TASKS = 300

export async function executeZoweManaged(command: string, args: string[] = []): Promise<ManagedExecution> {
  cleanupTasks()
  const task = startTask(command, args)
  const waitMs = getPositiveInt(process.env.ZOWE_MCP_INLINE_WAIT_MS, DEFAULT_INLINE_WAIT_MS)
  const completed = await waitForTask(task.id, waitMs)

  if (!completed) {
    return {
      pending: true,
      taskId: task.id
    }
  }

  return {
    pending: false,
    taskId: task.id,
    result: task.result || {
      success: false,
      stdout: '',
      stderr: 'Async task finished without result payload.',
      exitCode: 1
    }
  }
}

export function getAsyncTask(taskId: string): ZoweAsyncTask | undefined {
  cleanupTasks()
  const task = tasks.get(taskId)
  if (!task) return undefined
  return toPublicTask(task)
}

export function listAsyncTasks(status?: TaskStatus): ZoweAsyncTask[] {
  cleanupTasks()
  const all = Array.from(tasks.values())
    .filter((task) => !status || task.status === status)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all.map(toPublicTask)
}

export function formatPendingTaskMessage(toolName: string, taskId: string): string {
  return [
    `Command queued for async completion from \`${toolName}\`.`,
    `task_id: ${taskId}`,
    'Use `zowe_wait_async_task` (recommended) or `zowe_get_async_task` to poll for completion.'
  ].join('\n')
}

export interface WaitOnTaskResult {
  found: boolean
  timedOut: boolean
  task?: ZoweAsyncTask
}

export async function waitOnAsyncTask(taskId: string, maxWaitMs?: number, pollIntervalMs?: number): Promise<WaitOnTaskResult> {
  cleanupTasks()
  const task = tasks.get(taskId)
  if (!task) {
    return { found: false, timedOut: false }
  }

  if (isCompleted(task)) {
    return { found: true, timedOut: false, task: toPublicTask(task) }
  }

  const resolvedMaxWait = normalizePositiveInt(
    maxWaitMs,
    getPositiveInt(process.env.ZOWE_MCP_WAIT_TOOL_MAX_WAIT_MS, DEFAULT_WAIT_TOOL_MAX_WAIT_MS)
  )
  const resolvedPoll = normalizePositiveInt(
    pollIntervalMs,
    getPositiveInt(process.env.ZOWE_MCP_WAIT_TOOL_POLL_INTERVAL_MS, DEFAULT_WAIT_TOOL_POLL_INTERVAL_MS)
  )

  const started = Date.now()
  while (Date.now() - started < resolvedMaxWait) {
    const remaining = resolvedMaxWait - (Date.now() - started)
    await Promise.race([
      task.promise,
      delay(Math.min(resolvedPoll, remaining))
    ])

    if (isCompleted(task)) {
      return { found: true, timedOut: false, task: toPublicTask(task) }
    }
  }

  return { found: true, timedOut: true, task: toPublicTask(task) }
}

function startTask(command: string, args: string[]): InternalTask {
  const id = randomUUID()
  const startedAt = new Date().toISOString()

  const task: InternalTask = {
    id,
    command,
    args: [...args],
    status: 'running',
    startedAt,
    promise: Promise.resolve()
  }

  task.promise = executeZowe(command, args)
    .then((result) => {
      task.status = 'completed'
      task.completedAt = new Date().toISOString()
      task.result = result
    })
    .catch((error: unknown) => {
      task.status = 'completed'
      task.completedAt = new Date().toISOString()
      task.result = {
        success: false,
        stdout: '',
        stderr: String(error),
        exitCode: 1
      }
    })

  tasks.set(id, task)
  return task
}

async function waitForTask(taskId: string, waitMs: number): Promise<boolean> {
  const task = tasks.get(taskId)
  if (!task) return false

  if (task.status === 'completed') return true

  const timeoutReached = await Promise.race([
    task.promise.then(() => false),
    delay(waitMs).then(() => true)
  ])
  return !timeoutReached
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanupTasks(): void {
  const ttlMs = getPositiveInt(process.env.ZOWE_MCP_TASK_TTL_MS, DEFAULT_TASK_TTL_MS)
  const maxTasks = getPositiveInt(process.env.ZOWE_MCP_MAX_TASKS, DEFAULT_MAX_TASKS)
  const cutoff = Date.now() - ttlMs

  for (const [taskId, task] of tasks.entries()) {
    if (task.status !== 'completed') continue
    const completedAt = task.completedAt ? Date.parse(task.completedAt) : 0
    if (!completedAt || completedAt < cutoff) {
      tasks.delete(taskId)
    }
  }

  if (tasks.size <= maxTasks) return

  const completed = Array.from(tasks.values())
    .filter((task) => task.status === 'completed')
    .sort((a, b) => (a.completedAt || '') < (b.completedAt || '') ? -1 : 1)

  while (tasks.size > maxTasks && completed.length > 0) {
    const oldest = completed.shift()
    if (oldest) tasks.delete(oldest.id)
  }
}

function toPublicTask(task: InternalTask): ZoweAsyncTask {
  return {
    id: task.id,
    command: task.command,
    args: [...task.args],
    status: task.status,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    result: task.result
  }
}

function getPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback
  return parsed
}

function normalizePositiveInt(value: number | undefined, fallback: number): number {
  if (!Number.isInteger(value) || !value || value <= 0) return fallback
  return value
}

function isCompleted(task: InternalTask): boolean {
  return task.status === 'completed'
}
