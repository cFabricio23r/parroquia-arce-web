import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Lista los usuarios y, si se pasan RESET_EMAIL y RESET_PASSWORD, resetea la
 * password y limpia el bloqueo por intentos fallidos (loginAttempts/lockUntil).
 * No borra contenido.
 *
 * Uso:
 *   Ver usuarios:   npx payload run scripts/reset-admin.ts
 *   Resetear:       RESET_EMAIL="tu@email" RESET_PASSWORD="nueva" npx payload run scripts/reset-admin.ts
 */
const payload = await getPayload({ config })

const users = await payload.find({ collection: 'users', limit: 100, depth: 0 })

console.log(`\nUsuarios existentes (${users.totalDocs}):`)
for (const u of users.docs) {
  const locked = u.lockUntil && new Date(u.lockUntil) > new Date() ? ' [BLOQUEADO]' : ''
  console.log(
    `  - ${u.email}  role=${u.role}  loginAttempts=${u.loginAttempts ?? 0}  lockUntil=${u.lockUntil ?? '—'}${locked}`,
  )
}

const email = process.env.RESET_EMAIL
const password = process.env.RESET_PASSWORD

if (!email || !password) {
  console.log(
    '\nPara resetear una password:\n  RESET_EMAIL="tu@email" RESET_PASSWORD="nueva" npx payload run scripts/reset-admin.ts',
  )
  process.exit(0)
}

const target = users.docs.find((u) => u.email === email)
if (!target) {
  console.error(`\n❌ No existe un usuario con email "${email}". Revisá la lista de arriba.`)
  process.exit(1)
}

await payload.update({
  collection: 'users',
  id: target.id,
  data: { password, loginAttempts: 0, lockUntil: null },
})

console.log(`\n✅ Password reseteada y bloqueo limpiado para ${email}.`)
process.exit(0)
