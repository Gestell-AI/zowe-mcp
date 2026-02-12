import { describe, it, expect } from "vitest";
import { getMockResponse } from "../../src/services/mock-provider.js";
import type { ZoweResult } from "../../src/services/zowe-executor.js";

describe("getMockResponse", () => {
  describe("returns valid ZoweResult for all supported commands", () => {
    const supportedCommands: Array<{ command: string; args: string[] }> = [
      { command: "zos-jobs list jobs", args: ["--rfj"] },
      { command: "zos-jobs view job-status-by-jobid", args: ["JOB00142", "--rfj"] },
      { command: "zos-jobs view all-spool-content", args: ["--jobid", "JOB00142"] },
      { command: "zos-jobs view spool-file-by-id", args: ["JOB00142", "1"] },
      { command: "zos-jobs submit data-set", args: ["--data-set", "DEVUSR1.JCL(MYJOB)", "--rfj"] },
      { command: "zos-files list ds", args: ["DEVUSR1", "--rfj"] },
      { command: "zos-files list all-members", args: ["DEVUSR1.COBOL", "--rfj"] },
      { command: "zos-files view ds", args: ["DEVUSR1.COBOL(PAYROLL)"] },
      { command: "zos-tso issue command", args: ["--command", "STATUS"] },
      { command: "zos-console issue command", args: ["--command", "D A"] }
    ];

    it.each(supportedCommands)(
      "returns success for $command",
      ({ command, args }) => {
        const result = getMockResponse(command, args);
        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result).toHaveProperty("stdout");
        expect(result).toHaveProperty("stderr");
      }
    );
  });

  describe("zos-jobs list jobs", () => {
    it("returns job list with required fields", () => {
      const result = getMockResponse("zos-jobs list jobs", ["--rfj"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.data).toBeDefined();

      const data = result.data as { data?: Array<Record<string, unknown>> };
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data!.length).toBeGreaterThan(0);

      const job = data.data![0];
      expect(job).toHaveProperty("jobid");
      expect(job).toHaveProperty("jobname");
      expect(job).toHaveProperty("owner");
      expect(job).toHaveProperty("status");
      expect(job).toHaveProperty("retcode");
    });

    it("filters by owner", () => {
      const result = getMockResponse("zos-jobs list jobs", ["--owner", "TESTUSER", "--rfj"]);
      expect(result.success).toBe(true);
      const data = result.data as { data?: Array<Record<string, unknown>> };
      expect(data.data).toBeDefined();
      data.data!.forEach((job) => {
        expect(job.owner).toBe("TESTUSER");
      });
    });

    it("filters by status", () => {
      const result = getMockResponse("zos-jobs list jobs", ["--status", "ACTIVE", "--rfj"]);
      expect(result.success).toBe(true);
      const data = result.data as { data?: Array<Record<string, unknown>> };
      expect(data.data).toBeDefined();
      data.data!.forEach((job) => {
        expect(job.status).toBe("ACTIVE");
      });
    });
  });

  describe("zos-jobs view job-status-by-jobid", () => {
    it("returns job status details", () => {
      const result = getMockResponse("zos-jobs view job-status-by-jobid", ["JOB00142", "--rfj"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      const data = result.data as { data?: Record<string, unknown> };
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty("jobid");
      expect(data.data).toHaveProperty("jobname");
      expect(data.data).toHaveProperty("status");
      expect(data.data).toHaveProperty("retcode");
    });

    it("returns failed job status for JOB00245", () => {
      const result = getMockResponse("zos-jobs view job-status-by-jobid", ["JOB00245", "--rfj"]);
      expect(result.success).toBe(true);

      const data = result.data as { data?: Record<string, unknown> };
      expect(data.data?.retcode).toBe("ABEND S0C7");
    });
  });

  describe("zos-jobs view spool content", () => {
    it("returns spool output for successful job", () => {
      const result = getMockResponse("zos-jobs view all-spool-content", ["--jobid", "JOB00142"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("JOB");
      expect(result.stdout).toContain("STEP");
    });

    it("returns error content for failed job JOB00245", () => {
      const result = getMockResponse("zos-jobs view all-spool-content", ["--jobid", "JOB00245"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("S0C7");
      expect(result.stdout).toContain("DATA EXCEPTION");
    });

    it("returns error content for CC 0012 job JOB00203", () => {
      const result = getMockResponse("zos-jobs view all-spool-content", ["--jobid", "JOB00203"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("CC 0012");
    });
  });

  describe("zos-jobs submit data-set", () => {
    it("returns submitted job info", () => {
      const result = getMockResponse("zos-jobs submit data-set", ["--data-set", "DEVUSR1.JCL(TESTJOB)", "--rfj"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      const data = result.data as { data?: Record<string, unknown> };
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty("jobid");
      expect(data.data).toHaveProperty("jobname");
      expect(data.data?.status).toBe("INPUT");
    });
  });

  describe("zos-files list ds", () => {
    it("returns dataset list with required fields", () => {
      const result = getMockResponse("zos-files list ds", ["DEVUSR1", "--rfj"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      const data = result.data as { data?: { items?: Array<Record<string, unknown>> } };
      expect(data.data?.items).toBeDefined();
      expect(Array.isArray(data.data?.items)).toBe(true);
      expect(data.data!.items!.length).toBeGreaterThan(0);

      const dataset = data.data!.items![0];
      expect(dataset).toHaveProperty("dsname");
      expect(dataset).toHaveProperty("dsorg");
    });

    it("includes COBOL and JCL datasets", () => {
      const result = getMockResponse("zos-files list ds", ["DEVUSR1", "--rfj"]);
      const data = result.data as { data?: { items?: Array<Record<string, unknown>> } };
      const dsnames = data.data!.items!.map((ds) => ds.dsname);

      expect(dsnames.some((name) => String(name).includes("COBOL"))).toBe(true);
      expect(dsnames.some((name) => String(name).includes("JCL"))).toBe(true);
    });
  });

  describe("zos-files list all-members", () => {
    it("returns member list for COBOL library", () => {
      const result = getMockResponse("zos-files list all-members", ["DEVUSR1.COBOL", "--rfj"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);

      const data = result.data as { data?: { items?: Array<{ member: string }> } };
      expect(data.data?.items).toBeDefined();
      expect(Array.isArray(data.data?.items)).toBe(true);
      expect(data.data!.items!.length).toBeGreaterThan(0);

      const memberNames = data.data!.items!.map((m) => m.member);
      expect(memberNames).toContain("PAYROLL");
    });

    it("returns member list for JCL library", () => {
      const result = getMockResponse("zos-files list all-members", ["DEVUSR1.JCL", "--rfj"]);
      const data = result.data as { data?: { items?: Array<{ member: string }> } };
      const memberNames = data.data!.items!.map((m) => m.member);

      expect(memberNames).toContain("PAYROLL1");
    });

    it("returns copybook members for COPYBOOK library", () => {
      const result = getMockResponse("zos-files list all-members", ["DEVUSR1.COBOL.COPYBOOK", "--rfj"]);
      const data = result.data as { data?: { items?: Array<{ member: string }> } };
      const memberNames = data.data!.items!.map((m) => m.member);

      expect(memberNames.length).toBeGreaterThan(0);
      expect(memberNames).toContain("CUSTREC");
    });
  });

  describe("zos-files view ds", () => {
    it("returns COBOL source with IDENTIFICATION DIVISION", () => {
      const result = getMockResponse("zos-files view ds", ["DEVUSR1.COBOL(PAYROLL)"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("IDENTIFICATION DIVISION");
      expect(result.stdout).toContain("PROGRAM-ID");
    });

    it("returns JCL content for JCL member", () => {
      const result = getMockResponse("zos-files view ds", ["DEVUSR1.JCL(PAYROLL1)"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("//");
      expect(result.stdout).toContain("JOB");
    });

    it("returns generic content for unknown member", () => {
      const result = getMockResponse("zos-files view ds", ["DEVUSR1.DATA.UNKNOWN"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("Dataset:");
    });
  });

  describe("zos-tso issue command", () => {
    it("handles LISTDS command", () => {
      const result = getMockResponse("zos-tso issue command", ["--command", "LISTDS 'DEVUSR1.COBOL'"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("DEVUSR1.COBOL");
    });

    it("handles STATUS command", () => {
      const result = getMockResponse("zos-tso issue command", ["--command", "STATUS"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("JOB");
    });

    it("handles LISTCAT command", () => {
      const result = getMockResponse("zos-tso issue command", ["--command", "LISTCAT"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("DEVUSR1");
    });

    it("handles unknown TSO command gracefully", () => {
      const result = getMockResponse("zos-tso issue command", ["--command", "UNKNOWNCMD"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("UNKNOWNCMD");
    });
  });

  describe("zos-console issue command", () => {
    it("handles D A command", () => {
      const result = getMockResponse("zos-console issue command", ["--command", "D A"]);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("ACTIVITY");
    });

    it("handles D TS command", () => {
      const result = getMockResponse("zos-console issue command", ["--command", "D TS"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("DEVUSR1");
    });

    it("handles unknown console command gracefully", () => {
      const result = getMockResponse("zos-console issue command", ["--command", "MYCMD"]);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain("MYCMD");
    });
  });

  describe("unknown commands", () => {
    it("returns success: false for unknown command", () => {
      const result = getMockResponse("zos-unknown command", ["--arg", "value"]);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it("does not crash on unknown command", () => {
      expect(() => {
        getMockResponse("completely-fake-command", []);
      }).not.toThrow();
    });

    it("returns error message for unknown command", () => {
      const result = getMockResponse("zos-fake command", []);
      expect(result.success).toBe(false);
      expect(result.stderr).toContain("Mock mode");
      expect(result.stderr).toContain("No mock data");
    });
  });
});
