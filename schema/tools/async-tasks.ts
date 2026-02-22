import { z } from 'zod'

export const getAsyncTaskInputSchema = {
  task_id: z.string().min(1).describe('Async task ID returned by another zowe_* tool')
}

export const listAsyncTasksInputSchema = {
  status: z.enum(['running', 'completed']).optional().describe('Optional task status filter')
}
