# Workflow Execution Instructions (Agent)

Submit each job in strict order. For each step:

1. Submit the JCL with `zowe_submit_job`.
2. If submit returns `task_id`, poll with `zowe_wait_async_task` until completion.
3. Poll with `zowe_get_job_status` until completion.
4. If status returns `task_id`, poll with `zowe_wait_async_task` until completion.
5. Record `step`, `job_id`, `retcode`.
6. Treat these return codes as non-blocking and continue: `CC 0000`, `CC 0004`, `CC 0008`.
7. For failures (`ABEND`, `CC 0012+`, unknown retcode), fetch spool immediately with `zowe_get_job_output` and check for known recoverable signatures before hard-failing.
8. Recoverable path A (retry once): if spool contains `IEW2735S` and indicates `SYSLMOD`/load-library format mismatch, remediate `DEMO.SAMPLE.LOAD` to `RECFM=U`, `LRECL=0` (same commands as bootstrap Step C), then rerun the same step once.
9. Recoverable path B (no approval gate): if step is `DEMO.SAMPLE.JCL(INITVSAM)` and spool shows `IDC3351I` or VSAM I/O return code `116` in `VERIFY ... RECOVER`, continue to step 5 immediately (treat as non-blocking recover warning for demo flow). Also upload the latest `demo/source/04-initvsam/initvsam.jcl` so future runs use non-blocking RECOVER gating.
10. If retry in path A succeeds with `CC 0000`, `CC 0004`, or `CC 0008`, continue workflow.
11. If failure is not in a known recoverable path, switch to `40-failure-handling.md`.

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

Proceed to validation only if all steps end with allowed non-blocking return codes:

- `CC 0000`
- `CC 0004`
- `CC 0008`
