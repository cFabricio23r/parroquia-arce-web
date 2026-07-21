import { test, expect } from '@playwright/test'

// OJO: no se afirma el <title> de la home. Vale "Inicio" a secas — el
// `title.template` del layout solo aplica a segmentos HIJOS, y `page.tsx` vive
// en el mismo segmento que su `layout.tsx`. Es una debilidad de SEO real pero
// preexistente; atarla a un test la congelaria.

test.describe('Frontend', () => {
  test('la home carga con su encabezado', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('h1').first()).toBeVisible()
    // `header` no tiene reglas responsive; la nav de escritorio es `hidden
    // lg:flex` y atarla a toBeVisible() dejaria el test a merced del viewport.
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('/horarios redirige a la home', async ({ page }) => {
    await page.goto('http://localhost:3000/horarios')
    await expect(page).toHaveURL('http://localhost:3000/')
  })
})
