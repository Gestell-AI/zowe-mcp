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

- **17 Tools** for interacting with z/OS (datasets, jobs, uploads, TSO, console commands, async polling)
- **5 Pre-built Prompts** for common workflows (onboarding, diagnostics, code review)
- **5 Reference Resources** for z/OS concepts (JCL, COBOL, ABEND codes)
- **Safety Guardrails** that block destructive commands (DELETE, CANCEL, PURGE)
- **Mock Mode** for demos and development without a live mainframe
- **Automatic Error Analysis** that explains ABEND codes and return codes

## Quick Start

To develop and customize this MCP view [Development Instructions](./docs/DEV.md)

To learn the full command reference for this MCP view [MCP Reference](./docs/REFERENCE.md)

To run the end-to-end VSAM guided demo [Demo Workflow](./docs/DEMO.md)

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
