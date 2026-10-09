import type { Access } from 'payload'

export const isActivityEditor = (user: { role?: string | null } | null | undefined) =>
  Boolean(user && ['super-admin', 'contenido', 'comunicaciones'].includes(user.role || ''))

export const canManageActivity: Access = ({ req }) => isActivityEditor(req.user)
