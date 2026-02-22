import { z } from 'zod'

export const onboardingArgsSchema = {
  hlq: z
    .string()
    .optional()
    .describe('High-level qualifier (user ID or project prefix) to explore, e.g., DEVUSR1')
}

export const diagnoseJobFailureArgsSchema = {
  job_id: z.string().describe('The job ID to diagnose (e.g., JOB00245)')
}

export const exploreCodebaseArgsSchema = {
  hlq: z.string().describe('High-level qualifier containing the application code'),
  program: z.string().optional().describe('Specific program name to start with')
}

export const codeReviewArgsSchema = {
  dataset: z
    .string()
    .describe('Dataset(member) containing the code to review, e.g., DEVUSR1.COBOL(PAYROLL)')
}

export const dailyOpsCheckArgsSchema = {
  owner: z.string().optional().describe('Job owner to check (user ID or * for all)')
}
