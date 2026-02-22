import { z } from 'zod'

export const explainErrorInputSchema = {
  /** Error code or return code to explain (for example: `S0C7`, `ABEND S013`, `CC 0012`). */
  code: z.string().describe('Error code to explain (e.g., S0C7, CC 0012, ABEND S013)')
}

/** This tool takes no input parameters. */
export const listErrorCodesInputSchema = {}
