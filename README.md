# Zowe MCP Server

An MCP (Model Context Protocol) server that wraps Zowe CLI, enabling AI assistants like Claude to interact with z/OS mainframes through natural language.

## What This Does

Instead of learning dozens of Zowe CLI commands, developers can ask an AI assistant questions like:

- "Show me what datasets I have access to"
- "Why did the payroll job fail last night?"
- "Show me the COBOL source for the payroll program"
- "Help me understand this COBOL application"

The MCP server translates these into the right Zowe CLI calls and returns results the AI can explain in plain English.

## Architecture

```arch
User <-> AI Assistant <-> MCP Protocol <-> This Server <-> Zowe CLI <-> z/OS
```

## Features

- **12 Tools** for interacting with z/OS (datasets, jobs, TSO, console commands)
- **5 Pre-built Prompts** for common workflows (onboarding, diagnostics, code review)
- **5 Reference Resources** for z/OS concepts (JCL, COBOL, ABEND codes)
- **Safety Guardrails** that block destructive commands (DELETE, CANCEL, PURGE)
- **Mock Mode** for demos and development without a live mainframe
- **Automatic Error Analysis** that explains ABEND codes and return codes

## Quick Start

For development view [Development Instructions](./DEV.md)

### 1) Install and Build

```bash
bun install
bun run build
```

### 2) Zowe Setup

Use these commands once on the machine running this MCP server:

```bash
zowe config auto-init --host "Z.SERVER.IP.OR.HOST"
# Enter port (default is 10443 for Liberty Server)
# Enter username and password
# After config is saved, make sure your ~/.zowe/zowe.config.json and selected profile is setup properly

# If using APIML Auth Gateway
zowe auth login apiml

# Verify you can connect to your Z Machine
zowe zosmf check status --rfj

# Optional, but recommended if your TSO profile requires account:
# zowe profiles create tso mytso --account ACCT001
# You can get your account number via `tsocmd "LISTUSER MY_USER_ID TSO NORACF"`
```

If `zowe zosmf check status --rfj` fails, fix auth/profile first before starting this server.

### 3) Configure Your MCP Client

For Claude Desktop, use `config/mcp.json` as your template and copy the `zowe-mcp-server` entry into:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

For other MCP clients that accept JSON MCP server definitions, use the same `config/mcp.json`.

Codex using `.toml` configs which can be seen in `config/codex.toml`

Replace the placeholder path in both files:

- `/ABSOLUTE/PATH/TO/zowe-mcp-server/dist/index.js`

## Available Tools

### Dataset Tools

| Tool | Description |
|------|-------------|
| `zowe_list_datasets` | List datasets matching a pattern |
| `zowe_list_members` | List members of a PDS/PDSE library |
| `zowe_read_dataset` | Read contents of a dataset or member |
| `zowe_search_datasets` | Search for text within a dataset |

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
| `ZOWE_MCP_TASK_TTL_MS` | How long completed async tasks are retained | `3600000` |
| `ZOWE_MCP_MAX_TASKS` | Maximum in-memory async task records kept | `300` |
| `ZOWE_PROFILE` | Legacy fallback base profile (ignored when set to `default`) | `default` |

## Example Conversations

### Exploring Datasets
>
> **User**: Use the zowe-mcp-server tool and show me what datasets I have under DEVUSR1
>
> **AI**: *Uses zowe_list_datasets* - I found 8 datasets under DEVUSR1. You have COBOL source libraries, JCL, copybooks, and data files...

### Diagnosing a Job Failure
>
> **User**: Use the zowe-mcp-server tool and look at job JOB00245 failed. Can you tell me why?
>
> **AI**: *Uses zowe_get_job_status and zowe_get_job_output* - This job failed with ABEND S0C7, which is a Data Exception. This typically means a packed decimal field contains invalid data. Looking at the spool output, I see the error occurred in STEP020...

### Code Understanding
>
> **User**: Use the zowe-mcp-server tool and help me understand the PAYROLL program
>
> **AI**: *Uses zowe_read_dataset* - This COBOL program processes payroll data. It reads an indexed employee master file and calculates weekly pay including tax deductions. Let me walk you through the main sections...

## License

MIT
