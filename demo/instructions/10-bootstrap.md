# Bootstrap Verification Instructions (Agent)

Verify that demo prerequisites are already staged on z/OS.

Do not create datasets and do not upload members in this step.
Use only `zowe-mcp-server` tools.

## Preconditions

1. Dataset prefix is `DEMO.SAMPLE` unless operator provides override.
2. Demo assets are expected to already exist on host datasets.
3. For every tool call returning `task_id`, poll with `zowe_wait_async_task` until completion.

## Step A: Verify Required PDS Libraries Exist

Use `zowe_list_datasets` and confirm these datasets are present:

- `DEMO.SAMPLE.COBOL`
- `DEMO.SAMPLE.COPYLIB`
- `DEMO.SAMPLE.JCL`
- `DEMO.SAMPLE.OBJ`
- `DEMO.SAMPLE.LOAD`
- `DEMO.SAMPLE.SYSDEBUG`

## Step B: Verify Required Copybook Members

Use `zowe_list_members` on `DEMO.SAMPLE.COPYLIB` and confirm:

- `CUSTCOPY`
- `TXNCOPY`
- `TRANREC`

## Step C: Verify Required COBOL Members

Use `zowe_list_members` on `DEMO.SAMPLE.COBOL` and confirm:

- `INITVSAM`
- `SETBAL`
- `GENTRAN`
- `PROCTXN`
- `VIEW`

## Step D: Verify Required JCL Members

Use `zowe_list_members` on `DEMO.SAMPLE.JCL` and confirm:

- `DEFCAT`
- `DEFACC`
- `DEFTXN`
- `INITVSAM`
- `VERIFY`
- `CREATEAC`
- `SETBAL`
- `GENTRAN`
- `PROCTXN`
- `VIEW`
- `VIEWCOMP`

## Failure Contract

If any required dataset/member is missing:

1. Stop immediately with `BLOCKED_PRELOAD_REQUIRED`.
2. Report exact missing datasets/members.
3. Tell operator to preload artifacts outside this runbook.
4. Do not fall back to direct `zowe` CLI operations.

## Output Contract

Return:

1. A table of required datasets with `present/missing`.
2. A table of required members per library with `present/missing`.
3. Final bootstrap verdict: `READY` or `BLOCKED_PRELOAD_REQUIRED`.
