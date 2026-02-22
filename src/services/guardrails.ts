import { CommandSafety } from '@gestell/mcp/constants'

interface GuardrailResult {
  safety: CommandSafety;
  allowed: boolean;
  reason: string;
  suggestion?: string;
}

/**
 * TSO Command safety patterns.
 * SAFE: read-only commands that inspect the system
 * CAUTIOUS: commands with side effects that the AI should flag
 * BLOCKED: destructive commands the AI should never execute
 */
const SAFE_PATTERNS: RegExp[] = [
  /^LISTDS/i,
  /^LISTD\s/i,
  /^LISTCAT/i,
  /^STATUS/i,
  /^LISTALC/i,
  /^TIME$/i,
  /^PROFILE$/i,
  /^SEND\s/i,
  /^HELP/i,
  /^PRINTDS/i,
  /^LISTBC/i,
]

const CAUTIOUS_PATTERNS: RegExp[] = [
  /^SUBMIT/i,
  /^ALLOC/i,
  /^FREE/i,
  /^EXEC/i,
  /^CALL/i,
  /^RENAME/i,
  /^COPY/i,
]

const BLOCKED_PATTERNS: RegExp[] = [
  /^DELETE/i,
  /^SCRATCH/i,
  /^FORMAT/i,
  /^CANCEL/i,
  /^PURGE/i,
  /^HALT/i,
  /^FORCE/i,
  /^VARY\s.*OFFLINE/i,
  /^SETPROG/i,
]

const SAFE_CONSOLE: RegExp[] = [
  /^D\s/i,
  /^DISPLAY\s/i,
]

const BLOCKED_CONSOLE: RegExp[] = [
  /^Z\s/i,
  /^CANCEL/i,
  /^FORCE/i,
  /^VARY\s.*OFFLINE/i,
  /^STOP/i,
  /^QUIESCE/i,
]

export function classifyTsoCommand(command: string): GuardrailResult {
  const trimmed = command.trim()

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        safety: CommandSafety.BLOCKED,
        allowed: false,
        reason: `Command "${trimmed.split(/\s/)[0]}" is classified as destructive and cannot be executed by the AI agent.`,
        suggestion: 'This command could cause data loss or system disruption. Please execute it manually via a 3270 terminal or TSO session.'
      }
    }
  }

  for (const pattern of CAUTIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        safety: CommandSafety.CAUTIOUS,
        allowed: true,
        reason: `Command "${trimmed.split(/\s/)[0]}" has side effects. Proceeding with caution.`,
        suggestion: 'This command modifies system state. Review the parameters carefully.'
      }
    }
  }

  for (const pattern of SAFE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        safety: CommandSafety.SAFE,
        allowed: true,
        reason: 'Read-only command. Safe to execute.'
      }
    }
  }

  return {
    safety: CommandSafety.CAUTIOUS,
    allowed: true,
    reason: `Command "${trimmed.split(/\s/)[0]}" is not in the known command list. Proceeding with caution.`,
    suggestion: 'This is an unrecognized command. Verify it is correct before relying on the output.'
  }
}

export function classifyConsoleCommand(command: string): GuardrailResult {
  const trimmed = command.trim()

  for (const pattern of BLOCKED_CONSOLE) {
    if (pattern.test(trimmed)) {
      return {
        safety: CommandSafety.BLOCKED,
        allowed: false,
        reason: `Console command "${trimmed.split(/\s/)[0]}" is classified as destructive and cannot be executed by the AI agent.`,
        suggestion: 'This command could affect system availability. Execute via operator console only.'
      }
    }
  }

  for (const pattern of SAFE_CONSOLE) {
    if (pattern.test(trimmed)) {
      return {
        safety: CommandSafety.SAFE,
        allowed: true,
        reason: 'Display command. Safe to execute.'
      }
    }
  }

  return {
    safety: CommandSafety.CAUTIOUS,
    allowed: true,
    reason: 'Console command not in known safe list. Proceeding with caution.'
  }
}
