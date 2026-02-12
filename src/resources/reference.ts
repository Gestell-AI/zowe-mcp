import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResources(server: McpServer): void {

  server.registerResource(
    "dataset-types",
    "zos://reference/dataset-types",
    {
      description: "Reference guide for z/OS dataset types and organizations",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{
        uri: "zos://reference/dataset-types",
        mimeType: "text/markdown",
        text: DATASET_TYPES_REFERENCE
      }]
    })
  );

  server.registerResource(
    "jcl-basics",
    "zos://reference/jcl-basics",
    {
      description: "Quick reference for Job Control Language (JCL) syntax and common patterns",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{
        uri: "zos://reference/jcl-basics",
        mimeType: "text/markdown",
        text: JCL_BASICS_REFERENCE
      }]
    })
  );

  server.registerResource(
    "cobol-structure",
    "zos://reference/cobol-structure",
    {
      description: "Reference guide for COBOL program structure and divisions",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{
        uri: "zos://reference/cobol-structure",
        mimeType: "text/markdown",
        text: COBOL_STRUCTURE_REFERENCE
      }]
    })
  );

  server.registerResource(
    "abend-codes",
    "zos://reference/abend-codes",
    {
      description: "Quick reference for common z/OS system and user ABEND codes",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{
        uri: "zos://reference/abend-codes",
        mimeType: "text/markdown",
        text: ABEND_CODES_REFERENCE
      }]
    })
  );

  server.registerResource(
    "zowe-cli",
    "zos://reference/zowe-cli",
    {
      description: "Quick reference for common Zowe CLI commands",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{
        uri: "zos://reference/zowe-cli",
        mimeType: "text/markdown",
        text: ZOWE_CLI_REFERENCE
      }]
    })
  );
}

const DATASET_TYPES_REFERENCE = `# z/OS Dataset Types Reference

## Dataset Organizations

### PS (Physical Sequential)
- Linear sequence of records
- Read/written sequentially from beginning to end
- Common for: log files, report output, sequential data files
- Similar to: flat files in Unix/Windows

### PO (Partitioned Organization) - PDS/PDSE
- Like a directory containing multiple members
- Each member is accessed by name (up to 8 characters)
- Common for: source code libraries, JCL libraries, load modules
- Similar to: a folder containing multiple files

**PDS vs PDSE:**
- PDS: Original format, has space management issues
- PDSE: Extended format, better space reuse, recommended

### VSAM (Virtual Storage Access Method)
- **KSDS** (Key-Sequenced): Records accessed by key, like an indexed database
- **ESDS** (Entry-Sequenced): Records in entry order, like a log
- **RRDS** (Relative Record): Records accessed by number
- **LDS** (Linear): Byte-stream, often used for DB2

## Record Formats

| RECFM | Meaning |
|-------|---------|
| F | Fixed-length records |
| FB | Fixed Blocked (multiple records per block) |
| V | Variable-length records |
| VB | Variable Blocked |
| U | Undefined (load modules) |

## Common Dataset Naming Conventions

| Pattern | Typical Use |
|---------|-------------|
| userid.COBOL | COBOL source library |
| userid.COPYBOOK | Shared copybooks |
| userid.JCL | Job control library |
| userid.LOADLIB | Executable programs |
| userid.DATA.* | Data files |
| PROD.*.MASTER | Production master files |

## Key Attributes

- **LRECL**: Logical Record Length (bytes per record)
- **BLKSIZE**: Block Size (bytes per physical block)
- **DSORG**: Dataset Organization (PS, PO, VS)
- **VOL**: Volume serial where dataset resides
`;

const JCL_BASICS_REFERENCE = `# JCL (Job Control Language) Quick Reference

## Basic Structure

\`\`\`jcl
//JOBNAME  JOB (accounting),'description',CLASS=A,MSGCLASS=X
//*
//* Comments start with //*
//*
//STEP01   EXEC PGM=programname
//ddname   DD DSN=dataset.name,DISP=SHR
\`\`\`

## JOB Statement
\`\`\`jcl
//MYJOB    JOB (ACCT),'MY JOB',
//         CLASS=A,           Job class (scheduling priority)
//         MSGCLASS=X,        Output class for job log
//         MSGLEVEL=(1,1),    Message detail level
//         NOTIFY=&SYSUID     Notify user when complete
\`\`\`

## EXEC Statement
\`\`\`jcl
//STEP01   EXEC PGM=MYPROG           Execute a program
//STEP02   EXEC PROC=MYPROC          Execute a procedure
//STEP03   EXEC PGM=SORT,PARM='...'  Pass parameters
\`\`\`

## DD Statement (Data Definition)

### DISP Parameter
\`\`\`
DISP=(status,normal-end,abnormal-end)

Status:      NEW, OLD, SHR, MOD
Normal-end:  DELETE, KEEP, PASS, CATLG, UNCATLG
Abnormal:    DELETE, KEEP, CATLG, UNCATLG
\`\`\`

### Common DD Patterns
\`\`\`jcl
//INPUT    DD DSN=MY.INPUT.FILE,DISP=SHR              Read existing
//OUTPUT   DD DSN=MY.OUTPUT.FILE,                     Create new
//            DISP=(NEW,CATLG,DELETE),
//            SPACE=(CYL,(5,2)),
//            DCB=(RECFM=FB,LRECL=80,BLKSIZE=27920)
//SYSPRINT DD SYSOUT=*                                Print to spool
//SYSIN    DD *                                       Inline data
  inline data here
/*
\`\`\`

## Condition Codes and COND Parameter
\`\`\`jcl
//STEP02   EXEC PGM=PROG2,COND=(4,LT)     Skip if RC < 4
//STEP03   EXEC PGM=PROG3,COND=(0,NE)     Skip if RC != 0
\`\`\`

## Common Utilities

| Program | Purpose |
|---------|---------|
| IEFBR14 | Do nothing (create/delete datasets) |
| IEBGENER | Copy sequential datasets |
| IEBCOPY | Copy PDS members |
| SORT | Sort and merge data |
| IDCAMS | VSAM utility |
`;

const COBOL_STRUCTURE_REFERENCE = `# COBOL Program Structure Reference

## Four Divisions

### 1. IDENTIFICATION DIVISION (Required)
\`\`\`cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MYPROG.
       AUTHOR. DEVELOPER-NAME.
       DATE-WRITTEN. 2024-01-15.
\`\`\`

### 2. ENVIRONMENT DIVISION
\`\`\`cobol
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INFILE ASSIGN TO INPUTDD
               FILE STATUS IS WS-FILE-STATUS.
\`\`\`

### 3. DATA DIVISION
\`\`\`cobol
       DATA DIVISION.
       FILE SECTION.
       FD  INFILE.
       01  INPUT-RECORD           PIC X(80).

       WORKING-STORAGE SECTION.
       01  WS-VARIABLES.
           05 WS-COUNTER          PIC 9(5) VALUE 0.
           05 WS-AMOUNT           PIC 9(7)V99 VALUE 0.
           05 WS-NAME             PIC X(30) VALUE SPACES.
           05 WS-FILE-STATUS      PIC XX.

       LINKAGE SECTION.
       01  LS-PARM                PIC X(100).
\`\`\`

### 4. PROCEDURE DIVISION
\`\`\`cobol
       PROCEDURE DIVISION.
       0000-MAIN.
           PERFORM 1000-INITIALIZE
           PERFORM 2000-PROCESS UNTIL END-OF-FILE
           PERFORM 9000-TERMINATE
           STOP RUN.

       1000-INITIALIZE.
           OPEN INPUT INFILE.

       2000-PROCESS.
           READ INFILE
               AT END SET END-OF-FILE TO TRUE
           END-READ.
\`\`\`

## PICTURE Clause Quick Reference

| Pattern | Meaning | Example |
|---------|---------|---------|
| 9 | Numeric digit | PIC 9(5) = 5 digits |
| X | Alphanumeric | PIC X(10) = 10 chars |
| A | Alphabetic | PIC A(5) = 5 letters |
| V | Implied decimal | PIC 9(5)V99 = 99999.99 |
| S | Signed | PIC S9(5) = -99999 to +99999 |

## Common Verbs

| Verb | Purpose |
|------|---------|
| MOVE | Copy data between fields |
| COMPUTE | Arithmetic operations |
| PERFORM | Call a paragraph/section |
| IF/EVALUATE | Conditional logic |
| READ/WRITE | File I/O |
| CALL | Call another program |
| STRING/UNSTRING | String manipulation |
| INSPECT | Character inspection/replacement |

## Level Numbers

| Level | Usage |
|-------|-------|
| 01 | Record or group item |
| 02-49 | Subordinate items |
| 66 | RENAMES clause |
| 77 | Independent items |
| 88 | Condition names (flags) |
`;

const ABEND_CODES_REFERENCE = `# Common z/OS ABEND Codes Quick Reference

## System ABENDs (Sxxx)

| Code | Name | Common Cause |
|------|------|--------------|
| S0C1 | Operation Exception | Invalid instruction, bad branch |
| S0C4 | Protection Exception | Invalid memory access, bad pointer |
| S0C7 | Data Exception | Invalid packed decimal data |
| S013 | Open Error | Dataset not found or DCB mismatch |
| S222 | Operator Cancel | Job cancelled by operator |
| S322 | Time Exceeded | CPU time limit exceeded |
| S806 | Module Not Found | Program/module not in load library |
| S837 | End of Volume | Dataset out of space |
| SB37 | No Space | Primary/secondary allocation exhausted |
| SD37 | No Space | No secondary space available |
| SE37 | No Space | Maximum extents reached |

## User ABENDs (Uxxx)

User ABENDs are defined by applications. Common ones:

| Code | Typical Meaning |
|------|-----------------|
| U0001-U0999 | Application-defined errors |
| U1026 | CICS transaction abend |
| U4038 | DB2 connection error |

## Return Codes (Condition Codes)

| RC | Severity | Meaning |
|----|----------|---------|
| 0 | Info | Success |
| 4 | Warning | Minor issues, output may be OK |
| 8 | Error | Significant problems |
| 12 | Severe | Major errors |
| 16+ | Critical | Fatal errors |

## Common IEC Messages (I/O Errors)

| Prefix | Area |
|--------|------|
| IEC | Data management |
| IEF | Job management |
| IGD | SMS/DFSMS |
| IEA | Supervisor |
| IGG | Data access method |

## Debugging Tips

1. **Check the PSW address** - shows where the error occurred
2. **Look at register contents** - especially R14 (return) and R15 (entry/RC)
3. **Review the SYSUDUMP/SYSABEND** - memory dump for analysis
4. **Check DD statements** - ensure all required DDs are present
5. **Verify dataset attributes** - RECFM, LRECL, BLKSIZE must match
`;

const ZOWE_CLI_REFERENCE = `# Zowe CLI Quick Reference

## Profile Setup
\`\`\`bash
# Create a z/OSMF profile
zowe profiles create zosmf-profile myprofile \\
  --host mainframe.example.com \\
  --port 443 \\
  --user MYUSER \\
  --password ****

# Set as default
zowe profiles set-default zosmf myprofile
\`\`\`

## Dataset Commands
\`\`\`bash
# List datasets
zowe zos-files list ds "HLQ"
zowe zos-files list ds "HLQ.COBOL.*"

# List members
zowe zos-files list all-members "HLQ.COBOL"

# View dataset/member
zowe zos-files view ds "HLQ.COBOL(MYPROG)"

# Download/upload
zowe zos-files download ds "HLQ.DATA" -f local.txt
zowe zos-files upload ftds local.txt "HLQ.DATA"
\`\`\`

## Job Commands
\`\`\`bash
# List jobs
zowe zos-jobs list jobs
zowe zos-jobs list jobs --owner MYUSER --prefix PAY*

# Submit job
zowe zos-jobs submit ds "HLQ.JCL(MYJOB)"

# View job status
zowe zos-jobs view job-status-by-jobid JOB00123

# View spool output
zowe zos-jobs view all-spool-content --jobid JOB00123
\`\`\`

## TSO Commands
\`\`\`bash
# Issue TSO command
zowe zos-tso issue command "LISTDS 'HLQ.COBOL'"
zowe zos-tso issue command "STATUS"
\`\`\`

## Console Commands
\`\`\`bash
# Issue MVS console command
zowe zos-console issue command "D A"       # Display activity
zowe zos-console issue command "D TS,L"    # Display TSO users
\`\`\`

## USS (Unix System Services)
\`\`\`bash
# List files
zowe zos-files list uss "/u/myuser"

# View file
zowe zos-files view uss "/u/myuser/script.sh"
\`\`\`

## Output Formats
\`\`\`bash
# JSON output for scripting
zowe zos-jobs list jobs --rfj

# Table format (default)
zowe zos-files list ds "HLQ"
\`\`\`

## Useful Options
| Option | Description |
|--------|-------------|
| --rfj | Response Format JSON |
| --help | Show command help |
| --zosmf-profile | Use specific profile |
| -d, --debug | Show debug output |
`;
