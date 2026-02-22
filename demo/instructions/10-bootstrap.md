# Bootstrap Instructions (Agent)

Verify demo prerequisites, create missing `DEMO.SAMPLE.*` libraries, enforce correct library attributes, and upload required members from local `demo/source/` files.

Use only `zowe-mcp-server` tools.

## Preconditions

1. Dataset prefix is `DEMO.SAMPLE` unless operator provides override.
2. For every tool call returning `task_id`, poll with `zowe_wait_async_task` until completion.
3. Local source files are available under `demo/source/`.

## Step A: Detect Existing Demo Datasets

Run `zowe_list_datasets` with pattern `DEMO.SAMPLE.*`.

If all required datasets are present, skip Step B and go directly to Step C (attribute validation/remediation).

If one or more required datasets are missing, run Step B first.

## Step B: Create Required Libraries When Missing

Run this step only for datasets that are missing. Do not recreate datasets that already exist.

Create missing libraries with `zowe_tso_command` using `ALLOC`.

Create these PDS libraries:

- `DEMO.SAMPLE.COBOL`
- `DEMO.SAMPLE.COPYLIB`
- `DEMO.SAMPLE.JCL`
- `DEMO.SAMPLE.OBJ`
- `DEMO.SAMPLE.LOAD` (must be a load library; see Step C)
- `DEMO.SAMPLE.SYSDEBUG`

Use this command pattern for source/copybook/JCL/object/debug libraries:

`ALLOC DSNAME('DEMO.SAMPLE.COBOL') NEW CATALOG DSORG(PO) RECFM(F,B) LRECL(80) BLKSIZE(0) SPACE(5,5) TRACKS DIR(20)`

Use this command pattern for the load library:

`ALLOC DSNAME('DEMO.SAMPLE.LOAD') NEW CATALOG DSNTYPE(LIBRARY) DSORG(PO) RECFM(U) LRECL(0) BLKSIZE(32760) SPACE(5,5) TRACKS DIR(50)`

Repeat with the appropriate template for each dataset.

After creation, rerun `zowe_list_datasets` with `DEMO.SAMPLE.*` and confirm all required libraries exist.

## Step C: Validate And Remediate Library Attributes

This step is mandatory, even when all datasets already existed.

Attribute contract:

- `DEMO.SAMPLE.COBOL`, `DEMO.SAMPLE.COPYLIB`, `DEMO.SAMPLE.JCL`, `DEMO.SAMPLE.OBJ`, `DEMO.SAMPLE.SYSDEBUG`: `RECFM=FB`, `LRECL=80`
- `DEMO.SAMPLE.LOAD`: `RECFM=U`, `LRECL=0` (binder `SYSLMOD` output requirement)

Use `zowe_list_datasets` and `zowe_tso_command` (`LISTDS 'DEMO.SAMPLE.LOAD'`) to validate.

If `DEMO.SAMPLE.LOAD` is not `RECFM=U` / `LRECL=0`, remediate immediately:

1. `zowe_tso_command`: `FREE DATASET('DEMO.SAMPLE.LOAD')` (if in use)
2. `zowe_tso_command`: `RENAME 'DEMO.SAMPLE.LOAD' 'DEMO.SAMPLE.LOAD.BAD'`
3. `zowe_tso_command`: `ALLOC DSNAME('DEMO.SAMPLE.LOAD') NEW CATALOG DSNTYPE(LIBRARY) DSORG(PO) RECFM(U) LRECL(0) BLKSIZE(32760) SPACE(5,5) TRACKS DIR(50)`
4. Re-run `LISTDS 'DEMO.SAMPLE.LOAD'` and confirm `RECFM=U` / `LRECL=0`.

Proceed after remediation; do not stop on first detection of this mismatch.

## Step D: Upload Required Members From `demo/source/`

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

## Step E: Verify Required Copybook Members

Use `zowe_list_members` on `DEMO.SAMPLE.COPYLIB` and confirm:

- `CUSTCOPY`
- `TXNCOPY`
- `TRANREC`

## Step F: Verify Required COBOL Members

Use `zowe_list_members` on `DEMO.SAMPLE.COBOL` and confirm:

- `INITVSAM`
- `SETBAL`
- `GENTRAN`
- `PROCTXN`
- `VIEW`

## Step G: Verify Required JCL Members

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
3. If library attributes are invalid and remediation fails: stop with `BLOCKED_DATASET_ATTRIBUTE_REMEDIATION_FAILED`.
4. If upload calls fail and members are still missing: stop with `BLOCKED_MEMBER_UPLOAD_FAILED`.
5. Report exact missing datasets/files/members and failed remediation/upload actions.
6. Do not fall back to direct `zowe` CLI operations.

## Output Contract

Return:

1. A table of required datasets with `present/missing`.
2. A table of required members per library with `present/missing`.
3. Final bootstrap verdict: `READY` or one blocking code from the Failure Contract.
