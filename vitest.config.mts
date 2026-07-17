import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Los tests de integracion comparten UNA sola base (Supabase). En paralelo,
    // cada archivo dispara su propio `push` de esquema y chocan al crear los
    // mismos enums (Postgres 42710), ademas de pisarse los datos entre si.
    fileParallelism: false,
  },
})
