import { z } from 'zod'

export const listJobsInputSchema = {
  owner: z.string().optional().describe('Job owner userid'),
  prefix: z.string().optional().describe('Job name prefix (e.g., PAYROLL*)'),
  status: z.enum(['ACTIVE', 'OUTPUT', 'INPUT']).optional().describe('Job status filter'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const getJobStatusInputSchema = {
  job_id: z.string().describe('Job ID (e.g., JOB00142)'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const getJobOutputInputSchema = {
  job_id: z.string().describe('Job ID (e.g., JOB00142)'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const submitJobInputSchema = {
  dataset: z
    .string()
    .describe('Fully qualified dataset(member) to submit, e.g., DEVUSR1.JCL(PAYROLL1)'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}
