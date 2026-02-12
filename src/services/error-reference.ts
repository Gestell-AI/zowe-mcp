/**
 * Common z/OS abend codes and their explanations.
 * This gives the AI contextual understanding of mainframe errors.
 */
export const ABEND_CODES: Record<string, { name: string; description: string; commonCauses: string[]; actions: string[] }> = {
  "S0C1": {
    name: "Operation Exception",
    description: "The CPU attempted to execute an invalid instruction.",
    commonCauses: [
      "Program branched to a data area instead of executable code",
      "Missing or corrupt load module",
      "Incorrect CALL statement or linkage",
      "Overlay of instructions by data"
    ],
    actions: [
      "Check the PSW address at time of abend",
      "Verify the load module exists and is not corrupted",
      "Review CALL statements and linkage conventions",
      "Check for subscript or index errors that could overlay code"
    ]
  },
  "S0C4": {
    name: "Protection Exception",
    description: "The program attempted to access storage it does not have permission to use.",
    commonCauses: [
      "Addressing beyond allocated storage",
      "Invalid pointer or base register",
      "Subscript out of range in COBOL table",
      "WORKING-STORAGE overlay",
      "Attempting to write to read-only storage"
    ],
    actions: [
      "Check subscript and index values",
      "Verify WORKING-STORAGE is large enough",
      "Review pointer operations",
      "Check that DD statements match program expectations"
    ]
  },
  "S0C7": {
    name: "Data Exception",
    description: "A packed decimal field contains invalid (non-numeric) data.",
    commonCauses: [
      "Uninitialized WORKING-STORAGE fields",
      "Reading character data into numeric fields",
      "Input file has unexpected data format",
      "Missing INITIALIZE statement for group items",
      "Copybook mismatch between programs"
    ],
    actions: [
      "Add INITIALIZE statements for all numeric fields before use",
      "Verify input file record layout matches the copybook",
      "Check that the correct file is being read",
      "Use a hex dump to examine the failing field",
      "Verify the PICTURE clause matches the actual data"
    ]
  },
  "S013": {
    name: "Open Error",
    description: "A dataset could not be opened. The specific reason depends on the return code.",
    commonCauses: [
      "Dataset does not exist (S013-14)",
      "Member not found in PDS (S013-18)",
      "DCB mismatch between JCL and program",
      "Dataset in use by another job",
      "Insufficient RACF authority"
    ],
    actions: [
      "Verify the dataset exists with LISTDS or LISTCAT",
      "Check that the member name is spelled correctly",
      "Verify DCB parameters (RECFM, LRECL, BLKSIZE) match",
      "Check if another job has the dataset allocated exclusively"
    ]
  },
  "S222": {
    name: "Job Cancelled by Operator",
    description: "The job was cancelled by an operator or by the system.",
    commonCauses: [
      "Operator issued CANCEL command",
      "Job exceeded time limit",
      "Job was consuming too many resources",
      "Job was in a wait state too long"
    ],
    actions: [
      "Check with operations for reason of cancellation",
      "Review TIME parameter on JOB/EXEC cards",
      "Check for infinite loops in program logic"
    ]
  },
  "S322": {
    name: "Time Limit Exceeded",
    description: "The job or step exceeded its CPU time limit.",
    commonCauses: [
      "Infinite loop in program",
      "TIME parameter too small for the workload",
      "Unexpected data volume causing longer processing",
      "I/O wait not counted but real time exceeded"
    ],
    actions: [
      "Increase TIME parameter on JOB or EXEC statement",
      "Review program logic for infinite loops",
      "Check if input data volume has grown significantly",
      "Profile the program to find performance bottlenecks"
    ]
  },
  "S806": {
    name: "Module Not Found",
    description: "A load module could not be found in any library in the search order.",
    commonCauses: [
      "Module name misspelled in EXEC PGM=",
      "STEPLIB/JOBLIB does not include the correct library",
      "Module was not linked/bound successfully",
      "Library concatenation order is incorrect"
    ],
    actions: [
      "Verify the module name on the EXEC statement",
      "Check STEPLIB/JOBLIB DD statements",
      "Verify the link-edit step completed with RC=0",
      "Use LISTDS to check the load library for the member"
    ]
  },
  "SB37": {
    name: "End of Volume - No More Space",
    description: "The dataset ran out of space and no more volumes are available for extension.",
    commonCauses: [
      "SPACE parameter too small",
      "Secondary allocation exhausted",
      "No more volumes available in storage group",
      "Unexpected data growth"
    ],
    actions: [
      "Increase primary and secondary SPACE allocation",
      "Add more volumes to the storage group",
      "Review if the output data volume is expected",
      "Consider using SMS-managed storage with automatic extension"
    ]
  }
};

/**
 * Common JCL return codes and their meanings.
 */
export const RETURN_CODES: Record<string, { meaning: string; severity: string }> = {
  "0000": { meaning: "Successful completion. No errors.", severity: "info" },
  "0004": { meaning: "Warning. The step completed but with minor issues (e.g., informational messages, empty input files).", severity: "warning" },
  "0008": { meaning: "Error. The step completed but significant problems occurred. Output may be incomplete or unreliable.", severity: "error" },
  "0012": { meaning: "Severe error. The step encountered a serious problem. Common with SORT, utilities, and compilers.", severity: "error" },
  "0016": { meaning: "Terminal error. The step could not complete its function.", severity: "critical" },
  "0020": { meaning: "Critical failure. Often indicates a missing DD statement or catastrophic input error.", severity: "critical" }
};

/**
 * Look up an error code and return a human-readable explanation.
 */
export function explainError(code: string): string {
  const upper = code.toUpperCase().trim();

  if (upper.startsWith("S") || upper.startsWith("ABEND")) {
    const abendCode = upper.replace(/^ABEND\s*/, "");
    const info = ABEND_CODES[abendCode];
    if (info) {
      return [
        `**${abendCode} - ${info.name}**`,
        ``,
        info.description,
        ``,
        `**Common Causes:**`,
        ...info.commonCauses.map(c => `- ${c}`),
        ``,
        `**Recommended Actions:**`,
        ...info.actions.map(a => `- ${a}`)
      ].join("\n");
    }
  }

  const ccMatch = upper.match(/^(?:CC\s*)?(\d{4})$/);
  if (ccMatch) {
    const rc = ccMatch[1];
    const info = RETURN_CODES[rc];
    if (info) {
      return `**Return Code ${rc}** (${info.severity}): ${info.meaning}`;
    }
  }

  return `No explanation available for code: ${code}. Try looking it up in the IBM Knowledge Center.`;
}

/**
 * Analyze job output for errors and provide explanations.
 */
export function analyzeJobOutput(output: string): string[] {
  const findings: string[] = [];

  const abendMatch = output.match(/ABEND\s+(S[0-9A-F]{3,4})/gi);
  if (abendMatch) {
    for (const match of abendMatch) {
      const code = match.replace(/ABEND\s+/i, "");
      findings.push(explainError(code));
    }
  }

  const sccMatch = output.match(/SYSTEM COMPLETION CODE=([0-9A-F]+)/gi);
  if (sccMatch) {
    for (const match of sccMatch) {
      const code = "S" + match.replace(/SYSTEM COMPLETION CODE=/i, "");
      findings.push(explainError(code));
    }
  }

  const ccMatch = output.match(/COND CODE (\d{4})/gi);
  if (ccMatch) {
    for (const match of ccMatch) {
      const code = match.replace(/COND CODE /i, "");
      if (code !== "0000") {
        findings.push(explainError(code));
      }
    }
  }

  if (output.match(/IEC\d{3}I/)) {
    findings.push("**I/O Error detected**: An IEC-series message indicates a data management or I/O error. Check the DD statement and dataset allocation.");
  }

  if (output.match(/IGD\d{3}I/)) {
    findings.push("**SMS/DFSMS message detected**: Check storage management and dataset allocation parameters.");
  }

  return findings;
}
