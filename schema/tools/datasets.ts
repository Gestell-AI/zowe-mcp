import { z } from 'zod'

export const listDatasetsInputSchema = {
  /** Dataset name pattern to search (for example: `IBMUSER.*` or `PROD.APP.*`). */
  pattern: z.string().describe('Dataset name pattern (e.g., DEVUSR1 or PROD.DATA.*)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const listMembersInputSchema = {
  /** Fully qualified PDS/PDSE dataset name (for example: `IBMUSER.JCL`). */
  dataset: z.string().describe('Fully qualified PDS/PDSE name (e.g., DEVUSR1.COBOL)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const readDatasetInputSchema = {
  /** Dataset or member to read (for example: `IBMUSER.JCL(DEL)` or `IBMUSER.DATA.FILE`). */
  dataset: z.string().describe('Dataset or dataset(member) to read, e.g., DEVUSR1.COBOL(PAYROLL)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const searchDatasetsInputSchema = {
  /** Dataset or member to scan for the search text. */
  dataset: z.string().describe('Dataset or dataset(member) to search'),
  /** Case-insensitive text to find in the dataset content. */
  pattern: z.string().describe('Text pattern to search for'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const uploadFileToDatasetInputSchema = {
  /** Workspace-local file path to upload (for example: `demo/source/10-view/view.jcl`). */
  local_file: z.string().describe('Local file path to upload'),
  /** Target z/OS dataset or member (for example: `DEMO.SAMPLE.JCL(VIEW)`). */
  dataset: z.string().describe('Target dataset or dataset(member)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const uploadDirectoryToPdsInputSchema = {
  /** Workspace-local directory path to upload (each file becomes a member). */
  local_dir: z.string().describe('Local directory path to upload'),
  /** Target partitioned dataset name (for example: `DEMO.SAMPLE.COPYLIB`). */
  dataset: z.string().describe('Target PDS dataset name'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override')
}
