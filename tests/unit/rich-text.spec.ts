import { describe, it, expect } from 'vitest'
import { hasRichText } from '@/lib/rich-text'

const root = (children: unknown[]) => ({ root: { type: 'root', children } })

describe('hasRichText', () => {
  it('is false for null and non-objects', () => {
    expect(hasRichText(null)).toBe(false)
    expect(hasRichText(undefined)).toBe(false)
    expect(hasRichText('x')).toBe(false)
  })
  it('is false for an empty root', () => {
    expect(hasRichText(root([]))).toBe(false)
  })
  it('is false for a root with only an empty paragraph', () => {
    expect(hasRichText(root([{ type: 'paragraph', children: [] }]))).toBe(false)
    expect(
      hasRichText(root([{ type: 'paragraph', children: [{ type: 'text', text: '  ' }] }])),
    ).toBe(false)
  })
  it('is true for a paragraph with text', () => {
    expect(
      hasRichText(root([{ type: 'paragraph', children: [{ type: 'text', text: 'Hola' }] }])),
    ).toBe(true)
  })
  it('finds text nested in lists', () => {
    expect(
      hasRichText(
        root([
          {
            type: 'list',
            children: [{ type: 'listitem', children: [{ type: 'text', text: 'Uno' }] }],
          },
        ]),
      ),
    ).toBe(true)
  })
})
