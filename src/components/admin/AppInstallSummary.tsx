import type { BeforeListServerProps } from 'payload'
import { getInstallSummary } from '../../endpoints/app-installs-summary'

export async function AppInstallSummary({ payload, user }: BeforeListServerProps) {
  if (user?.role !== 'super-admin') return null
  const summary = await getInstallSummary({ payload, user }).catch(() => null)
  if (!summary) {
    return <p role="status" style={{ margin: '0 var(--gutter-h) 24px' }}>No se pudieron cargar las estadísticas. Volvé a cargar la página.</p>
  }
  return (
    <section aria-label="Uso de la app" style={{ margin: '0 var(--gutter-h) 24px' }}>
      <dl style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        {([
          ['Dispositivos registrados', summary.total],
          ['Activos en los últimos 7 días', summary.active7],
          ['Activos en los últimos 30 días', summary.active30],
        ] as const).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd style={{ margin: '8px 0', fontSize: 28, fontWeight: 600 }}>{value}</dd>
          </div>
        ))}
      </dl>
      <p>Se cuentan dispositivos que abrieron la app. Una persona puede usar varios dispositivos. Los nombres son opcionales y no están verificados.</p>
    </section>
  )
}
