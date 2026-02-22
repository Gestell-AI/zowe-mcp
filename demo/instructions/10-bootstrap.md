# Bootstrap Instructions (Agent)

Prepare required datasets and upload demo assets before running workflow jobs.

## Preconditions

1. Zowe connection is valid (`zowe zosmf check status --rfj` succeeds outside this runbook).
2. Dataset prefix is `DEMO.SAMPLE` unless operator provides override.
3. Source files are present under `demo/source/`.

## Step A: Ensure Required PDS Libraries Exist

Ensure the following libraries are present:

- `DEMO.SAMPLE.COBOL`
- `DEMO.SAMPLE.COPYLIB`
- `DEMO.SAMPLE.JCL`
- `DEMO.SAMPLE.OBJ`
- `DEMO.SAMPLE.LOAD`
- `DEMO.SAMPLE.SYSDEBUG`

If missing, ask the operator for permission to create them using standard Zowe file creation operations.

## Step B: Upload Copybooks

Upload:

- `demo/source/copybooks/CUSTCOPY.cpy` -> `DEMO.SAMPLE.COPYLIB(CUSTCOPY)`
- `demo/source/copybooks/TXNCOPY.cpy` -> `DEMO.SAMPLE.COPYLIB(TXNCOPY)`
- `demo/source/copybooks/TRANREC.cpy` -> `DEMO.SAMPLE.COPYLIB(TRANREC)`

## Step C: Upload COBOL Programs

Upload:

- `demo/source/04-initvsam/INITVSAM.cbl` -> `DEMO.SAMPLE.COBOL(INITVSAM)`
- `demo/source/07-setbal/SETBAL.cbl` -> `DEMO.SAMPLE.COBOL(SETBAL)`
- `demo/source/08-gentran/GENTRAN.cbl` -> `DEMO.SAMPLE.COBOL(GENTRAN)`
- `demo/source/09-proctxn/PROCTXN.cbl` -> `DEMO.SAMPLE.COBOL(PROCTXN)`
- `demo/source/10-view/view.cbl` -> `DEMO.SAMPLE.COBOL(VIEW)`

## Step D: Upload JCL Members

Upload:

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

## Output Contract

Return a concise table of uploaded members and target datasets.
