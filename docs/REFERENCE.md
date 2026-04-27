# MCP Reference

This document lists the MCP tools, prompts, resources, and command guardrails exposed by `@gestell/zowe-mcp`. For runtime setup and environment variables, see [Configuration](./CONFIGURATION.md). For component boundaries and request flow, see [Architecture](./ARCHITECTURE.md).

## Example Requests

- "Show me what datasets I have access to."
- "Why did the payroll job fail last night?"
- "Show me the COBOL source for the payroll program."
- "Help me understand this COBOL application."
- "List recent jobs for my user and summarize any failures."

## Available Tools

### Dataset Tools

| Tool | Description |
|------|-------------|
| `zowe_list_datasets` | List datasets matching a pattern |
| `zowe_list_members` | List members of a PDS/PDSE library |
| `zowe_read_dataset` | Read contents of a dataset or member |
| `zowe_search_datasets` | Search for text within a dataset |
| `zowe_upload_file_to_dataset` | Upload one local file into a target dataset/member |
| `zowe_upload_directory_to_pds` | Upload all files from a local directory into a PDS |

### Job Tools

| Tool | Description |
|------|-------------|
| `zowe_list_jobs` | List jobs by owner, prefix, or status |
| `zowe_get_job_status` | Get detailed status of a job |
| `zowe_get_job_output` | Retrieve spool output (with automatic error analysis) |
| `zowe_list_job_spool_files` | List JES spool DD entries for a job |
| `zowe_get_job_spool_file` | Retrieve a specific spool DD by file ID with paging support |
| `zowe_submit_job` | Submit a JCL job from a dataset |

### Command Tools

| Tool | Description |
|------|-------------|
| `zowe_tso_command` | Execute TSO commands with safety guardrails |
| `zowe_console_command` | Execute MVS console commands with safety guardrails |

### USS Tools

| Tool | Description |
|------|-------------|
| `zowe_list_uss_files` | List files and directories in a USS path |
| `zowe_view_uss_file` | Read a text file from Unix System Services |
| `zowe_search_uss_file` | Search for a text pattern in a USS file |

### DB2 Tools

These tools require the Zowe DB2 CLI plugin and a configured DB2 profile.

| Tool | Description |
|------|-------------|
| `zowe_db2_execute_sql` | Execute a SQL statement against a DB2 subsystem |
| `zowe_db2_list_tables` | List DB2 tables, optionally filtered by schema |
| `zowe_db2_describe_table` | Describe table columns, data types, and nullability |
| `zowe_db2_export_table` | Export rows from a DB2 table with optional filtering |

### Error Reference Tools

| Tool | Description |
|------|-------------|
| `zowe_explain_error` | Look up and explain any z/OS error code |
| `zowe_list_error_codes` | List all known error codes with descriptions |

### Async Task Tools

| Tool | Description |
|------|-------------|
| `zowe_wait_async_task` | Recommended polling helper; waits for a task window and returns status |
| `zowe_get_async_task` | Get current status/result for a task ID |
| `zowe_list_async_tasks` | List recent async tasks and their status |

## Available Prompts

Pre-built workflows for common tasks:

| Prompt | Description |
|--------|-------------|
| `onboarding` | Interactive guide for new mainframe developers |
| `diagnose-job-failure` | Analyze a failed job and suggest fixes |
| `explore-codebase` | Map COBOL application structure and data flows |
| `code-review` | Review COBOL code for issues and best practices |
| `daily-ops-check` | Generate daily operations health report |

## Available Resources

Reference documentation accessible to the AI:

| Resource | Description |
|----------|-------------|
| `zos://reference/dataset-types` | Dataset organizations and naming conventions |
| `zos://reference/jcl-basics` | JCL syntax quick reference |
| `zos://reference/cobol-structure` | COBOL program structure reference |
| `zos://reference/abend-codes` | Common ABEND codes and their causes |
| `zos://reference/zowe-cli` | Zowe CLI command reference |

## Safety Guardrails

The server includes safety guardrails that classify commands by risk level:

- **SAFE**: Read-only commands (LISTDS, STATUS, DISPLAY)
- **CAUTIOUS**: Commands with side effects (SUBMIT, ALLOC) - executed with warnings
- **BLOCKED**: Destructive commands (DELETE, CANCEL, PURGE, FORCE) - rejected

This prevents the AI from accidentally executing destructive operations.
