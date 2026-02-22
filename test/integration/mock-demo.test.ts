import { beforeAll,describe, expect, it } from 'bun:test'

// Ensure MOCK_MODE is set before importing modules
beforeAll(() => {
  process.env.ZOWE_MCP_MOCK = 'true'
})

describe('Mock Demo Flow Integration Tests', () => {
  describe('Job Operations', () => {
    it('lists jobs for DEVUSR1 and returns job list', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      const result = await executeZowe('zos-jobs list jobs', ['--owner', 'DEVUSR1', '--rfj'])

      expect(result.success).toBe(true)
      expect(result.exitCode).toBe(0)

      const data = result.data as { data?: Array<Record<string, unknown>> }
      expect(data.data).toBeDefined()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBeGreaterThan(0)

      // Verify job structure
      const job = data.data![0]
      expect(job).toHaveProperty('jobid')
      expect(job).toHaveProperty('jobname')
      expect(job).toHaveProperty('owner')
      expect(job).toHaveProperty('status')
      expect(job.owner).toBe('DEVUSR1')
    })

    it('gets job status by jobid with retcode', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      const result = await executeZowe('zos-jobs view job-status-by-jobid', ['JOB00142', '--rfj'])

      expect(result.success).toBe(true)
      expect(result.exitCode).toBe(0)

      const data = result.data as { data?: Record<string, unknown> }
      expect(data.data).toBeDefined()
      expect(data.data).toHaveProperty('jobid', 'JOB00142')
      expect(data.data).toHaveProperty('jobname')
      expect(data.data).toHaveProperty('retcode')
      expect(data.data).toHaveProperty('status')
    })

    it('gets spool output for failed job with error content', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      // JOB00245 is the mock failed job with S0C7
      const result = await executeZowe('zos-jobs view all-spool-content', ['--jobid', 'JOB00245'])

      expect(result.success).toBe(true)
      expect(result.stdout).toBeDefined()
      expect(result.stdout.length).toBeGreaterThan(0)

      // Should contain error indicators
      expect(result.stdout).toContain('S0C7')
      expect(result.stdout).toContain('ABEND')
    })

    it('submits JCL and returns jobid', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      const result = await executeZowe('zos-jobs submit data-set', [
        '--data-set',
        'DEVUSR1.JCL(PAYROLL1)',
        '--rfj'
      ])

      expect(result.success).toBe(true)
      expect(result.exitCode).toBe(0)

      const data = result.data as { data?: Record<string, unknown> }
      expect(data.data).toBeDefined()
      expect(data.data).toHaveProperty('jobid')
      expect(typeof data.data!.jobid).toBe('string')
      expect((data.data!.jobid as string).startsWith('JOB')).toBe(true)
    })
  })

  describe('Dataset Operations', () => {
    it('lists datasets and returns dataset list', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      const result = await executeZowe('zos-files list ds', ['DEVUSR1', '--rfj'])

      expect(result.success).toBe(true)
      expect(result.exitCode).toBe(0)

      const data = result.data as { data?: { items?: Array<Record<string, unknown>> } }
      expect(data.data?.items).toBeDefined()
      expect(Array.isArray(data.data?.items)).toBe(true)
      expect(data.data!.items!.length).toBeGreaterThan(0)

      // Verify dataset structure
      const dataset = data.data!.items![0]
      expect(dataset).toHaveProperty('dsname')
      expect(dataset).toHaveProperty('dsorg')
    })

    it('lists PDS members and returns member names', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      const result = await executeZowe('zos-files list all-members', ['DEVUSR1.COBOL', '--rfj'])

      expect(result.success).toBe(true)
      expect(result.exitCode).toBe(0)

      const data = result.data as { data?: { items?: Array<{ member: string }> } }
      expect(data.data?.items).toBeDefined()
      expect(Array.isArray(data.data?.items)).toBe(true)

      const memberNames = data.data!.items!.map((m) => m.member)
      expect(memberNames.length).toBeGreaterThan(0)
      expect(memberNames).toContain('PAYROLL')
    })

    it('reads COBOL source and returns source code', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      const result = await executeZowe('zos-files view ds', ['DEVUSR1.COBOL(PAYROLL)'])

      expect(result.success).toBe(true)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBeDefined()
      expect(result.stdout.length).toBeGreaterThan(0)

      // Should be valid COBOL source
      expect(result.stdout).toContain('IDENTIFICATION DIVISION')
      expect(result.stdout).toContain('PROGRAM-ID')
      expect(result.stdout).toContain('PROCEDURE DIVISION')
    })
  })

  describe('TSO Operations with Guardrails', () => {
    it('executes safe TSO command (LISTDS)', async () => {
      const { classifyTsoCommand } = await import('@gestell/mcp/services/guardrails')
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')
      const { CommandSafety } = await import('@gestell/mcp/constants')

      // First verify guardrails allow it
      const classification = classifyTsoCommand("LISTDS 'DEVUSR1.COBOL'")
      expect(classification.safety).toBe(CommandSafety.SAFE)
      expect(classification.allowed).toBe(true)

      // Then execute it
      const result = await executeZowe('zos-tso issue command', ['--command', "LISTDS 'DEVUSR1.COBOL'"])
      expect(result.success).toBe(true)
      expect(result.stdout).toContain('DEVUSR1.COBOL')
    })

    it('blocks destructive TSO command (DELETE)', async () => {
      const { classifyTsoCommand } = await import('@gestell/mcp/services/guardrails')
      const { CommandSafety } = await import('@gestell/mcp/constants')

      const classification = classifyTsoCommand("DELETE 'DEVUSR1.DATA'")

      expect(classification.safety).toBe(CommandSafety.BLOCKED)
      expect(classification.allowed).toBe(false)
      expect(classification.reason).toContain('destructive')
    })

    it('allows but warns on cautious TSO command (SUBMIT)', async () => {
      const { classifyTsoCommand } = await import('@gestell/mcp/services/guardrails')
      const { CommandSafety } = await import('@gestell/mcp/constants')

      const classification = classifyTsoCommand("SUBMIT 'DEVUSR1.JCL(MYJOB)'")

      expect(classification.safety).toBe(CommandSafety.CAUTIOUS)
      expect(classification.allowed).toBe(true)
      expect(classification.reason).toContain('side effects')
    })
  })

  describe('Error Explanation', () => {
    it('explains S0C7 with human-readable explanation', async () => {
      const { explainError } = await import('@gestell/mcp/services/error-reference')

      const explanation = explainError('S0C7')

      expect(explanation).toBeDefined()
      expect(explanation.length).toBeGreaterThan(100) // Should be a detailed explanation
      expect(explanation).toContain('S0C7')
      expect(explanation).toContain('Data Exception')
      expect(explanation).toContain('packed decimal')
      expect(explanation).toContain('Common Causes')
      expect(explanation).toContain('Recommended Actions')
    })

    it('explains ABEND S0C7 format', async () => {
      const { explainError } = await import('@gestell/mcp/services/error-reference')

      const explanation = explainError('ABEND S0C7')

      expect(explanation).toContain('S0C7')
      expect(explanation).toContain('Data Exception')
    })

    it('explains return codes', async () => {
      const { explainError } = await import('@gestell/mcp/services/error-reference')

      const explanation = explainError('CC 0012')

      expect(explanation).toContain('0012')
      expect(explanation).toContain('Severe')
    })
  })

  describe('End-to-End Demo Scenario', () => {
    it('completes full investigation workflow', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')
      const { explainError, analyzeJobOutput } = await import('@gestell/mcp/services/error-reference')

      // Step 1: List jobs
      const jobsResult = await executeZowe('zos-jobs list jobs', ['--owner', 'DEVUSR1', '--rfj'])
      expect(jobsResult.success).toBe(true)

      const jobsData = jobsResult.data as { data?: Array<Record<string, unknown>> }
      expect(jobsData.data).toBeDefined()

      // Find the failed job
      const failedJob = jobsData.data!.find((j) => j.retcode === 'ABEND S0C7')
      expect(failedJob).toBeDefined()

      // Step 2: Get job status
      const statusResult = await executeZowe('zos-jobs view job-status-by-jobid', [
        failedJob!.jobid as string,
        '--rfj'
      ])
      expect(statusResult.success).toBe(true)

      // Step 3: Get spool output
      const spoolResult = await executeZowe('zos-jobs view all-spool-content', [
        '--jobid',
        failedJob!.jobid as string
      ])
      expect(spoolResult.success).toBe(true)
      expect(spoolResult.stdout).toContain('S0C7')

      // Step 4: Analyze the output
      const analysis = analyzeJobOutput(spoolResult.stdout)
      expect(analysis.length).toBeGreaterThan(0)

      // Step 5: Get detailed explanation
      const explanation = explainError('S0C7')
      expect(explanation).toContain('Data Exception')
      expect(explanation).toContain('packed decimal')
    })

    it('completes dataset exploration workflow', async () => {
      const { executeZowe } = await import('@gestell/mcp/services/zowe-executor')

      // Step 1: List datasets
      const dsResult = await executeZowe('zos-files list ds', ['DEVUSR1', '--rfj'])
      expect(dsResult.success).toBe(true)

      const dsData = dsResult.data as { data?: { items?: Array<Record<string, unknown>> } }
      const cobolDs = dsData.data!.items!.find((d) => String(d.dsname).includes('COBOL') && !String(d.dsname).includes('COPYBOOK'))
      expect(cobolDs).toBeDefined()

      // Step 2: List members
      const membersResult = await executeZowe('zos-files list all-members', [
        cobolDs!.dsname as string,
        '--rfj'
      ])
      expect(membersResult.success).toBe(true)

      const membersData = membersResult.data as { data?: { items?: Array<{ member: string }> } }
      expect(membersData.data!.items!.length).toBeGreaterThan(0)

      // Step 3: Read source
      const sourceResult = await executeZowe('zos-files view ds', [
        `${cobolDs!.dsname}(PAYROLL)`
      ])
      expect(sourceResult.success).toBe(true)
      expect(sourceResult.stdout).toContain('IDENTIFICATION DIVISION')
    })
  })
})
