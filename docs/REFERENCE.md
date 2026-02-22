# MCP Reference

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
| `zowe_submit_job` | Submit a JCL job from a dataset |

### Command Tools

| Tool | Description |
|------|-------------|
| `zowe_tso_command` | Execute TSO commands with safety guardrails |
| `zowe_console_command` | Execute MVS console commands with safety guardrails |

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ZOWE_MCP_MOCK` | Enable mock mode (`true`/`false`) | `false` |
| `ZOWE_MCP_BASE_PROFILE` | Base profile name to pass as `--base-profile` | unset |
| `ZOWE_MCP_ZOSMF_PROFILE` | z/OSMF profile name for files/jobs/console commands | unset |
| `ZOWE_MCP_TSO_PROFILE` | TSO profile name for TSO commands | unset |
| `ZOWE_MCP_TSO_ACCOUNT` | TSO account to pass as `--account` when required | unset |
| `ZOWE_MCP_EXEC_TIMEOUT_MS` | Per-command Zowe CLI timeout in milliseconds | `300000` |
| `ZOWE_MCP_INLINE_WAIT_MS` | How long a tool waits before returning an async `task_id` | `10000` |
| `ZOWE_MCP_WAIT_TOOL_MAX_WAIT_MS` | Default max wait window for `zowe_wait_async_task` | `300000` |
| `ZOWE_MCP_WAIT_TOOL_POLL_INTERVAL_MS` | Default poll interval for `zowe_wait_async_task` | `2000` |
| `ZOWE_MCP_TASK_TTL_MS` | How long completed async tasks are retained | `3600000` |
| `ZOWE_MCP_MAX_TASKS` | Maximum in-memory async task records kept | `300` |
| `ZOWE_PROFILE` | Legacy fallback base profile (ignored when set to `default`) | `default` |
