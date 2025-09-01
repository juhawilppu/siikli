// lib/validate.ts
import type { z } from 'zod'

/** Compile-time check (input) + runtime parse (output) */
export function typeParse<S extends z.ZodTypeAny>(
  schema: S,
  value: z.input<S>,
): z.output<S> {
  return schema.parse(value) as z.output<S>
}
