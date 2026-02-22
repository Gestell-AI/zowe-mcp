#!/usr/bin/env node
import { MOCK_MODE,SERVER_NAME, SERVER_VERSION } from '@gestell/mcp/constants'
import { registerPrompts } from '@gestell/mcp/prompts/workflows'
import { registerResources } from '@gestell/mcp/resources/reference'
import { executeZowe } from '@gestell/mcp/services/zowe-executor.js'
import { registerAsyncTaskTools } from '@gestell/mcp/tools/async-tasks'
import { registerDatasetTools } from '@gestell/mcp/tools/datasets'
import { registerErrorTools } from '@gestell/mcp/tools/errors'
import { registerJobTools } from '@gestell/mcp/tools/jobs'
import { registerTsoTools } from '@gestell/mcp/tools/tso'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

async function main(): Promise<void> {
  if (MOCK_MODE) {
    console.error(`[${SERVER_NAME}] Running in MOCK MODE - using simulated z/OS responses`)
  } else {
    console.error(`[${SERVER_NAME}] Running in LIVE MODE - executing real Zowe CLI commands`)
    const preflight = await executeZowe('zosmf check status', ['--rfj'])
    if (!preflight.success) {
      const message = [
        'Zowe live-mode preflight failed.',
        `Details: ${preflight.stderr || preflight.stdout || 'Unknown error'}`,
        'Suggested checks:',
        '  1. zowe config auto-init',
        '  2. zowe auth login apiml',
        '  3. zowe zosmf check status --rfj'
      ].join('\n')

      if (process.env.ZOWE_MCP_REQUIRE_PREFLIGHT === 'true') {
        throw new Error(message)
      }

      console.error(`[${SERVER_NAME}] WARNING: ${message}`)
      console.error(`[${SERVER_NAME}] Continuing startup. Set ZOWE_MCP_REQUIRE_PREFLIGHT=true to fail on preflight errors.`)
    }
  }

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  })

  // Register all tools
  registerJobTools(server)
  registerDatasetTools(server)
  registerTsoTools(server)
  registerErrorTools(server)
  registerAsyncTaskTools(server)

  // Register prompts (pre-built workflows)
  registerPrompts(server)

  // Register resources (reference material)
  registerResources(server)

  // Connect via stdio transport (for Claude Desktop, Cursor, etc.)
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error(`[${SERVER_NAME}] v${SERVER_VERSION} connected and ready`)
}

main().catch((error) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, error)
  process.exit(1)
})
