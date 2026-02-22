import {
  explainErrorInputSchema,
  listErrorCodesInputSchema
} from '@gestell/schema/tools/errors'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { ABEND_CODES, explainError, RETURN_CODES } from '../services/error-reference.js'

export function registerErrorTools(server: McpServer): void {

  server.registerTool(
    'zowe_explain_error',
    {
      title: 'Explain z/OS Error Code',
      description: 'Look up and explain a z/OS error code, abend code, or return code.\n\nSupports:\n  - System ABEND codes: S0C1, S0C4, S0C7, S013, S222, S322, S806, SB37\n  - Return codes: CC 0000 through CC 0020\n  - Message prefixes: IEC, IGD, IEF, IEA\n\nArgs:\n  - code (string): The error code to explain (e.g., "S0C7", "CC 0012", "ABEND S013")',
      inputSchema: explainErrorInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const explanation = explainError(params.code)
      return { content: [{ type: 'text', text: explanation }] }
    }
  )

  server.registerTool(
    'zowe_list_error_codes',
    {
      title: 'List Known z/OS Error Codes',
      description: 'List all known z/OS error codes and their brief descriptions.',
      inputSchema: listErrorCodesInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async () => {
      const lines: string[] = ['**Common z/OS ABEND Codes:**', '']
      for (const [code, info] of Object.entries(ABEND_CODES)) {
        lines.push(`- **${code}** - ${info.name}: ${info.description}`)
      }
      lines.push('', '**Common Return Codes:**', '')
      for (const [code, info] of Object.entries(RETURN_CODES)) {
        lines.push(`- **CC ${code}** (${info.severity}): ${info.meaning}`)
      }
      return { content: [{ type: 'text', text: lines.join('\n') }] }
    }
  )
}
