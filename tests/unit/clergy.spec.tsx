import { describe, expect, it } from 'vitest'
import { getPublishedClergy, hasBiographyContent } from '@/lib/clergy'

const profile = { published: true, name: ' Padre de prueba ', summary: ' Presentación de prueba ' }

describe('getPublishedClergy', () => {
  it('no inventa perfiles cuando faltan datos', () => {
    expect(getPublishedClergy({})).toEqual([])
    expect(getPublishedClergy({ pastor: null, assistant: null })).toEqual([])
  })
  it('excluye borradores e información incompleta', () => {
    expect(getPublishedClergy({ pastor: { ...profile, published: false } })).toEqual([])
    expect(getPublishedClergy({ pastor: { ...profile, published: undefined } })).toEqual([])
    expect(getPublishedClergy({ pastor: { ...profile, name: '  ' } })).toEqual([])
    expect(getPublishedClergy({ pastor: { ...profile, summary: '\n' } })).toEqual([])
  })
  it('conserva el orden y las anclas aunque cambien los nombres', () => {
    const result = getPublishedClergy({ assistant: profile, pastor: profile })
    expect(result.map(({ id, role }) => [id, role])).toEqual([
      ['parroco', 'Párroco'], ['auxiliar', 'Sacerdote auxiliar'],
    ])
    expect(result[0].name).toBe('Padre de prueba')
    expect(result[0].summary).toBe('Presentación de prueba')
  })
  it('permite publicar solo al auxiliar y editar su cargo', () => {
    expect(getPublishedClergy({ assistant: { ...profile, role: ' Vicario parroquial ' } }))
      .toEqual([expect.objectContaining({ id: 'auxiliar', role: 'Vicario parroquial' })])
  })
})

describe('hasBiographyContent', () => {
  it.each([null, undefined, {}, { root: { children: [] } },
    { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: ' \n' }] }] } },
  ])('reconoce una historia vacía: %j', (value) => {
    expect(hasBiographyContent(value)).toBe(false)
  })
  it('reconoce texto anidado', () => {
    expect(hasBiographyContent({ root: { children: [{ children: [{ text: 'Mi vocación' }] }] } })).toBe(true)
  })
  it('reconoce medios poblados pero no uploads rotos', () => {
    expect(hasBiographyContent({ root: { children: [{ type: 'upload', value: { url: '/foto.jpg' } }] } })).toBe(true)
    expect(hasBiographyContent({ root: { children: [{ type: 'upload', value: null }] } })).toBe(false)
  })
})
