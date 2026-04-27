# Architecture

`@gestell/zowe-mcp` is a thin MCP server around Zowe CLI. It keeps the AI-facing interface stable while delegating mainframe access, authentication, profiles, and transport details to Zowe.

## Capabilities

- Dataset, member, job, JES spool, TSO, console, USS, DB2, and async polling tools
- Pre-built prompts for onboarding, diagnostics, code review, exploration, and daily operations
- Reference resources for z/OS concepts, JCL, COBOL, ABEND codes, and Zowe CLI usage
- Safety guardrails for destructive TSO and console commands
- Mock mode for demos and tests without a live mainframe
- Automatic error analysis for ABEND and return codes

## Runtime Flow

```text
User <-> AI Assistant <-> MCP Protocol <-> Zowe MCP Server <-> Zowe CLI <-> z/OS
```

1. The MCP client starts this server with `npx -y @gestell/zowe-mcp` or a local build.
2. The assistant calls MCP tools such as `zowe_list_datasets`, `zowe_get_job_output`, or `zowe_tso_command`.
3. The server validates and classifies the request.
4. The server invokes Zowe CLI with the configured profiles and timeout settings.
5. Results are normalized into MCP tool responses for the assistant.

## Main Components

| Component | Responsibility |
|---|---|
| MCP server entrypoint | Registers tools, prompts, and resources with the MCP SDK |
| Tool modules | Convert MCP tool inputs into Zowe operations |
| Zowe executor | Runs Zowe CLI, captures output, parses JSON, and handles timeouts |
| Guardrails | Classify TSO and console commands as safe, cautious, or blocked |
| Error reference | Explains ABEND codes, condition codes, and common job output signatures |
| Mock provider | Returns deterministic demo/test responses without calling Zowe CLI |
| Async task registry | Tracks long-running operations and exposes polling helpers |

## Safety Model

The server classifies command tools before execution:

| Risk Level | Behavior | Examples |
|---|---|---|
| Safe | Execute normally | `LISTDS`, `STATUS`, `DISPLAY` |
| Cautious | Execute with warning context | `SUBMIT`, `ALLOC`, `FREE`, `CALL` |
| Blocked | Reject before invoking Zowe CLI | `DELETE`, `CANCEL`, `PURGE`, `FORCE` |

Dataset, job, and reference tools are structured APIs rather than free-form shell access. TSO and console tools are the highest-risk surfaces and go through explicit command classification.

## Async Behavior

Long-running Zowe calls can outlive the inline tool response window. When a call exceeds `ZOWE_MCP_INLINE_WAIT_MS`, the server returns a `task_id`. Clients should then use:

1. `zowe_wait_async_task` for normal polling.
2. `zowe_get_async_task` for direct status checks.
3. `zowe_list_async_tasks` for recent task inspection.

Completed async tasks are retained in memory according to `ZOWE_MCP_TASK_TTL_MS` and `ZOWE_MCP_MAX_TASKS`.

## Mock vs Live Mode

| Mode | Behavior | Primary Use |
|---|---|---|
| Mock | Uses built-in simulated responses and does not call Zowe CLI | Demos, tests, local development |
| Live | Calls Zowe CLI with configured profiles | Real mainframe operations |

Mock mode is enabled with `ZOWE_MCP_MOCK=true`.

## Configuration Boundary

This server does not replace Zowe CLI configuration. It expects Zowe CLI to own credentials, profiles, certificate handling, and target-system connectivity. See [Configuration](./CONFIGURATION.md) for setup details.
