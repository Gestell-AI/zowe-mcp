import { exec } from "child_process";
import { promisify } from "util";
import { MOCK_MODE } from "../constants.js";
import { getMockResponse } from "./mock-provider.js";

const execAsync = promisify(exec);

export interface ZoweResult {
  success: boolean;
  stdout: string;
  stderr: string;
  data?: unknown;
  exitCode: number;
}

/**
 * Execute a Zowe CLI command and return parsed results.
 * In mock mode, returns realistic canned responses.
 */
export async function executeZowe(command: string, args: string[] = []): Promise<ZoweResult> {
  const fullCommand = `zowe ${command} ${args.join(" ")}`.trim();

  if (MOCK_MODE) {
    return getMockResponse(command, args);
  }

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout: 30000,
      env: { ...process.env }
    });

    // Try to parse JSON output (Zowe supports --rfj for JSON)
    let data: unknown = undefined;
    try {
      data = JSON.parse(stdout);
    } catch {
      // Not JSON, that's fine
    }

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      data,
      exitCode: 0
    };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; code?: number };
    return {
      success: false,
      stdout: execError.stdout?.trim() || "",
      stderr: execError.stderr?.trim() || String(error),
      exitCode: execError.code || 1
    };
  }
}

/**
 * Execute a Zowe CLI command with --rfj (response format JSON) for structured output.
 */
export async function executeZoweJson(command: string, args: string[] = []): Promise<ZoweResult> {
  return executeZowe(command, [...args, "--rfj"]);
}
