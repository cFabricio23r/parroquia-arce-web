'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const fieldCls =
  'w-full rounded-[12px] border-[1.5px] border-border bg-bg-soft px-4 py-[14px] outline-none transition-[border-color,background] duration-150 focus:border-sky focus:bg-white'
const labelCls = 'mb-[7px] block text-[13.5px] font-bold'

/**
 * Formulario de contacto. Portado de web/content/contacto.html.
 * TODO: el envio real (Resend o deep-link de WhatsApp, ver PLAN_TECNICO_2026)
 * es pendiente. Por ahora replica el demo: confirma visualmente sin enviar.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-white p-9">
      <h2 className="mb-2 font-display text-[32px] font-medium">Escríbenos</h2>
      <p className="mb-6 text-[15.5px] text-muted">
        Completa el formulario y el equipo parroquial te responderá lo antes posible.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
      >
        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <div className="mb-[18px]">
            <label htmlFor="c-nombre" className={labelCls}>
              Nombre
            </label>
            <input id="c-nombre" type="text" placeholder="Tu nombre" required className={fieldCls} />
          </div>
          <div className="mb-[18px]">
            <label htmlFor="c-tel" className={labelCls}>
              Teléfono / WhatsApp
            </label>
            <input id="c-tel" type="tel" placeholder="0000-0000" className={fieldCls} />
          </div>
        </div>
        <div className="mb-[18px]">
          <label htmlFor="c-motivo" className={labelCls}>
            Motivo
          </label>
          <select id="c-motivo" className={fieldCls}>
            <option>Consulta general</option>
            <option>Sacramentos</option>
            <option>Sumarme a un grupo</option>
            <option>Intención de oración</option>
            <option>Radio parroquial</option>
          </select>
        </div>
        <div className="mb-[18px]">
          <label htmlFor="c-msg" className={labelCls}>
            Mensaje
          </label>
          <textarea
            id="c-msg"
            placeholder="¿Cómo podemos ayudarte?"
            className={`${fieldCls} min-h-[120px] resize-y`}
          />
        </div>
        <Button type="submit" block size="lg">
          {sent ? '¡Mensaje enviado!' : 'Enviar mensaje'}
        </Button>
        <p className="mt-[6px] text-[12.5px] text-muted">
          Tu información se usa únicamente para responder tu consulta. Las intenciones de oración se
          tratan con discreción.
        </p>
      </form>
    </div>
  )
}
