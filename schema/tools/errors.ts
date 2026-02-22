import { z } from 'zod'

export const explainErrorInputSchema = {
  code: z.string().describe('Error code to explain (e.g., S0C7, CC 0012, ABEND S013)')
}

export const listErrorCodesInputSchema = {}
