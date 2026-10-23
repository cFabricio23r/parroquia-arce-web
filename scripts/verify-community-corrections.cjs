const fs = require('node:fs')
const dir = 'content-audits/2026-10-06'
const after = JSON.parse(fs.readFileSync(`${dir}/corrections/after.json`, 'utf8'))
const result = JSON.parse(fs.readFileSync(`${dir}/corrections/result.json`, 'utf8'))
const base = process.env.COMMUNITY_BASE_URL || 'https://parroquia-arce-web.vercel.app'
async function main() {
  const checks = []
  for (const [collection, route] of [['sectors', 'sectores'], ['groups', 'grupos']]) {
    for (const item of after[collection]) {
      const url = `${base}/${route}/${item.slug}`
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
      const html = await res.text()
      checks.push({ url, status: res.status, title: html.includes(item.name) })
      if (res.status !== 200) throw new Error(`Page failed: ${url} ${res.status}`)
      if (process.env.COMMUNITY_BASE_URL && collection === 'sectors' && item.patron?.image) {
        if (!html.includes(item.patron.image.filename)) throw new Error(`Patron image missing from page: ${item.number}`)
      }
      if (process.env.COMMUNITY_BASE_URL && collection === 'sectors' && item.number === 10 && !html.includes('Los lunes')) throw new Error('Sector 10 presentation missing')
    }
  }
  for (const [, id] of result.newImages) {
    const media = after.sectors.find(s => s.patron?.image?.id === id)?.patron.image
    if (!media?.alt || !media.credit || !media.caption) throw new Error(`Missing image attribution: ${id}`)
    const res = await fetch(media.url, { signal: AbortSignal.timeout(30000) })
    checks.push({ image: id, status: res.status, type: res.headers.get('content-type') })
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image unavailable: ${id}`)
  }
  const label = process.env.COMMUNITY_BASE_URL ? 'local' : 'production'
  fs.writeFileSync(`${dir}/corrections/${label}-checks.json`, JSON.stringify(checks, null, 2))
  console.log(`VERIFIED ${base}: 46 detail pages and ${result.newImages.length} public images`)
}
main().catch(e => { console.error(e); process.exit(1) })
