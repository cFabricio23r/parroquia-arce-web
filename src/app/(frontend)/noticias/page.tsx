import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const metadata: Metadata = {
  title: 'Noticias y formación',
}

// ISR: la web casi no golpea Postgres.
export const revalidate = 300

export default async function NoticiasPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 20,
  })

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Noticias y formación</h1>

      {docs.length === 0 ? (
        <p>Aún no hay noticias publicadas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {docs.map((n) => (
            <li key={n.id} style={{ marginBottom: 32 }}>
              {n.category && <span>{n.category}</span>}
              {n.publishedAt && (
                <div>
                  {new Date(n.publishedAt).toLocaleDateString('es-SV', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              )}
              <h2>{n.title}</h2>
              {n.excerpt && <p>{n.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
