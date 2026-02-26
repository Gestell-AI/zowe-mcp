import {
  db2DescribeTableInputSchema,
  db2ExecuteSqlInputSchema,
  db2ExportTableInputSchema,
  db2ListTablesInputSchema
} from '@gestell/schema/tools/db2'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { executeZoweManaged, formatPendingTaskMessage } from '../services/zowe-async-tasks.js'
import { withZoweOptions } from '../services/zowe-options.js'

export function registerDb2Tools(server: McpServer): void {

  // --- EXECUTE SQL ---
  server.registerTool(
    'zowe_db2_execute_sql',
    {
      title: 'Execute DB2 SQL Query',
      description: `Execute a SQL query against a DB2 subsystem on z/OS.\n\nReturns query results as formatted text. Use for ad-hoc queries, data exploration, and troubleshooting.\n\n⚠️ CAUTION: Can execute INSERT/UPDATE/DELETE. The AI should describe the query before executing write operations.\n\nRequires the @zowe/db2-for-zowe-cli plugin and a configured DB2 profile.\n\nArgs:\n  - query (string): SQL statement to execute\n\nExamples:\n  - "Show me employees in the FINANCE department" -> query: "SELECT * FROM DEVUSR1.EMPLOYEE WHERE DEPT = 'FINANCE'"\n  - "How many records are in the customer table?" -> query: "SELECT COUNT(*) AS TOTAL FROM DEVUSR1.CUSTOMER"`,
      inputSchema: db2ExecuteSqlInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      const args = withZoweOptions(
        ['--query', params.query],
        params,
        { allowZosmfProfile: true }
      )
      // Append DB2 profile if provided
      if (params.db2_profile) {
        args.push('--db2-profile', params.db2_profile)
      } else if (process.env.ZOWE_MCP_DB2_PROFILE) {
        args.push('--db2-profile', process.env.ZOWE_MCP_DB2_PROFILE)
      }

      const execution = await executeZoweManaged('db2 execute sql', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_db2_execute_sql', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error executing DB2 query: ${result.stderr}` }] }
      }

      const summary = [
        `**DB2 Query Result:**`,
        `\`\`\`sql`,
        params.query,
        `\`\`\``,
        '',
        '```',
        result.stdout,
        '```'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  // --- LIST TABLES ---
  server.registerTool(
    'zowe_db2_list_tables',
    {
      title: 'List DB2 Tables',
      description: `List tables in a DB2 subsystem, optionally filtered by schema/creator.\n\nQueries SYSIBM.SYSTABLES to show available tables, their types, and row counts.\n\nArgs:\n  - schema (string, optional): Schema/creator to filter by. Defaults to current user.\n\nExamples:\n  - "What tables do I have?" -> schema: (empty, uses current user)\n  - "List all tables in the PROD schema" -> schema: "PROD"`,
      inputSchema: db2ListTablesInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const schema = params.schema || 'CURRENT SQLID'
      const schemaClause = params.schema
        ? `CREATOR = '${params.schema.toUpperCase()}'`
        : 'CREATOR = CURRENT SQLID'
      const query = `SELECT NAME, TYPE, COLCOUNT, CARD AS ROW_COUNT, CREATOR FROM SYSIBM.SYSTABLES WHERE ${schemaClause} ORDER BY NAME`

      const args = withZoweOptions(
        ['--query', query],
        params,
        { allowZosmfProfile: true }
      )
      if (params.db2_profile) {
        args.push('--db2-profile', params.db2_profile)
      } else if (process.env.ZOWE_MCP_DB2_PROFILE) {
        args.push('--db2-profile', process.env.ZOWE_MCP_DB2_PROFILE)
      }

      const execution = await executeZoweManaged('db2 execute sql', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_db2_list_tables', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error listing DB2 tables: ${result.stderr}` }] }
      }

      const summary = [
        `**DB2 Tables** (schema: ${params.schema || 'current user'}):`,
        '',
        '```',
        result.stdout,
        '```',
        '',
        '**Type codes:** T = Table, V = View, A = Alias, S = Synonym',
        '',
        'Use zowe_db2_describe_table to see column details for a specific table.',
        'Use zowe_db2_execute_sql to query table data.'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  // --- DESCRIBE TABLE ---
  server.registerTool(
    'zowe_db2_describe_table',
    {
      title: 'Describe DB2 Table',
      description: `Describe the structure of a DB2 table — column names, data types, lengths, and nullability.\n\nQueries SYSIBM.SYSCOLUMNS for the table's schema.\n\nArgs:\n  - table (string): Fully qualified table name (SCHEMA.TABLE)\n\nExamples:\n  - "What columns does the EMPLOYEE table have?" -> table: "DEVUSR1.EMPLOYEE"\n  - "Describe the customer record layout" -> table: "PROD.CUSTOMER"`,
      inputSchema: db2DescribeTableInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const parts = params.table.toUpperCase().split('.')
      const schema = parts.length > 1 ? parts[0] : 'CURRENT SQLID'
      const table = parts.length > 1 ? parts[1] : parts[0]
      const schemaClause = parts.length > 1
        ? `TBCREATOR = '${schema}'`
        : 'TBCREATOR = CURRENT SQLID'

      const query = `SELECT NAME, COLTYPE, LENGTH, SCALE, NULLS, DEFAULT, COLNO FROM SYSIBM.SYSCOLUMNS WHERE TBNAME = '${table}' AND ${schemaClause} ORDER BY COLNO`

      const args = withZoweOptions(
        ['--query', query],
        params,
        { allowZosmfProfile: true }
      )
      if (params.db2_profile) {
        args.push('--db2-profile', params.db2_profile)
      } else if (process.env.ZOWE_MCP_DB2_PROFILE) {
        args.push('--db2-profile', process.env.ZOWE_MCP_DB2_PROFILE)
      }

      const execution = await executeZoweManaged('db2 execute sql', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_db2_describe_table', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error describing table: ${result.stderr}` }] }
      }

      const summary = [
        `**Table Structure: ${params.table.toUpperCase()}**`,
        '',
        '```',
        result.stdout,
        '```',
        '',
        '**Common DB2 types:** CHAR/VARCHAR (text), INTEGER/SMALLINT (numbers), DECIMAL (fixed-point), DATE/TIME/TIMESTAMP',
        '',
        'Use zowe_db2_execute_sql to query data from this table.',
        'Use zowe_db2_export_table to export rows.'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )

  // --- EXPORT TABLE ---
  server.registerTool(
    'zowe_db2_export_table',
    {
      title: 'Export DB2 Table Data',
      description: `Export rows from a DB2 table with optional filtering.\n\nBuilds a SELECT query with optional WHERE clause and row limit.\n\nArgs:\n  - table (string): Fully qualified table name (SCHEMA.TABLE)\n  - limit (number, optional): Max rows to return (default: 100)\n  - where (string, optional): WHERE clause filter\n\nExamples:\n  - "Export the first 50 employees" -> table: "DEVUSR1.EMPLOYEE", limit: 50\n  - "Show active customers" -> table: "PROD.CUSTOMER", where: "STATUS = 'ACTIVE'"`,
      inputSchema: db2ExportTableInputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (params) => {
      const limit = params.limit || 100
      let query = `SELECT * FROM ${params.table.toUpperCase()}`
      if (params.where) {
        query += ` WHERE ${params.where}`
      }
      query += ` FETCH FIRST ${limit} ROWS ONLY`

      const args = withZoweOptions(
        ['--query', query],
        params,
        { allowZosmfProfile: true }
      )
      if (params.db2_profile) {
        args.push('--db2-profile', params.db2_profile)
      } else if (process.env.ZOWE_MCP_DB2_PROFILE) {
        args.push('--db2-profile', process.env.ZOWE_MCP_DB2_PROFILE)
      }

      const execution = await executeZoweManaged('db2 execute sql', args)
      if (execution.pending) {
        return { content: [{ type: 'text', text: formatPendingTaskMessage('zowe_db2_export_table', execution.taskId) }] }
      }
      const result = execution.result
      if (!result.success) {
        return { content: [{ type: 'text', text: `Error exporting table: ${result.stderr}` }] }
      }

      const summary = [
        `**Export: ${params.table.toUpperCase()}** (limit: ${limit} rows${params.where ? `, filter: ${params.where}` : ''}):`,
        '',
        '```',
        result.stdout,
        '```'
      ]

      return { content: [{ type: 'text', text: summary.join('\n') }] }
    }
  )
}
