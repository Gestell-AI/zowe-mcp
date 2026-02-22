import {
  getJobOutputInputSchema,
  getJobSpoolFileInputSchema,
  getJobStatusInputSchema,
  listJobsInputSchema,
  listJobSpoolFilesInputSchema,
  submitJobInputSchema
} from '@gestell/schema/tools/jobs'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { analyzeJobOutput } from '../services/error-reference.js'
import { executeZoweManaged, formatPendingTaskMessage } from '../services/zowe-async-tasks.js'
import { withZoweOptions } from '../services/zowe-options.js'

export function registerJobTools(server: McpServer): void {

  server.registerTool(
    'zowe_list_jobs',
    {
      title: 'List z/OS Jobs',
      description: 'List jobs on the z/OS system, optionally filtered by owner, prefix, or status.\n\nUse this to see what jobs exist, which are running, which have completed, and their return codes.\n\nArgs:\n  - owner (string, optional): Job owner userid\n  - prefix (string, optional): Job name prefix filter (e.g., "PAYROLL", not "PAYROLL*")\n  - status (string, optional): Local status filter - "ACTIVE", "OUTPUT", "INPUT"',
      inputSchema: listJobsInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args: string[] = []
      if (params.owner) args.push('--owner', params.owner)
      if (params.prefix) args.push('--prefix', normalizeJobPrefix(params.prefix))
      args.push('--rfj')
      const resolvedArgs = withZoweOptions(args, params, { allowZosmfProfile: true })

      const execution = await executeZoweManaged('zos-jobs list jobs', resolvedArgs)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_list_jobs', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error listing jobs: ${result.stderr}` }] }
      }

      const data = result.data as { data?: Array<Record<string, unknown>> } | undefined
      const allJobs = (data?.data || []) as Array<Record<string, unknown>>
      const jobs = params.status
        ? allJobs.filter((job) => String(job.status || '').toUpperCase() === params.status)
        : allJobs

      if (jobs.length === 0) {
        return { content: [{ type: 'text', text: 'No jobs found matching the criteria.' }] }
      }

      const lines = jobs.map((j) => {
        const rc = j.retcode || 'N/A'
        const flag = typeof rc === 'string' && (rc.includes('ABEND') || (rc.startsWith('CC') && rc !== 'CC 0000')) ? ' \u26a0\ufe0f' : ''
        return `${j.jobname} (${j.jobid}) - Status: ${j.status} - RC: ${rc}${flag}`
      })

      const summary = [
        `Found ${jobs.length} job(s):`,
        '',
        ...lines,
        '',
        `Active: ${jobs.filter(j => j.status === 'ACTIVE').length}`,
        `Completed: ${jobs.filter(j => j.status === 'OUTPUT').length}`,
        `Queued: ${jobs.filter(j => j.status === 'INPUT').length}`,
        '',
        'Use zowe_get_job_output to view spool output for any job.'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_get_job_status',
    {
      title: 'Get Job Status',
      description: 'Get detailed status of a specific z/OS job by its job ID.\n\nReturns execution timestamps, return code, current phase, and other details.\n\nArgs:\n  - job_id (string): The job ID (e.g., "JOB00142")',
      inputSchema: getJobStatusInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.job_id, '--rfj'],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-jobs view job-status-by-jobid', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_get_job_status', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error getting job status: ${result.stderr}` }] }
      }

      const data = result.data as { data?: Record<string, unknown> } | undefined
      const job = data?.data || {}

      const lines = [
        `**Job: ${job.jobname} (${job.jobid})**`,
        `Owner: ${job.owner}`,
        `Status: ${job.status}`,
        `Return Code: ${job.retcode || 'N/A'}`,
        `Class: ${job.class}`,
        job['exec-started'] ? `Started: ${job['exec-started']}` : null,
        job['exec-ended'] ? `Ended: ${job['exec-ended']}` : null,
        job['phase-name'] ? `Phase: ${job['phase-name']}` : null
      ].filter(Boolean)

      const rc = String(job.retcode || '')
      if (rc.includes('ABEND')) {
        lines.push('', '\u26a0\ufe0f **This job ABENDED.** Use zowe_get_job_output to see the spool and diagnose the error.')
      } else if (rc.match(/CC\s*00(0[4-9]|[1-9]\d)/)) {
        lines.push('', '\u26a0\ufe0f **This job completed with a non-zero return code.** Use zowe_get_job_output to investigate.')
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_get_job_output',
    {
      title: 'Get Job Spool Output',
      description: 'Retrieve the spool output (JES log, SYSOUT, SYSPRINT) for a z/OS job.\n\nThis is the primary way to diagnose job failures. The output will be automatically analyzed for common error codes with explanations.\n\nArgs:\n  - job_id (string): The job ID (e.g., "JOB00142")',
      inputSchema: getJobOutputInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.job_id],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-jobs view all-spool-content', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_get_job_output', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error retrieving spool: ${result.stderr}` }] }
      }

      const analysis = analyzeJobOutput(result.stdout)
      const sections = [`**Spool Output for ${params.job_id}:**\n`, result.stdout]

      if (analysis.length > 0) {
        sections.push('\n\n---\n**\ud83d\udd0d Error Analysis:**\n')
        sections.push(...analysis)
      }

      sections.push(
        '\n\n---\nIf output is too large or truncated, use `zowe_list_job_spool_files` and then `zowe_get_job_spool_file` to extract specific DD content (for example `JESYSMSG` or `SYSPRINT`) in pages.'
      )

      return { content: [{ type: 'text', text: sections.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_list_job_spool_files',
    {
      title: 'List Job Spool Files',
      description: 'List JES spool files (DD entries) for a z/OS job.\n\nUse this when `zowe_get_job_output` is too large or when you need targeted extraction like `JESYSMSG` or compile/link `SYSPRINT`.\n\nArgs:\n  - job_id (string): Job ID (e.g., "JOB00142")',
      inputSchema: listJobSpoolFilesInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.job_id, '--rfj'],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-jobs list spool-files-by-jobid', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_list_job_spool_files', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error listing spool files: ${result.stderr}` }] }
      }

      const files = extractSpoolFiles(result.data)
      if (files.length === 0) {
        const fallback = result.stdout || 'No spool files found.'
        return { content: [{ type: 'text', text: `No structured spool-file list detected for ${params.job_id}.\n\n${fallback}` }] }
      }

      const lines = files.map((record) => {
        const id = getFieldValue(record, ['id', 'spoolfileid', 'spoolFileId', 'fileid', 'fileId', 'dsid']) || '?'
        const ddname = getFieldValue(record, ['ddname', 'ddName']) || 'N/A'
        const step = getFieldValue(record, ['stepname', 'stepName']) || 'N/A'
        const procstep = getFieldValue(record, ['procstep', 'procStep']) || 'N/A'
        return `ID ${id} | DD ${ddname} | STEP ${step} | PROCSTEP ${procstep}`
      })

      return {
        content: [{
          type: 'text',
          text: [
            `Spool files for ${params.job_id}:`,
            '',
            ...lines,
            '',
            'Next: use `zowe_get_job_spool_file` with a specific `spool_file_id` to retrieve targeted content in pages.'
          ].join('\n')
        }]
      }
    }
  )

  server.registerTool(
    'zowe_get_job_spool_file',
    {
      title: 'Get Job Spool File Content',
      description: 'Retrieve a single spool file (DD) for a z/OS job by spool file ID.\n\nThis is ideal for large jobs where full JES output is truncated. Use `start_line` and `max_lines` to page through content.\n\nArgs:\n  - job_id (string): Job ID (e.g., "JOB00142")\n  - spool_file_id (number): Spool file ID from `zowe_list_job_spool_files`',
      inputSchema: getJobSpoolFileInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const commandArgs = [params.job_id, String(params.spool_file_id)]
      if (params.encoding) commandArgs.push('--encoding', params.encoding)
      const args = withZoweOptions(commandArgs, params, { allowZosmfProfile: true })
      const execution = await executeZoweManaged('zos-jobs view spool-file-by-id', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_get_job_spool_file', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error retrieving spool file: ${result.stderr}` }] }
      }

      const page = paginateText(result.stdout, params.start_line, params.max_lines)
      const analysis = analyzeJobOutput(page.content)
      const lines = [
        `**Spool file ${params.spool_file_id} for ${params.job_id}**`,
        `Lines ${page.startLine}-${page.endLine} of ${page.totalLines}`,
        '',
        page.content
      ]

      if (page.hasMore) {
        lines.push(
          '',
          `More lines remain. Next call: zowe_get_job_spool_file(job_id="${params.job_id}", spool_file_id=${params.spool_file_id}, start_line=${page.nextStartLine}, max_lines=${page.maxLines})`
        )
      }

      if (analysis.length > 0) {
        lines.push('', '---', '**\ud83d\udd0d Error Analysis:**', ...analysis)
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_submit_job',
    {
      title: 'Submit a JCL Job',
      description: 'Submit a JCL member from a dataset to run on z/OS.\n\n\u26a0\ufe0f CAUTION: This executes a batch job on the mainframe.\n\nArgs:\n  - dataset (string): Fully qualified dataset with member, e.g., "DEVUSR1.JCL(PAYROLL1)"',
      inputSchema: submitJobInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.dataset, '--rfj'],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-jobs submit data-set', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_submit_job', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error submitting job: ${result.stderr}` }] }
      }

      const data = result.data as { data?: Record<string, unknown> } | undefined
      const job = data?.data || {}

      return {
        content: [{
          type: 'text',
          text: [
            '\u2705 **Job submitted successfully**',
            `Job ID: ${job.jobid}`,
            `Job Name: ${job.jobname}`,
            `Status: ${job.status}`,
            '',
            'Use zowe_get_job_status to monitor progress.',
            'Use zowe_get_job_output to view results when complete.',
            'If output is too large, use zowe_list_job_spool_files + zowe_get_job_spool_file.'
          ].join('\n')
        }]
      }
    }
  )
}

function normalizeJobPrefix(prefix: string): string {
  const trimmed = prefix.trim()
  // z/OSMF rejects wildcard characters in prefix query params.
  return trimmed.replace(/\*+$/g, '')
}

function extractSpoolFiles(value: unknown): Array<Record<string, unknown>> {
  const candidates = collectObjectArrays(value)
  const preferred = candidates.find((candidate) => candidate.some((entry) => hasAnyField(entry, ['id', 'spoolfileid', 'spoolFileId', 'ddname', 'ddName'])))
  return preferred || candidates[0] || []
}

function collectObjectArrays(value: unknown): Array<Array<Record<string, unknown>>> {
  const arrays: Array<Array<Record<string, unknown>>> = []
  const seen = new Set<unknown>()

  const visit = (node: unknown): void => {
    if (!node || seen.has(node)) return
    if (typeof node !== 'object') return
    seen.add(node)

    if (Array.isArray(node)) {
      if (node.every((entry) => typeof entry === 'object' && entry !== null && !Array.isArray(entry))) {
        arrays.push(node as Array<Record<string, unknown>>)
      }
      for (const item of node) visit(item)
      return
    }

    for (const child of Object.values(node as Record<string, unknown>)) {
      visit(child)
    }
  }

  visit(value)
  return arrays
}

function hasAnyField(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.some((key) => key in record && record[key] !== undefined && record[key] !== null && String(record[key]).trim() !== '')
}

function getFieldValue(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    if (!(key in record)) continue
    const value = record[key]
    if (value === undefined || value === null) continue
    const asText = String(value).trim()
    if (asText) return asText
  }
  return undefined
}

interface TextPage {
  content: string
  startLine: number
  endLine: number
  totalLines: number
  maxLines: number
  nextStartLine: number
  hasMore: boolean
}

function paginateText(text: string, startLine?: number, maxLines?: number): TextPage {
  const allLines = text.split(/\r?\n/)
  const totalLines = allLines.length
  const safeStart = Number.isInteger(startLine) && startLine && startLine > 0 ? startLine : 1
  const safeMax = Number.isInteger(maxLines) && maxLines && maxLines > 0 ? maxLines : 400
  const startIndex = Math.min(safeStart - 1, Math.max(totalLines - 1, 0))
  const selected = allLines.slice(startIndex, startIndex + safeMax)
  const endLine = startIndex + selected.length
  const hasMore = endLine < totalLines

  return {
    content: selected.join('\n'),
    startLine: startIndex + 1,
    endLine,
    totalLines,
    maxLines: safeMax,
    nextStartLine: endLine + 1,
    hasMore
  }
}
