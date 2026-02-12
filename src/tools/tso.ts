import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeZowe } from "../services/zowe-executor.js";
import { classifyTsoCommand, classifyConsoleCommand } from "../services/guardrails.js";
import { CommandSafety } from "../constants.js";

export function registerTsoTools(server: McpServer): void {

  server.registerTool(
    "zowe_tso_command",
    {
      title: "Issue TSO Command",
      description: `Execute a TSO command on the z/OS system with safety guardrails.\n\nTSO commands allow direct interaction with z/OS. This tool classifies commands by safety level:\n- SAFE: Read-only commands (LISTDS, STATUS, LISTCAT, HELP)\n- CAUTIOUS: Commands with side effects (SUBMIT, ALLOC, EXEC)\n- BLOCKED: Destructive commands (DELETE, CANCEL, PURGE)`,
      inputSchema: {
        command: z.string().min(1).describe("TSO command to execute")
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      const classification = classifyTsoCommand(params.command);
      if (!classification.allowed) {
        return { content: [{ type: "text", text: `\ud83d\udeab **Command Blocked**: ${classification.reason}\n\n${classification.suggestion || ""}\n\nSafety level: ${classification.safety.toUpperCase()}` }] };
      }
      const result = await executeZowe("zos-tso issue command", ["--command", params.command]);
      if (!result.success) {
        return { content: [{ type: "text", text: `Error executing TSO command: ${result.stderr}` }] };
      }
      const prefix = classification.safety === CommandSafety.CAUTIOUS ? `\u26a0\ufe0f *${classification.reason}*\n\n` : "";
      return { content: [{ type: "text", text: `${prefix}**TSO Command:** \`${params.command}\`\n\n**Output:**\n\`\`\`\n${result.stdout}\n\`\`\`` }] };
    }
  );

  server.registerTool(
    "zowe_console_command",
    {
      title: "Issue MVS Console Command",
      description: `Execute an MVS console command on the z/OS system with safety guardrails.\n\nSafety guardrails apply:\n- SAFE: Display commands (D A, D TS, D IPLINFO)\n- BLOCKED: System-altering commands (Z, CANCEL, FORCE, STOP)`,
      inputSchema: {
        command: z.string().min(1).describe("MVS console command to execute")
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      const classification = classifyConsoleCommand(params.command);
      if (!classification.allowed) {
        return { content: [{ type: "text", text: `\ud83d\udeab **Command Blocked**: ${classification.reason}\n\n${classification.suggestion || ""}\n\nSafety level: ${classification.safety.toUpperCase()}` }] };
      }
      const result = await executeZowe("zos-console issue command", ["--command", params.command]);
      if (!result.success) {
        return { content: [{ type: "text", text: `Error issuing console command: ${result.stderr}` }] };
      }
      return { content: [{ type: "text", text: `**Console Command:** \`${params.command}\`\n\n**Response:**\n\`\`\`\n${result.stdout}\n\`\`\`` }] };
    }
  );
}
