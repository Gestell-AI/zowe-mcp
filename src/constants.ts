// Server configuration
export const SERVER_NAME = "zowe-mcp-server";
export const SERVER_VERSION = "0.1.0";

// Environment
export const MOCK_MODE = process.env.ZOWE_MCP_MOCK === "true" || process.env.ZOWE_MCP_MOCK === "1";
export const ZOWE_PROFILE = process.env.ZOWE_PROFILE || "default";

// Guardrail classifications
export enum CommandSafety {
  SAFE = "safe",           // Read-only, no side effects
  CAUTIOUS = "cautious",   // Has side effects, needs confirmation context
  BLOCKED = "blocked"      // Destructive, should not be executed by AI
}

// Character limits for responses
export const CHARACTER_LIMIT = 50000;
