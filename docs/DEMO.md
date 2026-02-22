# Demo Workflow: Agent-First Guide

This project's demo workflow now lives under `demo/` and is intentionally markdown-only for agent execution.

## Start Here

1. `demo/README.md`
2. `demo/instructions/00-overview.md`
3. `demo/instructions/agent-end-to-end.md`

## Instruction Modules

- `demo/instructions/10-bootstrap.md`
- `demo/instructions/20-run-workflow.md`
- `demo/instructions/30-validate.md`
- `demo/instructions/40-failure-handling.md`

## Demo Inputs

All sample assets are under `demo/source/` and were sourced from the VSAM demo workflow.

## Why This Structure

1. Easier for agents to follow than mixed YAML and shell.
2. Clear modular phases for setup, execute, validate, and recovery.
3. Human-readable and auditable in PR review.

## Enforcement Rule

This demo runbook is MCP-only:

1. Agents must use `zowe-mcp-server` tools only.
2. Agents must not execute direct `zowe` CLI commands.
3. During bootstrap, if required `DEMO.SAMPLE.*` libraries already exist, agents should skip allocation and go straight to attribute validation/remediation, then member upload.
4. If required libraries are missing, agents should create only the missing ones via `zowe_tso_command`.
5. Bootstrap must validate/remediate required dataset attributes before upload/member verification (`DEMO.SAMPLE.LOAD` must be `RECFM=U`, `LRECL=0`).
6. Agents should upload required members from `demo/source/` via dataset upload tools before member verification.
7. If a workflow step fails with `IEW2735S` due load-library format mismatch, agents should remediate and retry that step once before hard-failing.
8. If `INITVSAM` fails with `IDC3351I` / VSAM I/O RC `116` in `VERIFY ... RECOVER`, agents should continue to the next workflow step without operator approval and refresh `DEMO.SAMPLE.JCL(INITVSAM)` from source for future runs.
9. If full spool output is truncated, agents should use `zowe_list_job_spool_files` and `zowe_get_job_spool_file` for targeted DD extraction (`JESYSMSG`, `SYSPRINT`) instead of blocking.

## Return Code Policy

For workflow execution steps:

1. Continue on `CC 0000`, `CC 0004`, and `CC 0008`.
2. Fail on any `ABEND` or `CC 0012` and higher, except documented recoverable signatures handled by runbook auto-remediation/continue rules.
