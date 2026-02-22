# Local Development

## Prerequisites

- Node.js 18+ / Bun 1.3+
- [Zowe CLI](https://docs.zowe.org/stable/user-guide/cli-installcli/) installed and configured (for live mode)

## Installation

```bash
git clone https://github.com/Gestell-AI/zowe-mcp.git
cd zowe-mcp
bun install
bun run build
```

## Running in Mock Mode

Mock mode provides realistic simulated z/OS responses for demos and testing:

```bash
ZOWE_MCP_MOCK=true node dist/index.js
```

## Running in Live Mode

Requires Zowe CLI configured with a valid z/OSMF profile:

```bash
node dist/index.js
```

## Development

```bash
# Watch mode for development
bun run dev

# Build
bun run build

# Test mock mode
ZOWE_MCP_MOCK=true node dist/index.js
```
