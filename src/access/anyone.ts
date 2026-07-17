import type { Access } from 'payload'

/** Lectura publica sin restriccion. Para media y assets. */
export const anyone: Access = () => true
