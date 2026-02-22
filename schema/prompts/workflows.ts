import { z } from 'zod'

export const onboardingArgsSchema = {
  /** High-level qualifier (HLQ) to explore for onboarding (for example: `IBMUSER` or `DEVUSR1`). */
  hlq: z
    .string()
    .optional()
    .describe('High-level qualifier (user ID or project prefix) to explore, e.g., IBMUSER')
}

export const diagnoseJobFailureArgsSchema = {
  /** JES job ID to diagnose (for example: `JOB00245` or `TSU00089`). */
  job_id: z.string().describe('The job ID to diagnose (e.g., JOB00245)')
}

export const exploreCodebaseArgsSchema = {
  /** HLQ that contains COBOL/JCL/copybook libraries for the application. */
  hlq: z.string().describe('High-level qualifier containing the application code'),
  /** Optional program/member name to use as the first entry point for analysis. */
  program: z.string().optional().describe('Specific program name to start with')
}

export const codeReviewArgsSchema = {
  /** Dataset(member) containing source code to review (for example: `IBMUSER.COBOL(PAYROLL)`). */
  dataset: z
    .string()
    .describe('Dataset(member) containing the code to review, e.g., IBMUSER.COBOL(PAYROLL)')
}

export const dailyOpsCheckArgsSchema = {
  /** Owner/userid filter for the operational job health check. */
  owner: z.string().optional().describe('Job owner to check (user ID or * for all)')
}
