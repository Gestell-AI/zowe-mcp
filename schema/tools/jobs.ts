import { z } from 'zod'

export const listJobsInputSchema = {
  /** Optional JES owner filter (for example: `IBMUSER`). */
  owner: z.string().optional().describe('Job owner userid'),
  /** Optional job name prefix filter (for example: `PAYROLL`). Do not include `*`; wildcard suffixes are normalized automatically. */
  prefix: z.string().optional().describe('Job name prefix (e.g., PAYROLL)'),
  /** Optional local status filter to narrow the result set. */
  status: z.enum(['ACTIVE', 'OUTPUT', 'INPUT']).optional().describe('Job status filter'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const getJobStatusInputSchema = {
  /** Job ID to inspect (for example: `JOB00142`, `TSU00089`). */
  job_id: z.string().describe('Job ID (e.g., JOB00142)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const getJobOutputInputSchema = {
  /** Job ID to fetch spool output for (for example: `JOB00142`). */
  job_id: z.string().describe('Job ID (e.g., JOB00142)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const submitJobInputSchema = {
  /** JCL dataset/member to submit (for example: `IBMUSER.JCL(MYJOB)`). */
  dataset: z
    .string()
    .describe('Fully qualified dataset(member) to submit, e.g., DEVUSR1.JCL(PAYROLL1)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}
