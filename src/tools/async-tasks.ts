import {
  getAsyncTaskInputSchema,
  listAsyncTasksInputSchema
} from '@gestell/schema/tools/async-tasks'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { listAsyncTasks, getAsyncTask } from '../services/zowe-async-tasks.js'

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
