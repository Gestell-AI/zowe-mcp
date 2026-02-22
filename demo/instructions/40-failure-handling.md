# Failure Handling Instructions (Agent)

Use this playbook when any workflow step fails.

## Required Actions

1. Fetch full spool using `zowe_get_job_output`.
2. Extract ABEND/CC indicators from output.
3. Explain the code using `zowe_explain_error`.
4. Summarize probable root cause in one paragraph.
5. Stop execution and ask operator whether to continue.

## Failure Report Template

- `step`:
- `job_id`:
- `retcode`:
- `error_code`:
- `summary`:
- `recommended_next_action`:
