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
- Treat any `ABEND` or `CC 0012+` as failure unless it matches a documented recoverable signature.
- On failure: collect full spool first, then apply recoverable-path rules before stopping.
- If full spool output is truncated, use `zowe_list_job_spool_files` and `zowe_get_job_spool_file` to fetch `JESYSMSG` and relevant `SYSPRINT` DDs in pages.
- Produce a final summary with step/job/retcode table and PASS/FAIL.
- Use only zowe-mcp-server tools. Never run direct `zowe` CLI commands.
- If any tool returns `task_id`, always poll with `zowe_wait_async_task` until completion.
- In bootstrap, if required `DEMO.SAMPLE.*` libraries already exist, skip allocation and immediately validate/remediate attributes, then upload members.
- In bootstrap, always validate/remediate dataset attributes before workflow (critical: `DEMO.SAMPLE.LOAD` must be `RECFM=U`, `LRECL=0`).
- If libraries are missing, create only missing libraries using `zowe_tso_command`, then upload members.
- If workflow step fails with `IEW2735S` load-library format mismatch, remediate load library and retry that step once.
- If `INITVSAM` fails with `IDC3351I` / VSAM I/O RC `116` in `VERIFY ... RECOVER`, continue from step 5 without operator approval, and refresh `DEMO.SAMPLE.JCL(INITVSAM)` from `demo/source/04-initvsam/initvsam.jcl`.
- Stop only on explicit bootstrap blocking verdicts (`BLOCKED_DATASET_CREATE_FAILED`, `BLOCKED_SOURCE_MISSING`, `BLOCKED_DATASET_ATTRIBUTE_REMEDIATION_FAILED`, `BLOCKED_MEMBER_UPLOAD_FAILED`).
```
