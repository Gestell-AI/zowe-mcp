import {
  listDatasetsInputSchema,
  listMembersInputSchema,
  readDatasetInputSchema,
  searchDatasetsInputSchema,
  uploadDirectoryToPdsInputSchema,
  uploadFileToDatasetInputSchema
} from '@gestell/schema/tools/datasets'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { executeZoweManaged, formatPendingTaskMessage } from '../services/zowe-async-tasks.js'
import { withZoweOptions } from '../services/zowe-options.js'

export function registerDatasetTools(server: McpServer): void {

  server.registerTool(
    'zowe_list_datasets',
    {
      title: 'List z/OS Datasets',
      description: 'List datasets on the z/OS system matching a pattern.\n\nReturns dataset names with attributes like organization (PO/PS), record format, logical record length, and volume.\n\nArgs:\n  - pattern (string): Dataset name pattern (e.g., "DEVUSR1" lists all datasets starting with DEVUSR1)',
      inputSchema: listDatasetsInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.pattern, '--rfj'],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files list data-set', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_list_datasets', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error listing datasets: ${result.stderr}` }] }
      }

      const datasets = extractItems(result.data)

      if (datasets.length === 0) {
        return { content: [{ type: 'text', text: `No datasets found matching pattern: ${params.pattern}` }] }
      }

      const lines = datasets.map((ds) => {
        const dsorg = ds.dsorg || '?'
        const recfm = ds.recfm || '?'
        const lrecl = ds.lrecl || '?'
        const vol = ds.vol || ds.volume || '?'
        return `${ds.dsname}  (${dsorg}, ${recfm}, LRECL=${lrecl}, VOL=${vol})`
      })

      const summary = [
        `Found ${datasets.length} dataset(s) matching "${params.pattern}":`,
        '',
        ...lines,
        '',
        '**Legend:** PO = Partitioned (library), PS = Physical Sequential (flat file)',
        '',
        'Use zowe_list_members to see members of a PO dataset.',
        'Use zowe_read_dataset to view dataset/member contents.'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_list_members',
    {
      title: 'List Dataset Members',
      description: 'List members of a partitioned dataset (PDS/PDSE).\n\nPartitioned datasets are like directories containing named members. This is commonly used for COBOL source libraries, JCL libraries, and copybook libraries.\n\nArgs:\n  - dataset (string): Fully qualified dataset name (e.g., "DEVUSR1.COBOL")',
      inputSchema: listMembersInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.dataset, '--rfj'],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files list all-members', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_list_members', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error listing members: ${result.stderr}` }] }
      }

      const members = extractItems(result.data) as Array<{ member: string }>

      if (members.length === 0) {
        return { content: [{ type: 'text', text: `No members found in dataset: ${params.dataset}` }] }
      }

      const memberNames = members.map(m => m.member)

      const summary = [
        `**${params.dataset}** contains ${members.length} member(s):`,
        '',
        memberNames.join('  '),
        '',
        'Use zowe_read_dataset to view a specific member, e.g.:',
        `  dataset: "${params.dataset}(${memberNames[0]})"`
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_read_dataset',
    {
      title: 'Read Dataset Contents',
      description: 'Read the contents of a z/OS dataset or PDS member.\n\nFor sequential datasets, provide the dataset name directly.\nFor PDS members, use the format DATASET(MEMBER).\n\nThis is essential for viewing COBOL source code, JCL, copybooks, and data files.\n\nArgs:\n  - dataset (string): Dataset name or dataset(member) to read',
      inputSchema: readDatasetInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.dataset],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files view data-set', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_read_dataset', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error reading dataset: ${result.stderr}` }] }
      }

      const lines = result.stdout.split('\n')
      const lineCount = lines.length

      const header = [
        `**Contents of ${params.dataset}** (${lineCount} lines):`,
        '',
        '```cobol',
        result.stdout,
        '```'
      ]

      return { content: [{ type: 'text', text: header.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_search_datasets',
    {
      title: 'Search Dataset Contents',
      description: 'Search for a string pattern within a dataset or PDS member.\n\nUseful for finding where variables, copybooks, or specific logic is used in COBOL programs.\n\nArgs:\n  - dataset (string): Dataset or dataset(member) to search\n  - pattern (string): Text pattern to search for (case-insensitive)',
      inputSchema: searchDatasetsInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.dataset],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files view data-set', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_search_datasets', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error reading dataset: ${result.stderr}` }] }
      }

      const lines = result.stdout.split('\n')
      const matches: string[] = []
      const searchPattern = params.pattern.toLowerCase()

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchPattern)) {
          matches.push(`${String(index + 1).padStart(5)}: ${line}`)
        }
      })

      if (matches.length === 0) {
        return { content: [{ type: 'text', text: `No matches for "${params.pattern}" in ${params.dataset}` }] }
      }

      const summary = [
        `Found ${matches.length} match(es) for "${params.pattern}" in ${params.dataset}:`,
        '',
        '```',
        ...matches,
        '```'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  server.registerTool(
    'zowe_upload_file_to_dataset',
    {
      title: 'Upload Local File to Dataset Member',
      description: 'Upload a local workspace file into a z/OS dataset or member.\n\nUse this to preload demo artifacts (JCL/COBOL/copybooks) into target PDS libraries.\n\nArgs:\n  - local_file (string): Local file path (e.g., "demo/source/10-view/view.jcl")\n  - dataset (string): Target dataset/member (e.g., "DEMO.SAMPLE.JCL(VIEW)")',
      inputSchema: uploadFileToDatasetInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.local_file, params.dataset],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files upload file-to-data-set', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_upload_file_to_dataset', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error uploading file to dataset: ${result.stderr}` }] }
      }

      return {
        content: [{
          type: 'text',
          text: result.stdout
            ? `Uploaded \`${params.local_file}\` to \`${params.dataset}\`.\n\nCLI output:\n\`\`\`\n${result.stdout}\n\`\`\``
            : `Uploaded \`${params.local_file}\` to \`${params.dataset}\`.`
        }]
      }
    }
  )

  server.registerTool(
    'zowe_upload_directory_to_pds',
    {
      title: 'Upload Local Directory to PDS',
      description: 'Upload local files from a workspace directory into a target PDS library.\n\nEach file becomes a member in the PDS according to Zowe CLI naming rules.\n\nArgs:\n  - local_dir (string): Local directory to upload\n  - dataset (string): Target PDS dataset (e.g., "DEMO.SAMPLE.COBOL")',
      inputSchema: uploadDirectoryToPdsInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.local_dir, params.dataset],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files upload dir-to-pds', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_upload_directory_to_pds', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error uploading directory to PDS: ${result.stderr}` }] }
      }

      return {
        content: [{
          type: 'text',
          text: result.stdout
            ? `Uploaded directory \`${params.local_dir}\` to \`${params.dataset}\`.\n\nCLI output:\n\`\`\`\n${result.stdout}\n\`\`\``
            : `Uploaded directory \`${params.local_dir}\` to \`${params.dataset}\`.`
        }]
      }
    }
  )
}

function extractItems(data: unknown): Array<Record<string, unknown>> {
  const root = (data || {}) as Record<string, unknown>
  const payload = ((root.data || {}) as Record<string, unknown>)

  const nestedItems = payload.items
  if (Array.isArray(nestedItems)) return nestedItems as Array<Record<string, unknown>>

  // Current Zowe JSON format commonly wraps rows under data.apiResponse.items.
  const apiResponse = (payload.apiResponse || {}) as Record<string, unknown>
  if (Array.isArray(apiResponse.items)) return apiResponse.items as Array<Record<string, unknown>>

  return []
}
