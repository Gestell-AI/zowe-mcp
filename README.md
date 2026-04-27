# Zowe MCP Server

[![npm](https://img.shields.io/npm/v/%40gestell%2Fzowe-mcp?label=npm)](https://www.npmjs.com/package/@gestell/zowe-mcp)
[![CI](https://github.com/Gestell-AI/zowe-mcp/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Gestell-AI/zowe-mcp/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/Gestell-AI/zowe-mcp/branch/main/graph/badge.svg)](https://app.codecov.io/github/Gestell-AI/zowe-mcp)

An MCP (Model Context Protocol) server that wraps Zowe CLI so AI assistants can inspect datasets, jobs, spool output, TSO commands, console output, and common z/OS reference material through natural language.

## Quick Start

Run the published package with `npx`:

```bash
npx -y @gestell/zowe-mcp
```

For local development:

```bash
bun install
bun run build
bun run test
```

## Prerequisites

Install and configure Zowe CLI on the machine that will run this MCP server. Verify the active profile before connecting an MCP client:

```bash
zowe zosmf check status --rfj
```

If this command fails, fix Zowe authentication/profile configuration first. See [Configuration](./docs/CONFIGURATION.md) for direct z/OSMF, API ML, profile, timeout, and certificate options.

## MCP Client Setup

Claude Desktop and other JSON-based MCP clients can use this server definition:

```json
{
  "mcpServers": {
    "zowe-mcp-server": {
      "command": "npx",
      "args": ["-y", "@gestell/zowe-mcp"]
    }
  }
}
```

For Codex, use the TOML example in [config/codex.toml](./config/codex.toml). For full environment-variable options, see [Configuration](./docs/CONFIGURATION.md).

## Documentation

| Guide | Purpose |
|---|---|
| [Configuration](./docs/CONFIGURATION.md) | Zowe CLI setup, MCP client config, profiles, mock mode, and runtime environment variables |
| [MCP Reference](./docs/REFERENCE.md) | Tools, prompts, resources, guardrails, and example requests |
| [Architecture](./docs/ARCHITECTURE.md) | Capabilities, runtime flow, component boundaries, safety model, and async task behavior |
| [Development](./docs/DEV.md) | Local build, test, and development workflow |
| [Demo Workflow](./docs/DEMO.md) | Agent-first VSAM demo runbook |

Licensed under [MIT](./LICENSE).
