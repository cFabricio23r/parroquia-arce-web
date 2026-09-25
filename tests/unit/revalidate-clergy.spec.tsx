import { beforeEach, expect, it, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { revalidateClergy } from '@/hooks/revalidate-clergy'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
beforeEach(() => vi.clearAllMocks())

it('invalida Inicio, página y pie compartido al guardar', async () => {
  const doc = { pastor: { published: false } }
  const args = { doc, req: { context: {} } } as Parameters<typeof revalidateClergy>[0]
  expect(await revalidateClergy(args)).toBe(doc)
  expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/', 'layout')
})

it('permite ejecutar herramientas offline sin el runtime de Next', async () => {
  const doc = {}
  const args = { doc, req: { context: { disableRevalidate: true } } } as unknown as Parameters<typeof revalidateClergy>[0]
  expect(await revalidateClergy(args)).toBe(doc)
  expect(revalidatePath).not.toHaveBeenCalled()
})
