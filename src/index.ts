#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_NAME, SERVER_VERSION, MOCK_MODE } from "./constants.js";
import { registerJobTools } from "./tools/jobs.js";
import { registerDatasetTools } from "./tools/datasets.js";
import { registerTsoTools } from "./tools/tso.js";
import { registerErrorTools } from "./tools/errors.js";
import { registerPrompts } from "./prompts/workflows.js";
import { registerResources } from "./resources/reference.js";

async function main(): Promise<void> {
  if (MOCK_MODE) {
    console.error(`[${SERVER_NAME}] Running in MOCK MODE - using simulated z/OS responses`);
  } else {
    console.error(`[${SERVER_NAME}] Running in LIVE MODE - executing real Zowe CLI commands`);
  }

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  // Register all tools
  registerJobTools(server);
  registerDatasetTools(server);
  registerTsoTools(server);
  registerErrorTools(server);

  // Register prompts (pre-built workflows)
  registerPrompts(server);

  // Register resources (reference material)
  registerResources(server);

  // Connect via stdio transport (for Claude Desktop, Cursor, etc.)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[${SERVER_NAME}] v${SERVER_VERSION} connected and ready`);
}

main().catch((error) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, error);
  process.exit(1);
});
