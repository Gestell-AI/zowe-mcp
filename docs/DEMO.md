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

## Return Code Policy

For workflow execution steps:

1. Continue on `CC 0000`, `CC 0004`, and `CC 0008`.
2. Fail on any `ABEND` or `CC 0012` and higher.
