# Workflow Execution Instructions (Agent)

Submit each job in strict order. For each step:

1. Submit the JCL with `zowe_submit_job`.
2. Poll with `zowe_get_job_status` until completion.
3. Require `CC 0000`.
4. Record `step`, `job_id`, `retcode`.
5. On failure, switch to `40-failure-handling.md`.

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
