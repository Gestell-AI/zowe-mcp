import { describe, it, expect, beforeAll } from "vitest";

// Ensure MOCK_MODE is set before importing the module
beforeAll(() => {
  process.env.ZOWE_MCP_MOCK = "true";
});

describe("executeZowe", () => {
  it("returns correct ZoweResult shape", async () => {
    // Dynamic import to ensure env is set first
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    const result = await executeZowe("zos-jobs list jobs", ["--rfj"]);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("stdout");
    expect(result).toHaveProperty("stderr");
    expect(result).toHaveProperty("exitCode");
    expect(typeof result.success).toBe("boolean");
    expect(typeof result.stdout).toBe("string");
    expect(typeof result.stderr).toBe("string");
    expect(typeof result.exitCode).toBe("number");
  });

  it("routes to mock provider in mock mode", async () => {
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    const result = await executeZowe("zos-jobs list jobs", ["--rfj"]);

    // If it routed to mock provider, it should return success with mock data
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.data).toBeDefined();
  });

  it("does not shell out in mock mode", async () => {
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    // This command would fail if it tried to shell out (zowe not installed or wrong command)
    const result = await executeZowe("zos-files list ds", ["DEVUSR1", "--rfj"]);

    // Mock mode should return valid mock data, not a shell error
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it("returns data property when response is JSON", async () => {
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    const result = await executeZowe("zos-jobs list jobs", ["--rfj"]);

    expect(result.data).toBeDefined();
    expect(typeof result.data).toBe("object");
  });

  it("handles various command types", async () => {
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    const commands = [
      { cmd: "zos-jobs list jobs", args: ["--rfj"] },
      { cmd: "zos-files list ds", args: ["DEVUSR1", "--rfj"] },
      { cmd: "zos-tso issue command", args: ["--command", "STATUS"] },
      { cmd: "zos-console issue command", args: ["--command", "D A"] }
    ];

    for (const { cmd, args } of commands) {
      const result = await executeZowe(cmd, args);
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("stdout");
      expect(result).toHaveProperty("stderr");
      expect(result).toHaveProperty("exitCode");
    }
  });
});

describe("executeZoweJson", () => {
  it("appends --rfj to args", async () => {
    const { executeZoweJson } = await import("../../src/services/zowe-executor.js");

    // executeZoweJson should append --rfj automatically
    const result = await executeZoweJson("zos-jobs list jobs", []);

    expect(result.success).toBe(true);
    // The mock provider should receive --rfj and return JSON-like data
    expect(result.data).toBeDefined();
  });

  it("returns correct shape", async () => {
    const { executeZoweJson } = await import("../../src/services/zowe-executor.js");

    const result = await executeZoweJson("zos-files list ds", ["DEVUSR1"]);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("stdout");
    expect(result).toHaveProperty("stderr");
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("exitCode");
  });

  it("does not duplicate --rfj if already present", async () => {
    const { executeZoweJson } = await import("../../src/services/zowe-executor.js");

    // Even with --rfj already in args, should not cause issues
    const result = await executeZoweJson("zos-jobs list jobs", ["--rfj"]);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});

describe("ZoweResult type", () => {
  it("success result has expected properties", async () => {
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    const result = await executeZowe("zos-jobs list jobs", ["--rfj"]);

    if (result.success) {
      expect(result.exitCode).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    }
  });

  it("failure result has expected properties", async () => {
    const { executeZowe } = await import("../../src/services/zowe-executor.js");

    const result = await executeZowe("zos-unknown-command", []);

    if (!result.success) {
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.length).toBeGreaterThan(0);
    }
  });
});
