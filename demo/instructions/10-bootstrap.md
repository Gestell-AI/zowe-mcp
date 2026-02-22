# Bootstrap Instructions (Agent)

Verify demo prerequisites, create missing `DEMO.SAMPLE.*` libraries, and upload required members from local `demo/source/` files.

Use only `zowe-mcp-server` tools.

## Preconditions

1. Dataset prefix is `DEMO.SAMPLE` unless operator provides override.
2. For every tool call returning `task_id`, poll with `zowe_wait_async_task` until completion.
3. Local source files are available under `demo/source/`.

## Step A: Detect Existing Demo Datasets

Run `zowe_list_datasets` with pattern `DEMO.SAMPLE.*`.

If all required datasets are present, skip Step B and go directly to Step C (upload members).

If one or more required datasets are missing, run Step B first.

## Step B: Create Required Libraries When Missing

Run this step only for datasets that are missing. Do not recreate datasets that already exist.

Create missing libraries with `zowe_tso_command` using `ALLOC`.

Create these PDS libraries:

- `DEMO.SAMPLE.COBOL`
- `DEMO.SAMPLE.COPYLIB`
- `DEMO.SAMPLE.JCL`
- `DEMO.SAMPLE.OBJ`
- `DEMO.SAMPLE.LOAD`
- `DEMO.SAMPLE.SYSDEBUG`

Use command pattern:

`ALLOC DSNAME('DEMO.SAMPLE.COBOL') NEW CATALOG DSORG(PO) RECFM(F,B) LRECL(80) BLKSIZE(0) SPACE(5,5) TRACKS DIR(20)`

Repeat for each dataset name above.

After creation, rerun `zowe_list_datasets` with `DEMO.SAMPLE.*` and confirm all required libraries exist.

## Step C: Upload Required Members From `demo/source/`

Use `zowe_upload_file_to_dataset` to upload all required members:

Copybooks -> `DEMO.SAMPLE.COPYLIB`

- `demo/source/copybooks/CUSTCOPY.cpy` -> `DEMO.SAMPLE.COPYLIB(CUSTCOPY)`
- `demo/source/copybooks/TXNCOPY.cpy` -> `DEMO.SAMPLE.COPYLIB(TXNCOPY)`
- `demo/source/copybooks/TRANREC.cpy` -> `DEMO.SAMPLE.COPYLIB(TRANREC)`

COBOL -> `DEMO.SAMPLE.COBOL`

- `demo/source/04-initvsam/INITVSAM.cbl` -> `DEMO.SAMPLE.COBOL(INITVSAM)`
- `demo/source/07-setbal/SETBAL.cbl` -> `DEMO.SAMPLE.COBOL(SETBAL)`
- `demo/source/08-gentran/GENTRAN.cbl` -> `DEMO.SAMPLE.COBOL(GENTRAN)`
- `demo/source/09-proctxn/PROCTXN.cbl` -> `DEMO.SAMPLE.COBOL(PROCTXN)`
- `demo/source/10-view/view.cbl` -> `DEMO.SAMPLE.COBOL(VIEW)`

JCL -> `DEMO.SAMPLE.JCL`

- `demo/source/01-defcat/defcat.jcl` -> `DEMO.SAMPLE.JCL(DEFCAT)`
- `demo/source/02-defacc/defacc.jcl` -> `DEMO.SAMPLE.JCL(DEFACC)`
- `demo/source/03-deftxn/deftxn.jcl` -> `DEMO.SAMPLE.JCL(DEFTXN)`
- `demo/source/04-initvsam/initvsam.jcl` -> `DEMO.SAMPLE.JCL(INITVSAM)`
- `demo/source/05-verify/verify.jcl` -> `DEMO.SAMPLE.JCL(VERIFY)`
- `demo/source/06-createac/createac.jcl` -> `DEMO.SAMPLE.JCL(CREATEAC)`
- `demo/source/07-setbal/setbal.jcl` -> `DEMO.SAMPLE.JCL(SETBAL)`
- `demo/source/08-gentran/gentran.jcl` -> `DEMO.SAMPLE.JCL(GENTRAN)`
- `demo/source/09-proctxn/proctxn.jcl` -> `DEMO.SAMPLE.JCL(PROCTXN)`
- `demo/source/10-view/view.jcl` -> `DEMO.SAMPLE.JCL(VIEW)`
- `demo/source/10-view/viewcomp.jcl` -> `DEMO.SAMPLE.JCL(VIEWCOMP)`

## Step D: Verify Required Copybook Members

Use `zowe_list_members` on `DEMO.SAMPLE.COPYLIB` and confirm:

- `CUSTCOPY`
- `TXNCOPY`
- `TRANREC`

## Step E: Verify Required COBOL Members

Use `zowe_list_members` on `DEMO.SAMPLE.COBOL` and confirm:

- `INITVSAM`
- `SETBAL`
- `GENTRAN`
- `PROCTXN`
- `VIEW`

## Step F: Verify Required JCL Members

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

Stop only when bootstrap cannot self-heal:

1. If required libraries are still missing after create attempts: stop with `BLOCKED_DATASET_CREATE_FAILED`.
2. If required source files are missing in `demo/source/`: stop with `BLOCKED_SOURCE_MISSING`.
3. If upload calls fail and members are still missing: stop with `BLOCKED_MEMBER_UPLOAD_FAILED`.
4. Report exact missing datasets/files/members and failed upload actions.
5. Do not fall back to direct `zowe` CLI operations.

## Output Contract

Return:

1. A table of required datasets with `present/missing`.
2. A table of required members per library with `present/missing`.
3. Final bootstrap verdict: `READY` or one blocking code from the Failure Contract.
