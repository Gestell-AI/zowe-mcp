import { describe, it, expect } from "vitest";
import {
  explainError,
  analyzeJobOutput,
  ABEND_CODES,
  RETURN_CODES
} from "../../src/services/error-reference.js";

describe("explainError", () => {
  describe("known ABEND codes", () => {
    it("explains S0C7 (Data Exception)", () => {
      const explanation = explainError("S0C7");
      expect(explanation).toContain("S0C7");
      expect(explanation).toContain("Data Exception");
      expect(explanation).toContain("packed decimal");
      expect(explanation).toContain("Common Causes");
      expect(explanation).toContain("Recommended Actions");
    });

    it("explains S0C4 (Protection Exception)", () => {
      const explanation = explainError("S0C4");
      expect(explanation).toContain("S0C4");
      expect(explanation).toContain("Protection Exception");
      expect(explanation).toContain("storage");
    });

    it("explains S0C1 (Operation Exception)", () => {
      const explanation = explainError("S0C1");
      expect(explanation).toContain("S0C1");
      expect(explanation).toContain("Operation Exception");
      expect(explanation).toContain("invalid instruction");
    });

    it("explains S806 (Module Not Found)", () => {
      const explanation = explainError("S806");
      expect(explanation).toContain("S806");
      expect(explanation).toContain("Module Not Found");
      expect(explanation).toContain("load module");
    });

    it("explains S013 (Open Error)", () => {
      const explanation = explainError("S013");
      expect(explanation).toContain("S013");
      expect(explanation).toContain("Open Error");
    });

    it("explains S222 (Job Cancelled)", () => {
      const explanation = explainError("S222");
      expect(explanation).toContain("S222");
      expect(explanation).toContain("Cancel");
    });

    it("explains S322 (Time Exceeded)", () => {
      const explanation = explainError("S322");
      expect(explanation).toContain("S322");
      expect(explanation).toContain("Time");
    });

    it("explains SB37 (No Space)", () => {
      const explanation = explainError("SB37");
      expect(explanation).toContain("SB37");
      expect(explanation).toContain("Space");
    });
  });

  describe("ABEND prefix variations", () => {
    it("handles ABEND S0C7 format", () => {
      const explanation = explainError("ABEND S0C7");
      expect(explanation).toContain("S0C7");
      expect(explanation).toContain("Data Exception");
    });

    it("handles ABEND with space", () => {
      const explanation = explainError("ABEND S0C4");
      expect(explanation).toContain("S0C4");
      expect(explanation).toContain("Protection Exception");
    });

    it("handles lowercase abend", () => {
      const explanation = explainError("abend s0c7");
      expect(explanation).toContain("S0C7");
    });
  });

  describe("known return codes", () => {
    it("explains CC 0000 (success)", () => {
      const explanation = explainError("CC 0000");
      expect(explanation).toContain("0000");
      expect(explanation).toContain("Successful");
    });

    it("explains CC 0004 (warning)", () => {
      const explanation = explainError("CC 0004");
      expect(explanation).toContain("0004");
      expect(explanation).toContain("Warning");
    });

    it("explains CC 0008 (error)", () => {
      const explanation = explainError("CC 0008");
      expect(explanation).toContain("0008");
      expect(explanation).toContain("Error");
    });

    it("explains CC 0012 (severe)", () => {
      const explanation = explainError("CC 0012");
      expect(explanation).toContain("0012");
      expect(explanation).toContain("Severe");
    });

    it("explains CC 0016 (terminal)", () => {
      const explanation = explainError("CC 0016");
      expect(explanation).toContain("0016");
      expect(explanation).toContain("Terminal");
    });

    it("explains CC 0020 (critical)", () => {
      const explanation = explainError("CC 0020");
      expect(explanation).toContain("0020");
      expect(explanation).toContain("Critical");
    });

    it("handles bare return code without CC prefix", () => {
      const explanation = explainError("0004");
      expect(explanation).toContain("Warning");
    });
  });

  describe("unknown codes", () => {
    it("returns graceful message for unknown ABEND", () => {
      const explanation = explainError("S999");
      expect(explanation).toContain("No explanation available");
      expect(explanation).toContain("S999");
    });

    it("returns graceful message for unknown return code", () => {
      const explanation = explainError("CC 9999");
      expect(explanation).toContain("No explanation available");
    });

    it("returns graceful message for garbage input", () => {
      const explanation = explainError("XYZABC");
      expect(explanation).toContain("No explanation available");
    });

    it("does not throw for unknown codes", () => {
      expect(() => explainError("UNKNOWN")).not.toThrow();
      expect(() => explainError("")).not.toThrow();
      expect(() => explainError("   ")).not.toThrow();
    });
  });
});

describe("analyzeJobOutput", () => {
  describe("detects ABEND patterns", () => {
    it("finds ABEND S0C7 in spool output", () => {
      const spool = `
        IEF142I MYJOB STEP010 - STEP WAS EXECUTED
        ABEND S0C7 IN STEP020
        IEA995I SYMPTOM DUMP OUTPUT
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some((f) => f.includes("S0C7"))).toBe(true);
    });

    it("finds SYSTEM COMPLETION CODE pattern", () => {
      const spool = `
        SYSTEM COMPLETION CODE=0C7  REASON CODE=00000004
        DATA AT PSW  07854002
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some((f) => f.includes("Data Exception") || f.includes("S0C7"))).toBe(true);
    });

    it("finds multiple ABENDs", () => {
      const spool = `
        ABEND S0C7 IN STEP010
        ABEND S0C4 IN STEP020
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("detects condition codes", () => {
    it("finds non-zero COND CODE", () => {
      const spool = `
        IEF142I MYJOB STEP010 - STEP WAS EXECUTED - COND CODE 0012
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some((f) => f.includes("0012") || f.includes("Severe"))).toBe(true);
    });

    it("ignores COND CODE 0000 (success)", () => {
      const spool = `
        IEF142I MYJOB STEP010 - STEP WAS EXECUTED - COND CODE 0000
        IEF142I MYJOB STEP020 - STEP WAS EXECUTED - COND CODE 0000
      `;
      const findings = analyzeJobOutput(spool);
      const nonZeroFindings = findings.filter((f) => f.includes("Return Code"));
      expect(nonZeroFindings.length).toBe(0);
    });

    it("finds COND CODE 0004 warning", () => {
      const spool = `
        IEF142I MYJOB STEP010 - STEP WAS EXECUTED - COND CODE 0004
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.some((f) => f.includes("Warning") || f.includes("0004"))).toBe(true);
    });
  });

  describe("detects I/O error messages", () => {
    it("detects IEC messages", () => {
      const spool = `
        IEC141I 013-14,IGG0191A,MYJOB,STEP010
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.some((f) => f.includes("I/O Error"))).toBe(true);
    });

    it("detects IGD messages", () => {
      const spool = `
        IGD103I SMS ALLOCATED TO DATA SET
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.some((f) => f.includes("SMS") || f.includes("DFSMS"))).toBe(true);
    });
  });

  describe("returns empty for clean output", () => {
    it("returns empty array for successful job", () => {
      const spool = `
        IEF142I MYJOB STEP010 - STEP WAS EXECUTED - COND CODE 0000
        IEF142I MYJOB STEP020 - STEP WAS EXECUTED - COND CODE 0000
        IEF144I MYJOB - STEP WAS EXECUTED - COND CODE 0000
        - JOB MYJOB ENDED SUCCESSFULLY
      `;
      const findings = analyzeJobOutput(spool);
      expect(findings.length).toBe(0);
    });

    it("returns empty array for empty input", () => {
      const findings = analyzeJobOutput("");
      expect(findings.length).toBe(0);
    });
  });
});

describe("ABEND_CODES constant", () => {
  it("contains all documented ABEND codes", () => {
    const expectedCodes = ["S0C1", "S0C4", "S0C7", "S013", "S222", "S322", "S806", "SB37"];
    expectedCodes.forEach((code) => {
      expect(ABEND_CODES).toHaveProperty(code);
    });
  });

  it("each ABEND has required fields", () => {
    Object.entries(ABEND_CODES).forEach(([code, info]) => {
      expect(info).toHaveProperty("name");
      expect(info).toHaveProperty("description");
      expect(info).toHaveProperty("commonCauses");
      expect(info).toHaveProperty("actions");
      expect(Array.isArray(info.commonCauses)).toBe(true);
      expect(Array.isArray(info.actions)).toBe(true);
      expect(info.commonCauses.length).toBeGreaterThan(0);
      expect(info.actions.length).toBeGreaterThan(0);
    });
  });
});

describe("RETURN_CODES constant", () => {
  it("contains all documented return codes", () => {
    const expectedCodes = ["0000", "0004", "0008", "0012", "0016", "0020"];
    expectedCodes.forEach((code) => {
      expect(RETURN_CODES).toHaveProperty(code);
    });
  });

  it("each return code has required fields", () => {
    Object.entries(RETURN_CODES).forEach(([code, info]) => {
      expect(info).toHaveProperty("meaning");
      expect(info).toHaveProperty("severity");
      expect(typeof info.meaning).toBe("string");
      expect(typeof info.severity).toBe("string");
    });
  });
});
