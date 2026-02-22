# Validation Instructions (Agent)

Run these checks after workflow execution.

Use only `zowe-mcp-server` tools. Do not execute direct `zowe` CLI commands.
If any call returns `task_id`, use `zowe_wait_async_task` until completion.

## Check 1: Expected Libraries Exist

Verify dataset visibility for these names:

- `DEMO.SAMPLE.COBOL`
- `DEMO.SAMPLE.COPYLIB`
- `DEMO.SAMPLE.JCL`
- `DEMO.SAMPLE.OBJ`
- `DEMO.SAMPLE.LOAD`
- `DEMO.SAMPLE.SYSDEBUG`

## Check 2: VSAM Objects Exist

Verify:

- `DEMO.ACCOUNTS.CLUSTER`
- `DEMO.TXN.CLUSTER`
- `DEMO.USERCATALOG`

## Check 3: Reporting Output Is Produced

Confirm `VIEWCOMP` job completed with an allowed non-blocking code (`CC 0000`, `CC 0004`, or `CC 0008`) and spool is retrievable.

## Output Contract

Provide:

1. List of any missing datasets.
2. Job id + retcode for `VIEWCOMP`.
3. Final `PASS` or `FAIL` result.
