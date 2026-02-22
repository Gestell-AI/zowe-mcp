import { z } from 'zod'

export const tsoCommandInputSchema = {
  /** TSO command text exactly as you would type it in TSO (for example: `STATUS`). */
  command: z.string().min(1).describe('TSO command to execute'),
  /** Optional TSO account override for environments that require `--account`. */
  account: z.string().optional().describe('TSO/E account (required in some environments)'),
  /** Optional TSO profile override for this single call. */
  tso_profile: z.string().optional().describe('Optional tso profile override'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const consoleCommandInputSchema = {
  /** MVS console command text (for example: `D A`). */
  command: z.string().min(1).describe('MVS console command to execute'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}
