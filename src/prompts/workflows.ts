import {
  codeReviewArgsSchema,
  dailyOpsCheckArgsSchema,
  diagnoseJobFailureArgsSchema,
  exploreCodebaseArgsSchema,
  onboardingArgsSchema
} from '@gestell/schema/prompts/workflows'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function registerPrompts(server: McpServer): void {

  server.registerPrompt(
    'onboarding',
    {
      title: 'Mainframe Onboarding',
      description: 'Interactive onboarding for new mainframe developers. Guides through exploring datasets, understanding job flows, and reading COBOL code.',
      argsSchema: onboardingArgsSchema
    },
    async (args) => {
      const hlq = args.hlq || 'DEVUSR1'
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `You are helping a developer who is new to z/OS mainframes. Guide them through an interactive exploration of the mainframe environment.

**Context:**
- The user has access to datasets under the high-level qualifier: ${hlq}
- They want to understand how mainframe applications are structured

**Your mission:**
1. First, use zowe_list_datasets to show what datasets exist under ${hlq}
2. Explain the naming conventions and dataset types (COBOL source, JCL, COPYBOOK, LOADLIB, etc.)
3. Use zowe_list_members to explore a COBOL or JCL library
4. Use zowe_read_dataset to show an example program or JCL
5. Explain the code structure and how programs relate to jobs
6. Use zowe_list_jobs to show recent job activity
7. Demonstrate how to check job status and view output

**Teaching approach:**
- Be patient and thorough
- Explain mainframe terminology as you encounter it
- Draw connections to concepts they might know from distributed systems
- Encourage questions and exploration

Start by listing the datasets and explaining what you find.`
            }
          }
        ]
      }
    }
  )

  server.registerPrompt(
    'diagnose-job-failure',
    {
      title: 'Diagnose Job Failure',
      description: 'Diagnose why a z/OS job failed. Analyzes job output, identifies error codes, and suggests fixes.',
      argsSchema: diagnoseJobFailureArgsSchema
    },
    async (args) => {
      const jobId = args.job_id || 'JOB00245'
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `A z/OS job has failed and I need your help diagnosing the problem.

**Job ID:** ${jobId}

**Your diagnostic process:**
1. Use zowe_get_job_status to get the job details and return code
2. Use zowe_get_job_output to retrieve the full spool output
3. Analyze the output for:
   - ABEND codes (S0C7, S0C4, S013, etc.)
   - Non-zero condition codes (CC 0004, 0008, 0012, etc.)
   - IEC/IGD/IEF messages that indicate specific errors
   - JCL errors or allocation failures
4. Use zowe_explain_error for any error codes found
5. If the job references datasets or programs, use zowe_list_datasets or zowe_read_dataset to investigate

**Output format:**
Provide a structured diagnosis with:
- **Summary**: One-line description of what went wrong
- **Root Cause**: Technical explanation of the failure
- **Evidence**: Key lines from the job output that support your diagnosis
- **Fix**: Specific steps to resolve the issue
- **Prevention**: How to avoid this in the future

Begin the diagnosis now.`
            }
          }
        ]
      }
    }
  )

  server.registerPrompt(
    'explore-codebase',
    {
      title: 'Explore COBOL Codebase',
      description: 'Explore and understand a COBOL application codebase. Maps program relationships, copybook usage, and data flows.',
      argsSchema: exploreCodebaseArgsSchema
    },
    async (args) => {
      const hlq = args.hlq || 'DEVUSR1'
      const program = args.program
      const programClause = program ? `Start with the program: ${program}` : 'Start by listing available programs and pick one that looks like a main entry point.'

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need to understand a COBOL application. Help me explore and document its structure.

**Application location:** ${hlq}
${programClause}

**Exploration tasks:**
1. Use zowe_list_datasets to find all related datasets (COBOL, COPYBOOK, JCL, etc.)
2. Use zowe_list_members to inventory the programs and copybooks
3. Use zowe_read_dataset to examine program source code
4. Identify:
   - COPY statements (what copybooks are used)
   - CALL statements (what other programs are called)
   - File-control entries (what files are read/written)
   - Working-storage data structures
5. Use zowe_search_datasets to trace specific variables or copybooks across programs
6. Review JCL to understand the job execution flow

**Documentation output:**
Create a structured summary including:
- **Application Overview**: Purpose and main functions
- **Program Inventory**: List of programs with brief descriptions
- **Copybook Inventory**: Shared data structures and their usage
- **Data Flow**: Input files -> Processing -> Output files
- **Program Call Graph**: Which programs call which
- **Key Business Logic**: Important calculations or validations

Be thorough but focus on helping me understand the application's purpose and structure.`
            }
          }
        ]
      }
    }
  )

  server.registerPrompt(
    'code-review',
    {
      title: 'COBOL Code Review',
      description: 'Review COBOL code for issues, best practices, and potential improvements.',
      argsSchema: codeReviewArgsSchema
    },
    async (args) => {
      const dataset = args.dataset || 'DEVUSR1.COBOL(PAYROLL)'
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please review the COBOL code in ${dataset} for quality, correctness, and best practices.

**Review process:**
1. Use zowe_read_dataset to retrieve the source code
2. Analyze the code for:
   - **Structure**: Is the program well-organized with clear paragraph names?
   - **Data definitions**: Are field sizes appropriate? Are there potential truncation issues?
   - **Numeric handling**: Could any operations cause S0C7 (data exception)?
   - **File handling**: Are file statuses checked? Is error handling adequate?
   - **Performance**: Are there inefficient loops or redundant I/O operations?
   - **Maintainability**: Is the code readable? Are comments helpful?
   - **Common issues**: Uninitialized fields, hardcoded values, missing INITIALIZE statements

**Review output format:**
- **Summary**: Overall assessment (Good/Fair/Needs Work)
- **Strengths**: What the code does well
- **Issues Found**: Specific problems with line numbers and explanations
- **Recommendations**: Suggested improvements with example code
- **Risk Assessment**: Potential runtime issues (abends, incorrect results)

Focus on practical issues that could cause production problems.`
            }
          }
        ]
      }
    }
  )

  server.registerPrompt(
    'daily-ops-check',
    {
      title: 'Daily Operations Check',
      description: 'Perform a daily operations check - review recent jobs, identify failures, and summarize system health.',
      argsSchema: dailyOpsCheckArgsSchema
    },
    async (args) => {
      const owner = args.owner || 'DEVUSR1'
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Perform a daily operations health check for jobs owned by ${owner}.

**Check process:**
1. Use zowe_list_jobs to get all recent jobs for owner ${owner}
2. Identify any jobs with:
   - ABEND status
   - Non-zero return codes (CC > 0000)
   - ACTIVE status (still running - is this expected?)
   - INPUT status (waiting - is something stuck?)
3. For any failed jobs, use zowe_get_job_status and zowe_get_job_output to get details
4. Use zowe_explain_error for any error codes found

**Report format:**

## Daily Operations Summary - ${owner}

### Overview
- Total jobs: X
- Successful: X
- Warnings (CC 0004): X
- Failures: X
- Currently Active: X
- Queued: X

### Issues Requiring Attention
[List any failed or problematic jobs with brief diagnosis]

### Job Details
[Table of all jobs with name, ID, status, return code]

### Recommendations
[Any suggested actions based on the findings]

Generate this report now.`
            }
          }
        ]
      }
    }
  )
}
