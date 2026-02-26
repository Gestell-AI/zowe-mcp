import { z } from 'zod'

export const db2ExecuteSqlInputSchema = {
  /** SQL query to execute against DB2. */
  query: z.string().describe('SQL query to execute (e.g., SELECT * FROM SYSIBM.SYSTABLES FETCH FIRST 10 ROWS ONLY)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override'),
  /** Optional DB2 profile override for this single call. */
  db2_profile: z.string().optional().describe('Optional db2 profile override')
}

export const db2ListTablesInputSchema = {
  /** Schema/creator to filter tables by (e.g., DEVUSR1). Defaults to current user. */
  schema: z.string().optional().describe('Schema/creator filter (e.g., DEVUSR1). Defaults to current user.'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override'),
  /** Optional DB2 profile override for this single call. */
  db2_profile: z.string().optional().describe('Optional db2 profile override')
}

export const db2DescribeTableInputSchema = {
  /** Fully qualified table name (e.g., DEVUSR1.EMPLOYEE). */
  table: z.string().describe('Fully qualified table name (e.g., DEVUSR1.EMPLOYEE)'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override'),
  /** Optional DB2 profile override for this single call. */
  db2_profile: z.string().optional().describe('Optional db2 profile override')
}

export const db2ExportTableInputSchema = {
  /** Fully qualified table name to export data from. */
  table: z.string().describe('Fully qualified table name (e.g., DEVUSR1.EMPLOYEE)'),
  /** Maximum number of rows to export. Defaults to 100. */
  limit: z.number().optional().describe('Max rows to return (default: 100)'),
  /** Optional WHERE clause to filter rows. */
  where: z.string().optional().describe('Optional WHERE clause (e.g., DEPT = \'FINANCE\')'),
  /** Optional z/OSMF profile override for this single call. */
  zosmf_profile: z.string().optional().describe('Optional zosmf profile override'),
  /** Optional base profile override for this single call. */
  base_profile: z.string().optional().describe('Optional base profile override'),
  /** Optional DB2 profile override for this single call. */
  db2_profile: z.string().optional().describe('Optional db2 profile override')
}
