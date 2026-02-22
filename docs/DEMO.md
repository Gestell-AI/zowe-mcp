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
3. If prerequisites are missing, agents must return `BLOCKED_PRELOAD_REQUIRED` and stop.
