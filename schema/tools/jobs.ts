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

export const listJobSpoolFilesInputSchema = {
  /** Job ID whose individual JES spool files (DD entries) should be listed. */
  job_id: z.string().describe('Job ID (e.g., JOB00142)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const getJobSpoolFileInputSchema = {
  /** Job ID that owns the spool file. */
  job_id: z.string().describe('Job ID (e.g., JOB00142)'),
  /** Numeric spool file ID from `zowe_list_job_spool_files`. */
  spool_file_id: z.number().int().positive().describe('Spool file ID (for example: 2)'),
  /** Optional text encoding to request from z/OSMF (for example: `IBM-1047` or `UTF-8`). */
  encoding: z.string().optional().describe('Optional encoding to request for spool content'),
  /** 1-based first line to return from the spool file so large JES output can be paged. */
  start_line: z.number().int().positive().optional().describe('1-based line number where this page should start (default 1)'),
  /** Maximum number of lines to return for this page. */
  max_lines: z.number().int().positive().optional().describe('Maximum lines to return in this page (default 400)'),
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
