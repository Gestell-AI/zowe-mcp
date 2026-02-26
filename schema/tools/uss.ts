import { z } from 'zod'

export const listUssFilesInputSchema = {
  /** USS directory path to list (e.g., /u/devusr1). */
  path: z.string().describe('USS directory path (e.g., /u/devusr1)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const viewUssFileInputSchema = {
  /** Full USS file path to view (e.g., /u/devusr1/scripts/build.sh). */
  file: z.string().describe('USS file path (e.g., /u/devusr1/scripts/build.sh)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const searchUssFileInputSchema = {
  /** USS file path to search within. */
  file: z.string().describe('USS file path to search'),
  /** Text pattern to search for (case-insensitive). */
  pattern: z.string().describe('Text pattern to search for'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}
