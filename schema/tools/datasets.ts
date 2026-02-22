import { z } from 'zod'

export const listDatasetsInputSchema = {
  pattern: z.string().describe('Dataset name pattern (e.g., DEVUSR1 or PROD.DATA.*)'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const listMembersInputSchema = {
  dataset: z.string().describe('Fully qualified PDS/PDSE name (e.g., DEVUSR1.COBOL)'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const readDatasetInputSchema = {
  dataset: z.string().describe('Dataset or dataset(member) to read, e.g., DEVUSR1.COBOL(PAYROLL)'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const searchDatasetsInputSchema = {
  dataset: z.string().describe('Dataset or dataset(member) to search'),
  pattern: z.string().describe('Text pattern to search for'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}
