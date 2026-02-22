import { z } from 'zod'

export const tsoCommandInputSchema = {
  command: z.string().min(1).describe('TSO command to execute'),
  account: z.string().optional().describe('TSO/E account (required in some environments)'),
  tso_profile: z.string().optional().describe('Optional tso profile override'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}

export const consoleCommandInputSchema = {
  command: z.string().min(1).describe('MVS console command to execute'),
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  base_profile: z.string().optional().describe('Optional base profile override')
}
