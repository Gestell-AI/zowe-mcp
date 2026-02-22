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
- Continue on `CC 0000`, `CC 0004`, or `CC 0008`.
- Treat any `ABEND` or `CC 0012+` as failure.
- On first failure: collect full spool, explain error, stop.
- Produce a final summary with step/job/retcode table and PASS/FAIL.
- Use only zowe-mcp-server tools. Never run direct `zowe` CLI commands.
- If any tool returns `task_id`, always poll with `zowe_wait_async_task` until completion.
- In bootstrap, if required `DEMO.SAMPLE.*` libraries already exist, skip allocation and immediately upload members.
- If libraries are missing, create only missing libraries using `zowe_tso_command`, then upload members.
- Stop only on explicit bootstrap blocking verdicts (`BLOCKED_DATASET_CREATE_FAILED`, `BLOCKED_SOURCE_MISSING`, `BLOCKED_MEMBER_UPLOAD_FAILED`).
```
