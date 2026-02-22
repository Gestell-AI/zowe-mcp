# Agent End-to-End Prompt

Use this prompt in an MCP-capable client:

```text
Run the VSAM demo using only zowe-mcp-server tools and these instructions:
- demo/instructions/00-overview.md
- demo/instructions/10-bootstrap.md
- demo/instructions/20-run-workflow.md
- demo/instructions/30-validate.md
- demo/instructions/40-failure-handling.md

Rules:
- Execute in order.
- Require CC 0000 for each workflow step.
- On first failure: collect full spool, explain error, stop.
- Produce a final summary with step/job/retcode table and PASS/FAIL.
- Use only zowe-mcp-server tools. Never run direct `zowe` CLI commands.
- If any tool returns `task_id`, always poll with `zowe_wait_async_task` until completion.
- If bootstrap reports `BLOCKED_PRELOAD_REQUIRED`, stop and ask operator to preload artifacts.
```
