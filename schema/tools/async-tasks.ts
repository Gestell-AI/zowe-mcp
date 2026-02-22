import { z } from 'zod'

export const getAsyncTaskInputSchema = {
  /** Task identifier returned by any async-capable `zowe_*` tool. */
  task_id: z.string().min(1).describe('Async task ID returned by another zowe_* tool')
}

export const listAsyncTasksInputSchema = {
  /** Optional status filter so callers can list only running or only completed tasks. */
  status: z.enum(['running', 'completed']).optional().describe('Optional task status filter')
}

export const waitAsyncTaskInputSchema = {
  /** Task identifier returned by any async-capable `zowe_*` tool. */
  task_id: z.string().min(1).describe('Async task ID returned by another zowe_* tool'),

  /** Maximum time in milliseconds to wait during this single call before returning. */
  max_wait_ms: z.number().int().positive().optional().describe('Maximum wait time for this poll call in milliseconds (default 55000)'),

  /** Poll interval in milliseconds between task status checks during this call. */
  poll_interval_ms: z.number().int().positive().optional().describe('Polling interval in milliseconds while waiting (default 2000)')
}
