import {
  getAsyncTaskInputSchema,
  listAsyncTasksInputSchema,
  waitAsyncTaskInputSchema
} from '@gestell/schema/tools/async-tasks'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { getAsyncTask, listAsyncTasks, waitOnAsyncTask } from '../services/zowe-async-tasks.js'

export function registerAsyncTaskTools(server: McpServer): void {
  server.registerTool(
    'zowe_get_async_task',
    {
      title: 'Get Async Task Status',
      description: 'Poll an async Zowe command task by task ID.',
      inputSchema: getAsyncTaskInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const task = getAsyncTask(params.task_id)
      if (!task) {
        return {
          content: [{
            type: 'text',
            text: `Task not found: ${params.task_id}`
          }]
        }
      }

      if (task.status === 'running') {
        return {
          content: [{
            type: 'text',
            text: [
              `Task ${task.id} is still running.`,
              `Started: ${task.startedAt}`,
              `Command: zowe ${task.command} ${task.args.join(' ')}`
            ].join('\n')
          }]
        }
      }

      const result = task.result
      if (!result) {
        return {
          content: [{
            type: 'text',
            text: `Task ${task.id} completed but has no result payload.`
          }]
        }
      }

      const lines = [
        `Task ${task.id} completed.`,
        `Started: ${task.startedAt}`,
        task.completedAt ? `Completed: ${task.completedAt}` : null,
        `Command: zowe ${task.command} ${task.args.join(' ')}`,
        `Success: ${result.success}`,
        `Exit code: ${result.exitCode}`,
        ''
      ].filter(Boolean) as string[]

      if (result.stdout) {
        lines.push('**stdout**')
        lines.push('```')
        lines.push(result.stdout)
        lines.push('```')
      }

      if (result.stderr) {
        lines.push('**stderr**')
        lines.push('```')
        lines.push(result.stderr)
        lines.push('```')
      }

      return {
        content: [{
          type: 'text',
          text: lines.join('\n')
        }]
      }
    }
  )

  server.registerTool(
    'zowe_wait_async_task',
    {
      title: 'Wait for Async Task',
      description: 'Wait for an async task to complete within this call window. This is the recommended polling tool for agents.',
      inputSchema: waitAsyncTaskInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const waitResult = await waitOnAsyncTask(params.task_id, params.max_wait_ms, params.poll_interval_ms)
      if (!waitResult.found) {
        return {
          content: [{
            type: 'text',
            text: `Task not found: ${params.task_id}`
          }]
        }
      }

      const task = waitResult.task
      if (!task) {
        return {
          content: [{
            type: 'text',
            text: `Task ${params.task_id} found but no task payload is available.`
          }]
        }
      }

      if (waitResult.timedOut || task.status === 'running') {
        return {
          content: [{
            type: 'text',
            text: [
              `Task ${task.id} is still running.`,
              `Started: ${task.startedAt}`,
              `Command: zowe ${task.command} ${task.args.join(' ')}`,
              'Call zowe_wait_async_task again with the same task_id.'
            ].join('\n')
          }]
        }
      }

      const result = task.result
      if (!result) {
        return {
          content: [{
            type: 'text',
            text: `Task ${task.id} completed but has no result payload.`
          }]
        }
      }

      const lines = [
        `Task ${task.id} completed.`,
        `Started: ${task.startedAt}`,
        task.completedAt ? `Completed: ${task.completedAt}` : null,
        `Command: zowe ${task.command} ${task.args.join(' ')}`,
        `Success: ${result.success}`,
        `Exit code: ${result.exitCode}`,
        ''
      ].filter(Boolean) as string[]

      if (result.stdout) {
        lines.push('**stdout**')
        lines.push('```')
        lines.push(result.stdout)
        lines.push('```')
      }

      if (result.stderr) {
        lines.push('**stderr**')
        lines.push('```')
        lines.push(result.stderr)
        lines.push('```')
      }

      return {
        content: [{
          type: 'text',
          text: lines.join('\n')
        }]
      }
    }
  )

  server.registerTool(
    'zowe_list_async_tasks',
    {
      title: 'List Async Tasks',
      description: 'List recent async Zowe command tasks with status.',
      inputSchema: listAsyncTasksInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const tasks = listAsyncTasks(params.status)
      if (tasks.length === 0) {
        return { content: [{ type: 'text', text: 'No async tasks found.' }] }
      }

      const lines = tasks.map((task) =>
        `${task.id} | ${task.status} | ${task.startedAt} | zowe ${task.command} ${task.args.join(' ')}`
      )

      return {
        content: [{
          type: 'text',
          text: [
            `Found ${tasks.length} async task(s):`,
            '',
            ...lines
          ].join('\n')
        }]
      }
    }
  )
}
