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

```
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

### Prerequisites

- Node.js 18+
- [Zowe CLI](https://docs.zowe.org/stable/user-guide/cli-installcli/) installed and configured (for live mode)

### Installation

```bash
git clone https://github.com/tayvz/zowe-mcp-server.git
cd zowe-mcp-server
npm install
npm run build
```

### Running in Mock Mode (Demo)

Mock mode provides realistic simulated z/OS responses for demos and testing:

```bash
ZOWE_MCP_MOCK=true node dist/index.js
```

### Running in Live Mode

Requires Zowe CLI configured with a valid z/OSMF profile:

```bash
node dist/index.js
```

## Integration with Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "zowe-mcp-server": {
      "command": "node",
      "args": ["/path/to/zowe-mcp-server/dist/index.js"],
      "env": {
        "ZOWE_MCP_MOCK": "true"
      }
    }
  }
}
```

Set `ZOWE_MCP_MOCK` to `"false"` for live mainframe access.

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
| `ZOWE_PROFILE` | Zowe CLI profile to use | `default` |

## Development

```bash
# Watch mode for development
npm run dev

# Build
npm run build

# Test mock mode
ZOWE_MCP_MOCK=true node dist/index.js
```

## Example Conversations

### Exploring Datasets
> **User**: Show me what datasets I have under DEVUSR1
>
> **AI**: *Uses zowe_list_datasets* - I found 8 datasets under DEVUSR1. You have COBOL source libraries, JCL, copybooks, and data files...

### Diagnosing a Job Failure
> **User**: Job JOB00245 failed. Can you tell me why?
>
> **AI**: *Uses zowe_get_job_status and zowe_get_job_output* - This job failed with ABEND S0C7, which is a Data Exception. This typically means a packed decimal field contains invalid data. Looking at the spool output, I see the error occurred in STEP020...

### Code Understanding
> **User**: Help me understand the PAYROLL program
>
> **AI**: *Uses zowe_read_dataset* - This COBOL program processes payroll data. It reads an indexed employee master file and calculates weekly pay including tax deductions. Let me walk you through the main sections...

## License

MIT


