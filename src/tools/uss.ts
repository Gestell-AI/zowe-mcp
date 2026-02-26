import {
  listUssFilesInputSchema,
  searchUssFileInputSchema,
  viewUssFileInputSchema
} from '@gestell/schema/tools/uss'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { executeZoweManaged, formatPendingTaskMessage } from '../services/zowe-async-tasks.js'
import { withZoweOptions } from '../services/zowe-options.js'

export function registerUssTools(server: McpServer): void {

  // --- LIST USS FILES ---
  server.registerTool(
    'zowe_list_uss_files',
    {
      title: 'List USS Files',
      description: `List files and directories in a Unix System Services (USS) path on z/OS.\n\nUSS provides a POSIX-compatible filesystem on z/OS. Commonly used for shell scripts, config files, Java applications, and Node.js programs running on z/OS.\n\nArgs:\n  - path (string): USS directory path (e.g., "/u/devusr1")\n\nExamples:\n  - "What files are in my home directory?" -> path: "/u/devusr1"\n  - "List the scripts folder" -> path: "/u/devusr1/scripts"`,
      inputSchema: listUssFilesInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        ['--path', params.path, '--rfj'],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files list uss-files', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_list_uss_files', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error listing USS files: ${result.stderr}` }] }
      }

      const items = extractUssItems(result.data)

      if (items.length === 0) {
        return { content: [{ type: 'text', text: `No files found in: ${params.path}` }] }
      }

      const lines = items.map((item) => {
        const mode = item.mode || '?'
        const size = item.size != null ? String(item.size) : '?'
        const name = item.name || '?'
        const isDir = String(mode).startsWith('d')
        const indicator = isDir ? '/' : ''
        return `${mode}  ${String(size).padStart(10)}  ${name}${indicator}`
      })

      const summary = [
        `**USS Directory: ${params.path}** (${items.length} items):`,
        '',
        '```',
        ...lines,
        '```',
        '',
        'Use zowe_view_uss_file to read a specific file.',
        'Use zowe_search_uss_file to search within a file.'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  // --- VIEW USS FILE ---
  server.registerTool(
    'zowe_view_uss_file',
    {
      title: 'View USS File',
      description: `View the contents of a file in Unix System Services (USS) on z/OS.\n\nUse this to read shell scripts, config files, logs, Java source, and any text file on the z/OS Unix filesystem.\n\nArgs:\n  - file (string): Full USS file path\n\nExamples:\n  - "Show me the build script" -> file: "/u/devusr1/scripts/build.sh"\n  - "Read the server config" -> file: "/u/devusr1/config/server.xml"`,
      inputSchema: viewUssFileInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.file],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files view uss-file', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_view_uss_file', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error reading USS file: ${result.stderr}` }] }
      }

      const lines = result.stdout.split('\n')
      const ext = params.file.split('.').pop() || ''
      const langMap: Record<string, string> = {
        sh: 'bash', py: 'python', java: 'java', xml: 'xml', json: 'json',
        js: 'javascript', ts: 'typescript', yml: 'yaml', yaml: 'yaml',
        properties: 'properties', conf: 'ini', cfg: 'ini', c: 'c', h: 'c',
        cpp: 'cpp', html: 'html', css: 'css', sql: 'sql', rb: 'ruby',
        pl: 'perl', cbl: 'cobol', cob: 'cobol'
      }
      const lang = langMap[ext.toLowerCase()] || ''

      const summary = [
        `**USS File: ${params.file}** (${lines.length} lines):`,
        '',
        `\`\`\`${lang}`,
        result.stdout,
        '```'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  // --- SEARCH USS FILE ---
  server.registerTool(
    'zowe_search_uss_file',
    {
      title: 'Search USS File',
      description: `Search for a text pattern within a USS file on z/OS.\n\nReads the file and returns all matching lines with line numbers.\n\nArgs:\n  - file (string): USS file path to search\n  - pattern (string): Text to search for (case-insensitive)\n\nExamples:\n  - "Find where the DB connection string is set" -> file: "/u/devusr1/config/server.xml", pattern: "jdbc"\n  - "Search the build script for compile flags" -> file: "/u/devusr1/scripts/build.sh", pattern: "CFLAGS"`,
      inputSchema: searchUssFileInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        [params.file],
        params,
        { allowZosmfProfile: true }
      )
      const execution = await executeZoweManaged('zos-files view uss-file', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_search_uss_file', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error reading USS file: ${result.stderr}` }] }
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
        return { content: [{ type: 'text', text: `No matches for "${params.pattern}" in ${params.file}` }] }
      }

      const summary = [
        `Found ${matches.length} match(es) for "${params.pattern}" in ${params.file}:`,
        '',
        '```',
        ...matches,
        '```'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )
}

function extractUssItems(data: unknown): Array<Record<string, unknown>> {
  const root = (data || {}) as Record<string, unknown>
  const payload = ((root.data || {}) as Record<string, unknown>)

  const nestedItems = payload.items
  if (Array.isArray(nestedItems)) return nestedItems as Array<Record<string, unknown>>

  const apiResponse = (payload.apiResponse || {}) as Record<string, unknown>
  if (Array.isArray(apiResponse.items)) return apiResponse.items as Array<Record<string, unknown>>

  return []
}
