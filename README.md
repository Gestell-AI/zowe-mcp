# Zowe MCP Server

An MCP (Model Context Protocol) server that wraps Zowe CLI, enabling AI assistants like Claude to interact with z/OS mainframes through natural language.

## What This Does

Instead of learning dozens of Zowe CLI commands, developers can ask an AI assistant questions like:
- "Show me what datasets I have access to"
- "Why did the payroll job fail last night?"
- "Show me the COBOL source for the payroll program"

The MCP server translates these into the right Zowe CLI calls and returns results the AI can explain in plain English.

## Architecture

```
User <-> AI Assistant <-> MCP Protocol <-> This Server <-> Zowe CLI <-> z/OS
```

## Quick Start

```bash
npm install
npm run build
ZOWE_MCP_MOCK=true node dist/index.js
```

See full documentation below.
