import { ZoweResult } from '@gestell/mcp/services/zowe-executor'

/**
 * Provides realistic mock responses for Zowe CLI commands.
 * Used for demos and development without a live z/OS system.
 */
export function getMockResponse(command: string, args: string[]): ZoweResult {
  const fullCommand = `${command} ${args.join(' ')}`.trim()

  if (fullCommand.startsWith('zos-jobs list jobs')) return mockListJobs(args)
  if (fullCommand.startsWith('zos-jobs view job-status-by-jobid')) return mockJobStatus(args)
  if (fullCommand.startsWith('zos-jobs list spool-files-by-jobid')) return mockListSpoolFiles(args)
  if (fullCommand.startsWith('zos-jobs view spool-file-by-id') || fullCommand.startsWith('zos-jobs view all-spool-content')) return mockSpoolContent(args)
  if (fullCommand.startsWith('zos-jobs submit')) return mockSubmitJob(args)
  if (fullCommand.startsWith('zos-files list ds') || fullCommand.startsWith('zos-files list data-set')) return mockListDatasets(args)
  if (fullCommand.startsWith('zos-files list all-members')) return mockListMembers(args)
  if (fullCommand.startsWith('zos-files upload file-to-data-set')) return mockUploadFileToDataset(args)
  if (fullCommand.startsWith('zos-files upload dir-to-pds')) return mockUploadDirectoryToPds(args)
  if (fullCommand.startsWith('zos-files list uss')) return mockListUssFiles(args)
  if (fullCommand.startsWith('zos-files view uss')) return mockViewUssFile(args)
  if (
    fullCommand.startsWith('zos-files view ds') ||
    fullCommand.startsWith('zos-files view data-set') ||
    fullCommand.startsWith('zos-files view uss')
  ) return mockViewDataset(args)
  if (fullCommand.startsWith('zos-tso issue command')) return mockTsoCommand(args)
  if (fullCommand.startsWith('zos-console issue command')) return mockConsoleCommand(args)
  if (fullCommand.startsWith('db2 execute sql')) return mockDb2ExecuteSql(args)

  return { success: false, stdout: '', stderr: `Mock mode: No mock data for command: zowe ${fullCommand}`, exitCode: 1 }
}

function mockListJobs(args: string[]): ZoweResult {
  const ownerFilter = extractArg(args, '--owner') || 'DEVUSR1'
  const statusFilter = extractArg(args, '--status')
  const allJobs = [
    { jobid: 'JOB00142', jobname: 'PAYROLL1', owner: ownerFilter, status: 'OUTPUT', retcode: 'CC 0000', type: 'JOB', class: 'A', subsystem: 'JES2' },
    { jobid: 'JOB00158', jobname: 'ACCTUPD',  owner: ownerFilter, status: 'OUTPUT', retcode: 'CC 0000', type: 'JOB', class: 'A', subsystem: 'JES2' },
    { jobid: 'JOB00203', jobname: 'RPTGEN3',  owner: ownerFilter, status: 'OUTPUT', retcode: 'CC 0012', type: 'JOB', class: 'A', subsystem: 'JES2' },
    { jobid: 'JOB00215', jobname: 'DBBACKUP', owner: ownerFilter, status: 'ACTIVE', retcode: null,       type: 'JOB', class: 'A', subsystem: 'JES2' },
    { jobid: 'JOB00301', jobname: 'NIGHTBTC', owner: ownerFilter, status: 'INPUT',  retcode: null,       type: 'JOB', class: 'B', subsystem: 'JES2' },
    { jobid: 'JOB00189', jobname: 'COBOLCMP', owner: ownerFilter, status: 'OUTPUT', retcode: 'CC 0004', type: 'JOB', class: 'A', subsystem: 'JES2' },
    { jobid: 'JOB00245', jobname: 'SORTMRGE', owner: ownerFilter, status: 'OUTPUT', retcode: 'ABEND S0C7', type: 'JOB', class: 'A', subsystem: 'JES2' }
  ]
  const filtered = statusFilter ? allJobs.filter(j => j.status === statusFilter) : allJobs
  const data = { success: true, exitCode: 0, message: '', stdout: '', stderr: '', data: filtered }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockJobStatus(args: string[]): ZoweResult {
  const jobId = extractPositional(args)
  const jobMap: Record<string, object> = {
    'JOB00142': { jobid: 'JOB00142', jobname: 'PAYROLL1', owner: 'DEVUSR1', status: 'OUTPUT', retcode: 'CC 0000', type: 'JOB', class: 'A', subsystem: 'JES2', 'exec-started': '2026-02-10T22:00:03.000Z', 'exec-ended': '2026-02-10T22:01:45.000Z', 'phase-name': 'Job is on the hard copy queue' },
    'JOB00203': { jobid: 'JOB00203', jobname: 'RPTGEN3', owner: 'DEVUSR1', status: 'OUTPUT', retcode: 'CC 0012', type: 'JOB', class: 'A', subsystem: 'JES2', 'exec-started': '2026-02-10T23:15:00.000Z', 'exec-ended': '2026-02-10T23:15:12.000Z', 'phase-name': 'Job is on the hard copy queue' },
    'JOB00245': { jobid: 'JOB00245', jobname: 'SORTMRGE', owner: 'DEVUSR1', status: 'OUTPUT', retcode: 'ABEND S0C7', type: 'JOB', class: 'A', subsystem: 'JES2', 'exec-started': '2026-02-11T01:00:00.000Z', 'exec-ended': '2026-02-11T01:00:03.000Z', 'phase-name': 'Job is on the hard copy queue' }
  }
  const job = jobMap[jobId || ''] || jobMap['JOB00142']
  const data = { success: true, exitCode: 0, message: '', data: job }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockListSpoolFiles(args: string[]): ZoweResult {
  const jobId = extractPositional(args) || 'JOB00142'
  const items = [
    { id: 1, ddname: 'JESMSGLG', stepname: 'JES2', procstep: '', records: 120 },
    { id: 2, ddname: 'JESJCL', stepname: 'JES2', procstep: '', records: 55 },
    { id: 3, ddname: 'JESYSMSG', stepname: 'JES2', procstep: '', records: 210 },
    { id: 4, ddname: 'SYSPRINT', stepname: 'COMPILE', procstep: '', records: 160 },
    { id: 5, ddname: 'SYSPRINT', stepname: 'LINK', procstep: '', records: 95 }
  ]
  const data = {
    success: true,
    exitCode: 0,
    message: '',
    data: {
      jobid: jobId,
      items
    }
  }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockSpoolContent(args: string[]): ZoweResult {
  const jobId = extractArg(args, '--jobid') || extractPositional(args)
  if (jobId === 'JOB00245') {
    return { success: true, stdout: `1 J E S 2  J O B  L O G  --  S Y S T E M  S Y S 1  --  N O D E  N 1
-                                 --- JOB JOB00245 ---
-                                 ---    SORTMRGE ---
 IEF236I ALLOC. FOR SORTMRGE STEP010
 IEF237I DMY  ALLOCATED TO SORTIN
 IEF237I DMY  ALLOCATED TO SORTOUT
 IEF142I SORTMRGE STEP010 - STEP WAS EXECUTED - COND CODE 0000
 IGD104I PROD.TRANS.INPUT                     RETAINED
 IEF285I   PROD.TRANS.INPUT                     KEPT
 IEF285I   VOL SER NOS= USR001.
 IEC020I 001-4,IGG019FA,SORTMRGE,STEP020,SORTIN
 IEA995I SYMPTOM DUMP OUTPUT
   SYSTEM COMPLETION CODE=0C7  REASON CODE=00000004
   DATA AT PSW  07854002 - C4D3F0F1 00C0E2D6 D9E3C9D5
   THE ABEND S0C7 INDICATES A DATA EXCEPTION.
   A PACKED DECIMAL FIELD CONTAINS INVALID DATA.
   REVIEW THE INPUT FILE FOR NON-NUMERIC DATA IN NUMERIC FIELDS.`, stderr: '', exitCode: 0 }
  }
  if (jobId === 'JOB00203') {
    return { success: true, stdout: `1 J E S 2  J O B  L O G  --  S Y S T E M  S Y S 1  --  N O D E  N 1
-                                 --- JOB JOB00203 ---
-                                 ---    RPTGEN3  ---
 IEF236I ALLOC. FOR RPTGEN3 STEP010
 IEF237I 0A1  ALLOCATED TO SYSPRINT
 IEF142I RPTGEN3 STEP010 - STEP WAS EXECUTED - COND CODE 0000
 IEF142I RPTGEN3 STEP020 - STEP WAS EXECUTED - COND CODE 0012
 IEF453I RPTGEN3 STEP020 - ENDED BY CC 0012
 IGD17001I ACCESS ERROR ON PROD.REPORT.OUTPUT
   THE DATA SET COULD NOT BE OPENED FOR OUTPUT.
   CHECK THAT THE DATASET EXISTS AND YOU HAVE WRITE ACCESS.
   RC=0012 INDICATES THE SORT UTILITY ENCOUNTERED AN INPUT ERROR.`, stderr: '', exitCode: 0 }
  }
  return { success: true, stdout: `1 J E S 2  J O B  L O G  --  S Y S T E M  S Y S 1  --  N O D E  N 1
-                                 --- JOB ${jobId || 'JOB00142'} ---
 IEF236I ALLOC. FOR PAYROLL1 STEP010
 IEF237I 0A1  ALLOCATED TO SYSPRINT
 IEF142I PAYROLL1 STEP010 - STEP WAS EXECUTED - COND CODE 0000
 IEF142I PAYROLL1 STEP020 - STEP WAS EXECUTED - COND CODE 0000
 IEF142I PAYROLL1 STEP030 - STEP WAS EXECUTED - COND CODE 0000
 IEF144I PAYROLL1 - STEP WAS EXECUTED - COND CODE 0000
 - JOB PAYROLL1 ENDED SUCCESSFULLY`, stderr: '', exitCode: 0 }
}

function mockSubmitJob(args: string[]): ZoweResult {
  const dataset = extractArg(args, '--data-set') || extractPositional(args) || 'DEVUSR1.JCL(PAYROLL1)'
  const data = { success: true, exitCode: 0, message: 'Job submitted successfully.', data: { jobid: 'JOB00350', jobname: dataset.split('(')[1]?.replace(')', '') || 'USERJOB', owner: 'DEVUSR1', status: 'INPUT', retcode: null, type: 'JOB', class: 'A', subsystem: 'JES2' } }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockListDatasets(args: string[]): ZoweResult {
  const pattern = extractPositional(args) || 'DEVUSR1'
  const datasets = [
    { dsname: `${pattern}.COBOL`, dsorg: 'PO', recfm: 'FB', lrecl: 80, blksize: 27920, vol: 'USR001' },
    { dsname: `${pattern}.COBOL.COPYBOOK`, dsorg: 'PO', recfm: 'FB', lrecl: 80, blksize: 27920, vol: 'USR001' },
    { dsname: `${pattern}.JCL`, dsorg: 'PO', recfm: 'FB', lrecl: 80, blksize: 27920, vol: 'USR001' },
    { dsname: `${pattern}.LOADLIB`, dsorg: 'PO', recfm: 'U', lrecl: 0, blksize: 32760, vol: 'USR001' },
    { dsname: `${pattern}.DATA.INPUT`, dsorg: 'PS', recfm: 'FB', lrecl: 120, blksize: 27960, vol: 'USR002' },
    { dsname: `${pattern}.DATA.OUTPUT`, dsorg: 'PS', recfm: 'FB', lrecl: 120, blksize: 27960, vol: 'USR002' },
    { dsname: `${pattern}.CNTL`, dsorg: 'PO', recfm: 'FB', lrecl: 80, blksize: 27920, vol: 'USR001' },
    { dsname: `${pattern}.DB2.DBRM`, dsorg: 'PO', recfm: 'FB', lrecl: 80, blksize: 27920, vol: 'USR001' }
  ]
  const data = { success: true, exitCode: 0, message: '', data: { items: datasets } }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockListMembers(args: string[]): ZoweResult {
  const dataset = extractPositional(args) || ''
  let members: Array<{ member: string }>
  if (dataset.includes('COBOL') && !dataset.includes('COPYBOOK')) {
    members = [{ member: 'PAYROLL' }, { member: 'ACCTUPD' }, { member: 'RPTGEN' }, { member: 'CUSTMNT' }, { member: 'TXNCALC' }, { member: 'BALSHET' }, { member: 'INVPROC' }, { member: 'GLPOST' }]
  } else if (dataset.includes('JCL')) {
    members = [{ member: 'PAYROLL1' }, { member: 'ACCTUPD' }, { member: 'RPTGEN3' }, { member: 'NIGHTBTC' }, { member: 'DBBACKUP' }, { member: 'SORTMRGE' }, { member: 'COBOLCMP' }]
  } else if (dataset.includes('COPYBOOK')) {
    members = [{ member: 'CUSTREC' }, { member: 'TXNREC' }, { member: 'EMPFILE' }, { member: 'ACCTREC' }, { member: 'ERRCODES' }, { member: 'DATFMT' }]
  } else {
    members = [{ member: 'MEMBER1' }, { member: 'MEMBER2' }, { member: 'MEMBER3' }]
  }
  const data = { success: true, exitCode: 0, message: '', data: { items: members } }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockViewDataset(args: string[]): ZoweResult {
  const target = extractPositional(args) || ''
  if (target.includes('PAYROLL') && target.includes('COBOL')) {
    return { success: true, stdout: MOCK_COBOL_PAYROLL, stderr: '', exitCode: 0 }
  }
  if (target.includes('JCL') && target.includes('PAYROLL')) {
    return { success: true, stdout: MOCK_JCL_PAYROLL, stderr: '', exitCode: 0 }
  }
  return { success: true, stdout: `       * SAMPLE MEMBER CONTENT\n       * Dataset: ${target}`, stderr: '', exitCode: 0 }
}

function mockUploadFileToDataset(args: string[]): ZoweResult {
  const [localFile, dataset] = extractPositionals(args)
  return {
    success: true,
    stdout: `Uploaded local file "${localFile || 'local.txt'}" to dataset "${dataset || 'DEVUSR1.JCL(MEMBER)'}".`,
    stderr: '',
    exitCode: 0
  }
}

function mockUploadDirectoryToPds(args: string[]): ZoweResult {
  const [localDir, dataset] = extractPositionals(args)
  return {
    success: true,
    stdout: `Uploaded directory "${localDir || './source'}" to PDS "${dataset || 'DEVUSR1.COBOL'}".`,
    stderr: '',
    exitCode: 0
  }
}

// --- USS MOCK RESPONSES ---

function mockListUssFiles(args: string[]): ZoweResult {
  const path = extractArg(args, '--path') || '/u/devusr1'
  const items = [
    { name: '.', mode: 'drwxr-xr-x', size: 8192, uid: 500, gid: 100, mtime: '2026-02-20T14:30:00' },
    { name: '..', mode: 'drwxr-xr-x', size: 8192, uid: 0, gid: 0, mtime: '2026-01-15T08:00:00' },
    { name: 'scripts', mode: 'drwxr-xr-x', size: 4096, uid: 500, gid: 100, mtime: '2026-02-18T10:15:00' },
    { name: 'config', mode: 'drwxr-xr-x', size: 4096, uid: 500, gid: 100, mtime: '2026-02-15T09:00:00' },
    { name: 'logs', mode: 'drwxr-xr-x', size: 4096, uid: 500, gid: 100, mtime: '2026-02-20T14:30:00' },
    { name: 'java', mode: 'drwxr-xr-x', size: 4096, uid: 500, gid: 100, mtime: '2026-02-10T16:00:00' },
    { name: '.profile', mode: '-rw-r--r--', size: 1247, uid: 500, gid: 100, mtime: '2026-01-20T11:30:00' },
    { name: '.bashrc', mode: '-rw-r--r--', size: 892, uid: 500, gid: 100, mtime: '2026-01-20T11:30:00' },
    { name: 'build.sh', mode: '-rwxr-xr-x', size: 3456, uid: 500, gid: 100, mtime: '2026-02-18T10:15:00' },
    { name: 'db2_connect.sh', mode: '-rwxr-xr-x', size: 2108, uid: 500, gid: 100, mtime: '2026-02-12T08:45:00' },
    { name: 'README.md', mode: '-rw-r--r--', size: 4521, uid: 500, gid: 100, mtime: '2026-02-01T14:00:00' }
  ]
  const data = { success: true, exitCode: 0, message: '', data: { items } }
  return { success: true, stdout: JSON.stringify(data, null, 2), stderr: '', data, exitCode: 0 }
}

function mockViewUssFile(args: string[]): ZoweResult {
  const file = extractPositional(args) || ''
  if (file.includes('build.sh')) {
    return { success: true, stdout: MOCK_USS_BUILD_SH, stderr: '', exitCode: 0 }
  }
  if (file.includes('.profile')) {
    return { success: true, stdout: MOCK_USS_PROFILE, stderr: '', exitCode: 0 }
  }
  if (file.includes('db2_connect')) {
    return { success: true, stdout: MOCK_USS_DB2_CONNECT, stderr: '', exitCode: 0 }
  }
  return { success: true, stdout: `# File: ${file}\n# Sample USS file content`, stderr: '', exitCode: 0 }
}

// --- DB2 MOCK RESPONSES ---

function mockDb2ExecuteSql(args: string[]): ZoweResult {
  const query = extractArg(args, '--query') || ''
  const upperQuery = query.toUpperCase()

  if (upperQuery.includes('SYSTABLES')) {
    return { success: true, stdout: MOCK_DB2_SYSTABLES, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('SYSCOLUMNS') && upperQuery.includes('EMPLOYEE')) {
    return { success: true, stdout: MOCK_DB2_DESCRIBE_EMPLOYEE, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('SYSCOLUMNS') && upperQuery.includes('CUSTOMER')) {
    return { success: true, stdout: MOCK_DB2_DESCRIBE_CUSTOMER, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('SYSCOLUMNS') && upperQuery.includes('TRANSACTION')) {
    return { success: true, stdout: MOCK_DB2_DESCRIBE_TRANSACTION, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('SYSCOLUMNS')) {
    return { success: true, stdout: MOCK_DB2_DESCRIBE_EMPLOYEE, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('EMPLOYEE')) {
    return { success: true, stdout: MOCK_DB2_EMPLOYEE_DATA, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('CUSTOMER')) {
    return { success: true, stdout: MOCK_DB2_CUSTOMER_DATA, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('TRANSACTION') || upperQuery.includes('TRANS')) {
    return { success: true, stdout: MOCK_DB2_TRANSACTION_DATA, stderr: '', exitCode: 0 }
  }
  if (upperQuery.includes('COUNT')) {
    return { success: true, stdout: 'TOTAL\n-------\n    1247', stderr: '', exitCode: 0 }
  }

  return { success: true, stdout: `Query executed successfully.\n\n(0 rows returned)`, stderr: '', exitCode: 0 }
}

function mockTsoCommand(args: string[]): ZoweResult {
  const cmd = extractArg(args, '--command') || extractPositional(args) || ''
  const upperCmd = cmd.toUpperCase()
  if (upperCmd.startsWith('LISTDS') || upperCmd.startsWith('LISTD')) {
    return { success: true, stdout: 'DEVUSR1.COBOL\n--RECFM-LRECL-BLKSIZE-DSORG\n  FB    80    27920   PO\n--VOLUMES--\n  USR001\n--MEMBERS--\n  PAYROLL\n  ACCTUPD\n  RPTGEN\n  CUSTMNT\n  TXNCALC', stderr: '', exitCode: 0 }
  }
  if (upperCmd.startsWith('STATUS')) {
    return { success: true, stdout: 'IKJ56200I JOB DBBACKUP(JOB00215) EXECUTING\nIKJ56200I JOB NIGHTBTC(JOB00301) ON INPUT QUEUE', stderr: '', exitCode: 0 }
  }
  if (upperCmd.startsWith('LISTCAT')) {
    return { success: true, stdout: 'NONVSAM ------- DEVUSR1.COBOL\nNONVSAM ------- DEVUSR1.JCL\nNONVSAM ------- DEVUSR1.LOADLIB\nNONVSAM ------- DEVUSR1.DATA.INPUT\nNONVSAM ------- DEVUSR1.DATA.OUTPUT\nCLUSTER ------- DEVUSR1.VSAM.CUSTDB\n  DATA ------- DEVUSR1.VSAM.CUSTDB.DATA\n  INDEX ------- DEVUSR1.VSAM.CUSTDB.INDEX', stderr: '', exitCode: 0 }
  }
  return { success: true, stdout: `TSO command executed: ${cmd}\nCommand completed successfully.`, stderr: '', exitCode: 0 }
}

function mockConsoleCommand(args: string[]): ZoweResult {
  const cmd = extractArg(args, '--command') || extractPositional(args) || ''
  const upperCmd = cmd.toUpperCase()
  if (upperCmd.startsWith('D A')) {
    return { success: true, stdout: 'IEE114I 14.23.05 2026.042 ACTIVITY 834\n JOBS     M/S    TS USERS    SYSAS    INITS   ACTIVE/MAX\n 00015    00032  00005       00047    00024   00012/00100', stderr: '', exitCode: 0 }
  }
  if (upperCmd.startsWith('D TS')) {
    return { success: true, stdout: 'IEE115I 14.23.10 2026.042\n DEVUSR1  OWT    0A24   S  TP\n DEVUSR2  IN     0A25   S  TP\n ADMIN01  OWT    0A30   S  TP', stderr: '', exitCode: 0 }
  }
  return { success: true, stdout: `Console command issued: ${cmd}\nResponse received.`, stderr: '', exitCode: 0 }
}

function extractArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return (idx >= 0 && idx + 1 < args.length) ? args[idx + 1] : undefined
}

function extractPositional(args: string[]): string | undefined {
  return extractPositionals(args)[0]
}

function extractPositionals(args: string[]): string[] {
  const flagsWithValues = new Set([
    '--account',
    '--base-profile',
    '--command',
    '--data-set',
    '--db2-profile',
    '--encoding',
    '--jobid',
    '--owner',
    '--path',
    '--prefix',
    '--query',
    '--tso-profile',
    '--zosmf-profile'
  ])

  const positionals: string[] = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--rfj') continue
    if (arg.startsWith('--')) {
      if (flagsWithValues.has(arg)) i++
      continue
    }
    positionals.push(arg)
  }
  return positionals
}

// --- MOCK DATA ---

const MOCK_COBOL_PAYROLL = `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYROLL.
       AUTHOR. ENTERPRISE-SYSTEMS.
       DATE-WRITTEN. 1997-03-15.
      *
      * PAYROLL PROCESSING PROGRAM
      * READS EMPLOYEE MASTER FILE AND CALCULATES
      * WEEKLY PAYROLL INCLUDING TAX DEDUCTIONS
      *
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT EMP-MASTER-FILE ASSIGN TO EMPFILE
               ORGANIZATION IS INDEXED
               ACCESS MODE IS SEQUENTIAL
               RECORD KEY IS EMP-ID
               FILE STATUS IS WS-FILE-STATUS.
           SELECT PAYROLL-REPORT ASSIGN TO SYSPRINT.
       DATA DIVISION.
       FILE SECTION.
       FD  EMP-MASTER-FILE.
       01  EMP-RECORD.
           05 EMP-ID              PIC X(6).
           05 EMP-NAME            PIC X(30).
           05 EMP-DEPT            PIC X(4).
           05 EMP-RATE            PIC 9(5)V99.
           05 EMP-HOURS           PIC 9(3)V9.
           05 EMP-TAX-CODE        PIC X(2).
           05 FILLER              PIC X(25).
       WORKING-STORAGE SECTION.
       01  WS-FILE-STATUS         PIC XX.
       01  WS-GROSS-PAY           PIC 9(7)V99.
       01  WS-TAX-AMT             PIC 9(7)V99.
       01  WS-NET-PAY             PIC 9(7)V99.
       01  WS-EOF-FLAG            PIC X VALUE 'N'.
           88 EOF-REACHED         VALUE 'Y'.
       PROCEDURE DIVISION.
       0000-MAIN.
           PERFORM 1000-INITIALIZE
           PERFORM 2000-PROCESS UNTIL EOF-REACHED
           PERFORM 9000-TERMINATE
           STOP RUN.
       1000-INITIALIZE.
           OPEN INPUT EMP-MASTER-FILE
                OUTPUT PAYROLL-REPORT.
       2000-PROCESS.
           READ EMP-MASTER-FILE
               AT END SET EOF-REACHED TO TRUE
               NOT AT END PERFORM 3000-CALC-PAY
           END-READ.
       3000-CALC-PAY.
           MULTIPLY EMP-RATE BY EMP-HOURS
               GIVING WS-GROSS-PAY.
           PERFORM 4000-CALC-TAX.
           SUBTRACT WS-TAX-AMT FROM WS-GROSS-PAY
               GIVING WS-NET-PAY.
       4000-CALC-TAX.
           EVALUATE EMP-TAX-CODE
               WHEN 'S1' MULTIPLY WS-GROSS-PAY BY 0.22
                   GIVING WS-TAX-AMT
               WHEN 'S2' MULTIPLY WS-GROSS-PAY BY 0.24
                   GIVING WS-TAX-AMT
               WHEN 'M1' MULTIPLY WS-GROSS-PAY BY 0.18
                   GIVING WS-TAX-AMT
               WHEN OTHER MULTIPLY WS-GROSS-PAY BY 0.25
                   GIVING WS-TAX-AMT
           END-EVALUATE.
       9000-TERMINATE.
           CLOSE EMP-MASTER-FILE PAYROLL-REPORT.`

const MOCK_JCL_PAYROLL = `//PAYROLL1 JOB (ACCT001),'PAYROLL BATCH',
//             CLASS=A,MSGCLASS=X,
//             MSGLEVEL=(1,1),NOTIFY=&SYSUID
//*
//* WEEKLY PAYROLL PROCESSING
//* RUN SCHEDULE: EVERY FRIDAY 22:00
//*
//STEP010  EXEC PGM=PAYROLL
//EMPFILE  DD DSN=PROD.EMP.MASTER,DISP=SHR
//SYSPRINT DD DSN=PROD.PAYROLL.REPORT,
//            DISP=(NEW,CATLG,DELETE),
//            SPACE=(CYL,(5,2)),
//            DCB=(RECFM=FB,LRECL=133,BLKSIZE=13300)
//SYSOUT   DD SYSOUT=*
//*
//STEP020  EXEC PGM=SORT
//SORTIN   DD DSN=PROD.PAYROLL.REPORT,DISP=SHR
//SORTOUT  DD DSN=PROD.PAYROLL.SORTED,
//            DISP=(NEW,CATLG,DELETE),
//            SPACE=(CYL,(5,2))
//SYSIN    DD *
  SORT FIELDS=(1,6,CH,A)
/*
//STEP030  EXEC PGM=RPTPRINT
//INPUT    DD DSN=PROD.PAYROLL.SORTED,DISP=SHR
//OUTPUT   DD SYSOUT=*,DEST=LOCAL`

const MOCK_USS_BUILD_SH = `#!/bin/sh
# Build script for COBOL applications on z/OS
# Author: DEVUSR1
# Last modified: 2026-02-18

export PATH="/usr/lpp/cobol/bin:$PATH"
export STEPLIB="CEE.SCEERUN:IGY.V6R4M0.SIGYCOMP"
export LANG=En_US.IBM-1047

SRCLIB="//DEVUSR1.COBOL"
COPYLIB="//DEVUSR1.COBOL.COPYBOOK"
LOADLIB="//DEVUSR1.LOADLIB"

echo "=== COBOL Build Started: $(date) ==="

for MEMBER in PAYROLL ACCTUPD RPTGEN CUSTMNT; do
  echo "Compiling $MEMBER..."
  cob2 -o "//'$LOADLIB($MEMBER)'" \\
       -I "//'$COPYLIB'" \\
       -qSOURCE,LIST,MAP,XREF \\
       "//'$SRCLIB($MEMBER)'"
  RC=$?
  if [ $RC -ne 0 ]; then
    echo "ERROR: Compile failed for $MEMBER (RC=$RC)"
    exit $RC
  fi
  echo "$MEMBER compiled successfully."
done

echo "=== Build Complete: $(date) ==="
echo "Load modules in: $LOADLIB"`

const MOCK_USS_PROFILE = `# .profile for DEVUSR1
# z/OS Unix System Services

export HOME=/u/devusr1
export PATH="/bin:/usr/bin:/usr/lpp/java/J17.0_64/bin:/usr/lpp/cobol/bin:$HOME/scripts:$PATH"
export LIBPATH="/lib:/usr/lib:/usr/lpp/java/J17.0_64/lib"

# Java settings
export JAVA_HOME="/usr/lpp/java/J17.0_64"
export IBM_JAVA_OPTIONS="-Dfile.encoding=ISO-8859-1"

# DB2 settings
export DB2_SSID=DB2P
export DSNAOINI="/u/devusr1/config/dsnaoini"

# Zowe settings
export ZOWE_HOME="/usr/lpp/zowe"

# Locale
export LANG=En_US.IBM-1047
export _BPXK_AUTOCVT=ON
export _CEE_RUNOPTS="FILETAG(AUTOCVT,AUTOTAG) POSIX(ON)"

# Aliases
alias ll='ls -la'
alias jl='zowe zos-jobs list jobs --owner $USER'

echo "Welcome to z/OS USS, $(whoami). System: $(uname -n)"`

const MOCK_USS_DB2_CONNECT = `#!/bin/sh
# DB2 connection test and health check
# Tests connectivity to DB2 subsystem

DB2SSID=\${1:-DB2P}
echo "Testing DB2 connection to subsystem: $DB2SSID"
echo "Timestamp: $(date)"

# Test 1: Check DB2 address space
tsocmd "STATUS DB2MSTR" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "[PASS] DB2 master address space is active"
else
  echo "[FAIL] DB2 master address space not found"
  exit 1
fi

# Test 2: Execute simple query via Zowe
zowe db2 execute sql --query "SELECT CURRENT TIMESTAMP FROM SYSIBM.SYSDUMMY1" --db2-profile $DB2SSID
if [ $? -eq 0 ]; then
  echo "[PASS] DB2 SQL execution successful"
else
  echo "[FAIL] DB2 SQL execution failed"
  exit 2
fi

# Test 3: Check table access
zowe db2 execute sql --query "SELECT COUNT(*) FROM SYSIBM.SYSTABLES WHERE CREATOR = USER" --db2-profile $DB2SSID
echo "[PASS] DB2 catalog access confirmed"

echo ""
echo "DB2 connection test complete for $DB2SSID"`

const MOCK_DB2_SYSTABLES = `NAME            TYPE  COLCOUNT  ROW_COUNT  CREATOR
--------------  ----  --------  ---------  --------
ACCOUNT         T          12       8542   DEVUSR1
CUSTOMER        T          15      24103   DEVUSR1
EMPLOYEE        T          18       1247   DEVUSR1
GL_JOURNAL      T          10     156200   DEVUSR1
PAYROLL_HIST    T          22      89034   DEVUSR1
PRODUCT         T           9       3201   DEVUSR1
TRANSACTION     T          14     412058   DEVUSR1
V_EMP_SUMMARY   V           8          0   DEVUSR1

8 row(s) returned.`

const MOCK_DB2_DESCRIBE_EMPLOYEE = `NAME            COLTYPE    LENGTH  SCALE  NULLS  DEFAULT  COLNO
--------------  ---------  ------  -----  -----  -------  -----
EMP_ID          CHAR            6      0  N      -            1
EMP_NAME        VARCHAR        30      0  N      -            2
EMP_LAST_NAME   VARCHAR        30      0  N      -            3
DEPT_CODE       CHAR            4      0  N      -            4
HIRE_DATE       DATE           10      0  N      -            5
SALARY          DECIMAL        11      2  N      -            6
HOURLY_RATE     DECIMAL         7      2  Y      -            7
PAY_FREQ        CHAR            1      0  N      'B'          8
TAX_CODE        CHAR            2      0  N      -            9
MANAGER_ID      CHAR            6      0  Y      -           10
LOCATION        CHAR            4      0  N      -           11
STATUS          CHAR            1      0  N      'A'         12
SSN_HASH        CHAR           64      0  N      -           13
BANK_ACCT       VARCHAR        20      0  Y      -           14
ROUTING_NO      CHAR            9      0  Y      -           15
LAST_REVIEW     DATE           10      0  Y      -           16
CREATED_TS      TIMESTAMP      26      0  N      -           17
UPDATED_TS      TIMESTAMP      26      0  N      -           18

18 row(s) returned.`

const MOCK_DB2_DESCRIBE_CUSTOMER = `NAME            COLTYPE    LENGTH  SCALE  NULLS  DEFAULT  COLNO
--------------  ---------  ------  -----  -----  -------  -----
CUST_ID         CHAR           10      0  N      -            1
CUST_NAME       VARCHAR        50      0  N      -            2
CUST_TYPE       CHAR            1      0  N      'I'          3
ADDRESS_1       VARCHAR        60      0  Y      -            4
ADDRESS_2       VARCHAR        60      0  Y      -            5
CITY            VARCHAR        30      0  Y      -            6
STATE           CHAR            2      0  Y      -            7
ZIP_CODE        CHAR           10      0  Y      -            8
COUNTRY         CHAR            3      0  N      'USA'        9
PHONE           VARCHAR        15      0  Y      -           10
EMAIL           VARCHAR        80      0  Y      -           11
ACCT_BALANCE    DECIMAL        13      2  N      0           12
CREDIT_LIMIT    DECIMAL        13      2  N      0           13
STATUS          CHAR            1      0  N      'A'         14
CREATED_TS      TIMESTAMP      26      0  N      -           15

15 row(s) returned.`

const MOCK_DB2_DESCRIBE_TRANSACTION = `NAME            COLTYPE    LENGTH  SCALE  NULLS  DEFAULT  COLNO
--------------  ---------  ------  -----  -----  -------  -----
TXN_ID          INTEGER         4      0  N      -            1
CUST_ID         CHAR           10      0  N      -            2
ACCT_ID         CHAR           12      0  N      -            3
TXN_TYPE        CHAR            2      0  N      -            4
TXN_DATE        DATE           10      0  N      -            5
TXN_TIME        TIME            8      0  N      -            6
AMOUNT          DECIMAL        13      2  N      -            7
CURRENCY        CHAR            3      0  N      'USD'        8
DESCRIPTION     VARCHAR        60      0  Y      -            9
REFERENCE       VARCHAR        20      0  Y      -           10
STATUS          CHAR            1      0  N      'P'         11
POSTED_DATE     DATE           10      0  Y      -           12
BATCH_ID        CHAR           10      0  Y      -           13
CREATED_TS      TIMESTAMP      26      0  N      -           14

14 row(s) returned.`

const MOCK_DB2_EMPLOYEE_DATA = `EMP_ID  EMP_NAME      EMP_LAST_NAME  DEPT_CODE  HIRE_DATE   SALARY       STATUS
------  ------------  -------------  ---------  ----------  -----------  ------
E00101  JAMES         WILSON         FIN1       1998-03-15  78500.00     A
E00102  MARIA         GARCIA         FIN1       2001-06-01  82300.00     A
E00103  ROBERT        CHEN           IT01       1995-11-20  95200.00     A
E00104  SARAH         JOHNSON        HR01       2005-01-10  71000.00     A
E00105  DAVID         PATEL          IT01       2010-08-22  88400.00     A
E00106  JENNIFER      SMITH          FIN2       1999-04-15  76800.00     A
E00107  MICHAEL       BROWN          OPS1       2003-09-01  69500.00     A
E00108  LISA          WILLIAMS       IT01       2015-03-18  91200.00     A
E00109  THOMAS        KUMAR          FIN1       2008-07-12  79900.00     I
E00110  AMANDA        DAVIS          HR01       2019-01-28  65400.00     A

10 row(s) returned.`

const MOCK_DB2_CUSTOMER_DATA = `CUST_ID     CUST_NAME                  CUST_TYPE  ACCT_BALANCE   STATUS
----------  -------------------------  ---------  -------------  ------
C000001001  ACME CORPORATION           C          1245670.50     A
C000001002  JOHNSON, MICHAEL R         I            45230.75     A
C000001003  PACIFIC TRADING CO         C           892100.00     A
C000001004  SMITH, JENNIFER L          I            12890.33     A
C000001005  FIRST NATIONAL HOLDINGS    C          5670200.00     A
C000001006  GARCIA, MARIA E            I            78450.00     A
C000001007  CHEN, ROBERT W             I           234100.50     I
C000001008  GLOBAL LOGISTICS INC       C          3450000.00     A
C000001009  PATEL, DAVID K             I            56780.25     A
C000001010  WELLINGTON PARTNERS        C          8901200.00     A

10 row(s) returned.`

const MOCK_DB2_TRANSACTION_DATA = `TXN_ID    CUST_ID     TXN_TYPE  TXN_DATE    AMOUNT        STATUS  DESCRIPTION
--------  ----------  --------  ----------  ------------  ------  ---------------------------
10045201  C000001001  CR        2026-02-20       5000.00  P       WIRE TRANSFER RECEIVED
10045202  C000001002  DB        2026-02-20        250.75  P       POS PURCHASE - GROCERY
10045203  C000001003  CR        2026-02-20     12500.00   P       ACH CREDIT - INVOICE 4521
10045204  C000001001  DB        2026-02-20      1200.00   P       OUTGOING WIRE - VENDOR PMT
10045205  C000001005  CR        2026-02-20     45000.00   P       DEPOSIT - CHECK #8834
10045206  C000001004  DB        2026-02-20        89.99   P       ONLINE PURCHASE
10045207  C000001006  DB        2026-02-20       450.00   P       ATM WITHDRAWAL
10045208  C000001008  CR        2026-02-20    125000.00   C       PENDING - WIRE VERIFICATION
10045209  C000001002  DB        2026-02-20        32.50   P       POS PURCHASE - COFFEE
10045210  C000001010  CR        2026-02-20     78900.00   P       ACH CREDIT - QUARTERLY DIV

10 row(s) returned.`
