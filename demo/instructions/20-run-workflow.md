# Workflow Execution Instructions (Agent)

Submit each job in strict order. For each step:

1. Submit the JCL with `zowe_submit_job`.
2. If submit returns `task_id`, poll with `zowe_wait_async_task` until completion.
3. Poll with `zowe_get_job_status` until completion.
4. If status returns `task_id`, poll with `zowe_wait_async_task` until completion.
5. Require `CC 0000`.
6. Record `step`, `job_id`, `retcode`.
7. On failure, switch to `40-failure-handling.md`.

Hard rule: use only `zowe-mcp-server` tools. Do not execute direct `zowe` CLI commands.

## Ordered Steps

1. `DEMO.SAMPLE.JCL(DEFCAT)`
2. `DEMO.SAMPLE.JCL(DEFACC)`
3. `DEMO.SAMPLE.JCL(DEFTXN)`
4. `DEMO.SAMPLE.JCL(INITVSAM)`
5. `DEMO.SAMPLE.JCL(VERIFY)`
6. `DEMO.SAMPLE.JCL(CREATEAC)`
7. `DEMO.SAMPLE.JCL(SETBAL)`
8. `DEMO.SAMPLE.JCL(GENTRAN)`
9. `DEMO.SAMPLE.JCL(PROCTXN)`
10. `DEMO.SAMPLE.JCL(VIEW)`
11. `DEMO.SAMPLE.JCL(VIEWCOMP)`

## Success Contract

Proceed to validation only if all steps return `CC 0000`.
