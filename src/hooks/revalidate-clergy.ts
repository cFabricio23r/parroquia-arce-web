import type { GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateClergy: GlobalAfterChangeHook = ({ doc, req }) => {
  // Las herramientas fuera de Next pueden omitir la invalidación explícitamente.
  if (!req.context.disableRevalidate) revalidatePath('/', 'layout')
  return doc
}
