import { describe, it, expect } from "vitest";
import { classifyTsoCommand, classifyConsoleCommand } from "../../src/services/guardrails.js";
import { CommandSafety } from "../../src/constants.js";

describe("classifyTsoCommand", () => {
  describe("SAFE commands", () => {
    const safeCommands = ["LISTDS", "LISTCAT", "STATUS", "TIME", "PROFILE", "HELP"];

    it.each(safeCommands)("classifies %s as SAFE and allowed", (cmd) => {
      const result = classifyTsoCommand(cmd);
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies LISTDS with arguments as SAFE", () => {
      const result = classifyTsoCommand("LISTDS 'HLQ.DS'");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies LISTD (short form) as SAFE", () => {
      const result = classifyTsoCommand("LISTD HLQ.DS");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies LISTALC as SAFE", () => {
      const result = classifyTsoCommand("LISTALC");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies LISTBC as SAFE", () => {
      const result = classifyTsoCommand("LISTBC");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies PRINTDS as SAFE", () => {
      const result = classifyTsoCommand("PRINTDS 'HLQ.DS'");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies SEND as SAFE", () => {
      const result = classifyTsoCommand("SEND 'message' USER(ADMIN)");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });
  });

  describe("CAUTIOUS commands", () => {
    const cautiousCommands = ["SUBMIT", "ALLOC", "FREE", "EXEC", "CALL", "RENAME", "COPY"];

    it.each(cautiousCommands)("classifies %s as CAUTIOUS and allowed", (cmd) => {
      const result = classifyTsoCommand(cmd);
      expect(result.safety).toBe(CommandSafety.CAUTIOUS);
      expect(result.allowed).toBe(true);
    });

    it("classifies SUBMIT with dataset as CAUTIOUS", () => {
      const result = classifyTsoCommand("SUBMIT 'HLQ.JCL(MYJOB)'");
      expect(result.safety).toBe(CommandSafety.CAUTIOUS);
      expect(result.allowed).toBe(true);
    });

    it("classifies ALLOC with parameters as CAUTIOUS", () => {
      const result = classifyTsoCommand("ALLOC DA('HLQ.DATA') SHR");
      expect(result.safety).toBe(CommandSafety.CAUTIOUS);
      expect(result.allowed).toBe(true);
    });
  });

  describe("BLOCKED commands", () => {
    const blockedCommands = ["DELETE", "SCRATCH", "FORMAT", "CANCEL", "PURGE", "HALT", "FORCE"];

    it.each(blockedCommands)("classifies %s as BLOCKED and not allowed", (cmd) => {
      const result = classifyTsoCommand(cmd);
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies DELETE with dataset as BLOCKED", () => {
      const result = classifyTsoCommand("DELETE 'HLQ.DS'");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies SETPROG as BLOCKED", () => {
      const result = classifyTsoCommand("SETPROG LPA,ADD");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies VARY x OFFLINE as BLOCKED", () => {
      const result = classifyTsoCommand("VARY 0A1 OFFLINE");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });
  });

  describe("unknown commands default to CAUTIOUS", () => {
    it("classifies unknown command as CAUTIOUS and allowed", () => {
      const result = classifyTsoCommand("UNKNOWNCMD ARGS");
      expect(result.safety).toBe(CommandSafety.CAUTIOUS);
      expect(result.allowed).toBe(true);
    });

    it("classifies MYCUSTOMCMD as CAUTIOUS", () => {
      const result = classifyTsoCommand("MYCUSTOMCMD");
      expect(result.safety).toBe(CommandSafety.CAUTIOUS);
      expect(result.allowed).toBe(true);
    });
  });

  describe("case insensitivity", () => {
    it("classifies lowercase listds as SAFE", () => {
      const result = classifyTsoCommand("listds");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies uppercase LISTDS as SAFE", () => {
      const result = classifyTsoCommand("LISTDS");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies mixed case Listds as SAFE", () => {
      const result = classifyTsoCommand("Listds");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies mixed case LiStCaT as SAFE", () => {
      const result = classifyTsoCommand("LiStCaT");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies lowercase delete as BLOCKED", () => {
      const result = classifyTsoCommand("delete 'HLQ.DS'");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });
  });
});

describe("classifyConsoleCommand", () => {
  describe("SAFE console commands", () => {
    it("classifies D T as SAFE", () => {
      const result = classifyConsoleCommand("D T");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies D A as SAFE", () => {
      const result = classifyConsoleCommand("D A");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies DISPLAY A as SAFE", () => {
      const result = classifyConsoleCommand("DISPLAY A");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies D TS as SAFE", () => {
      const result = classifyConsoleCommand("D TS");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });

    it("classifies D IPLINFO as SAFE", () => {
      const result = classifyConsoleCommand("D IPLINFO");
      expect(result.safety).toBe(CommandSafety.SAFE);
      expect(result.allowed).toBe(true);
    });
  });

  describe("BLOCKED console commands", () => {
    it("classifies CANCEL as BLOCKED", () => {
      const result = classifyConsoleCommand("CANCEL JOBNAME");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies FORCE as BLOCKED", () => {
      const result = classifyConsoleCommand("FORCE JOBNAME");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies STOP as BLOCKED", () => {
      const result = classifyConsoleCommand("STOP CICS");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies VARY x OFFLINE as BLOCKED", () => {
      const result = classifyConsoleCommand("VARY 0A1 OFFLINE");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies Z EOD as BLOCKED", () => {
      const result = classifyConsoleCommand("Z EOD");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });

    it("classifies QUIESCE as BLOCKED", () => {
      const result = classifyConsoleCommand("QUIESCE");
      expect(result.safety).toBe(CommandSafety.BLOCKED);
      expect(result.allowed).toBe(false);
    });
  });

  describe("unknown console commands default to CAUTIOUS", () => {
    it("classifies unknown command as CAUTIOUS", () => {
      const result = classifyConsoleCommand("SOMECMD ARGS");
      expect(result.safety).toBe(CommandSafety.CAUTIOUS);
      expect(result.allowed).toBe(true);
    });
  });
});
