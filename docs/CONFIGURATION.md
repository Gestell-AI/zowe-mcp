# Configuration

This guide covers the runtime setup needed before an MCP client can use `@gestell/zowe-mcp`.

## Zowe CLI

Install Zowe CLI and configure access to your z/OS environment on the same machine that runs the MCP server.

### Direct z/OSMF

Use this path when your host responds on `/zosmf/info` and does not expose API ML at `/gateway/api/v1/...`.

```bash
zowe config init
zowe zosmf check status --rfj
```

After setup, confirm `~/.zowe/zowe.config.json` and the selected profiles match the target system.

### API ML / APIML Gateway

Use this path only when the target host exposes the API Mediation Layer gateway.

```bash
zowe config auto-init --host "Z.SERVER.IP.OR.HOST"
zowe auth login apiml
zowe zosmf check status --rfj
```

`zowe config auto-init` calls the API ML gateway login endpoint at `/gateway/api/v1/auth/login`. If that endpoint returns `404 Not Found`, the target likely exposes z/OSMF directly but not API ML, so use `zowe config init` instead.

### TSO Account

Some environments require a TSO account value. Create or select a TSO profile with the account configured:

```bash
zowe profiles create tso mytso --account ACCT001
```

You can usually find your account number from TSO:

```bash
tsocmd "LISTUSER MY_USER_ID TSO NORACF"
```

## MCP Client Configuration

For Claude Desktop, copy the `zowe-mcp-server` entry from [config/mcp.json](../config/mcp.json) into:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

Minimal JSON configuration:

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

Codex users can start from [config/codex.toml](../config/codex.toml).

## Mock Mode

Mock mode returns realistic simulated z/OS responses for demos, tests, and local development without a live mainframe.

```bash
ZOWE_MCP_MOCK=true npx -y @gestell/zowe-mcp
```

For MCP client configs, set `ZOWE_MCP_MOCK` in the server `env` object.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ZOWE_MCP_MOCK` | Enable mock mode (`true`/`false`) | `false` |
| `ZOWE_MCP_BASE_PROFILE` | Base profile name to pass as `--base-profile` | unset |
| `ZOWE_MCP_ZOSMF_PROFILE` | z/OSMF profile name for files/jobs/console commands | unset |
| `ZOWE_MCP_TSO_PROFILE` | TSO profile name for TSO commands | unset |
| `ZOWE_MCP_TSO_ACCOUNT` | TSO account to pass as `--account` when required | unset |
| `ZOWE_MCP_DB2_PROFILE` | DB2 profile name for DB2 tools | unset |
| `ZOWE_MCP_EXEC_TIMEOUT_MS` | Per-command Zowe CLI timeout in milliseconds | `300000` |
| `ZOWE_MCP_INLINE_WAIT_MS` | How long a tool waits before returning an async `task_id` | `10000` |
| `ZOWE_MCP_WAIT_TOOL_MAX_WAIT_MS` | Default max wait window for `zowe_wait_async_task` | `300000` |
| `ZOWE_MCP_WAIT_TOOL_POLL_INTERVAL_MS` | Default poll interval for `zowe_wait_async_task` | `2000` |
| `ZOWE_MCP_TASK_TTL_MS` | How long completed async tasks are retained | `3600000` |
| `ZOWE_MCP_MAX_TASKS` | Maximum in-memory async task records kept | `300` |
| `ZOWE_PROFILE` | Legacy fallback base profile. Ignored when set to `default` | `default` |
| `ZOWE_CLI_HOME` | Override the Zowe CLI home directory | unset |
| `NODE_EXTRA_CA_CERTS` | Additional CA bundle for TLS verification | unset |

## DB2 Setup

DB2 tools require the Zowe DB2 CLI plugin in addition to the base Zowe CLI configuration.

```bash
zowe plugins install @zowe/db2-for-zowe-cli
```

Configure a DB2 profile with Zowe CLI, then set `ZOWE_MCP_DB2_PROFILE` or pass the DB2 profile through supported tool inputs.

## Troubleshooting

If the MCP server starts but tools fail, run the equivalent Zowe CLI check from the same shell and environment used by the MCP client.

```bash
zowe zosmf check status --rfj
```

If this fails, the issue is Zowe CLI configuration, credentials, certificates, or network access rather than MCP protocol handling.
