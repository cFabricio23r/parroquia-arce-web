import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/roles'
import { appInstallsPingEndpoint } from '../endpoints/app-installs-ping'
import { appInstallsSummaryEndpoint } from '../endpoints/app-installs-summary'

/**
 * Instalaciones de la app. Una ficha por teléfono, identificada por un código
 * seudónimo (hash) que calcula la app y nombres opcionales. No guarda IP ni encabezados. Nadie crea
 * fichas por la API REST normal: solo el endpoint `/api/app-installs/ping`
 * (que escribe con `overrideAccess`).
 */
export const AppInstalls: CollectionConfig = {
  slug: 'app-installs',
  labels: { singular: 'Instalación de la app', plural: 'Instalaciones de la app' },
  admin: {
    useAsTitle: 'platform',
    defaultColumns: ['firstName', 'lastName', 'platform', 'appVersion', 'lastSeenAt', 'firstSeenAt'],
    description: 'Una ficha por dispositivo que abrió la app. No representa descargas ni personas únicas.',
    components: { beforeList: ['/components/admin/AppInstallSummary#AppInstallSummary'] },
    group: 'Estadísticas',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: '-lastSeenAt',
  endpoints: [
    { path: '/ping', method: 'post', handler: appInstallsPingEndpoint },
    { path: '/summary', method: 'get', handler: appInstallsSummaryEndpoint },
  ],
  fields: [
    {
      name: 'deviceHash',
      type: 'text',
      label: 'Código privado del dispositivo',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Identificador seudónimo; no compartir públicamente.' },
    },
    { name: 'firstName', type: 'text', label: 'Nombre', maxLength: 80 },
    { name: 'lastName', type: 'text', label: 'Apellido', maxLength: 80 },
    { name: 'profileRevision', type: 'number', defaultValue: -1, required: true, admin: { hidden: true } },
    {
      name: 'platform',
      type: 'select',
      label: 'Plataforma',
      required: true,
      options: [
        { label: 'Android', value: 'android' },
        { label: 'iOS', value: 'ios' },
      ],
    },
    { name: 'appVersion', type: 'text', label: 'Versión de la app', required: true, maxLength: 20 },
    {
      name: 'firstSeenAt',
      type: 'date',
      label: 'Primera vez visto',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'lastSeenAt',
      type: 'date',
      label: 'Última vez visto',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
