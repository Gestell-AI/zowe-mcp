# VSAM Demo Overview

This instruction set defines an end-to-end demo workflow that an MCP-capable agent can execute using `zowe-mcp-server` tools.

## Goal

Run the VSAM sample flow from catalog definition to report output, while enforcing explicit success checks at each step.

## Inputs

Use files from `demo/source/`.

## Required MCP Tools

- `zowe_submit_job`
- `zowe_get_job_status`
- `zowe_get_job_output`
- `zowe_list_datasets`
- `zowe_list_members`
- `zowe_explain_error`
- `zowe_wait_async_task`

## Execution Order

1. `demo/instructions/10-bootstrap.md`
2. `demo/instructions/20-run-workflow.md`
3. `demo/instructions/30-validate.md`
4. `demo/instructions/40-failure-handling.md` (only on failure)

## Global Rules For Agents

1. Stop on first failing job unless the operator explicitly asks to continue.
2. For each failed job, capture spool and provide error explanation.
3. Treat `CC 0000` as required success for each workflow step.
4. Persist a run log with step, job id, and return code.
5. Use only `zowe-mcp-server` tools; do not run direct `zowe` CLI commands.
6. For any tool call that returns `task_id`, poll with `zowe_wait_async_task` until completion.
