# Failure Handling Instructions (Agent)

Use this playbook when any workflow step fails.

Use only `zowe-mcp-server` tools. Do not execute direct `zowe` CLI commands.
If any call returns `task_id`, use `zowe_wait_async_task` until completion.

Trigger this playbook when:

- Any step returns `ABEND`
- Any step returns `CC 0012` or higher
- Any step returns unknown/unparseable retcode
- The failure is not a known recoverable case:
  - `IEW2735S` load-library format mismatch (after one remediation/retry)
  - `INITVSAM` `IDC3351I` / VSAM I/O RC `116` in `VERIFY ... RECOVER` (non-blocking for demo flow)

## Required Actions

1. Fetch full spool using `zowe_get_job_output`.
2. Extract ABEND/CC indicators from output.
3. Explain the code using `zowe_explain_error`.
4. Summarize probable root cause in one paragraph.
5. Stop execution and report failure package; do not ask for operator approval in the normal flow.

## Failure Report Template

- `step`:
- `job_id`:
- `retcode`:
- `error_code`:
- `summary`:
- `recommended_next_action`:
