import { Button } from '@/components/ui/Button'

/** Bloque navy que invita a otros negocios a sumarse. Va siempre en /patrocinadores. */
export function SponsorInvite() {
  return (
    <section
      aria-labelledby="sponsor-invite"
      className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-navy p-8 text-white sm:p-10"
    >
      <div className="min-w-0 flex-[1_1_420px]">
        <h2
          id="sponsor-invite"
          className="font-display text-[clamp(26px,3vw,32px)] font-medium leading-tight"
        >
          ¿Tenés un negocio y querés colaborar?
        </h2>
        <p className="mt-[10px] text-[17px] leading-[1.55] text-[#B6C6DD]">
          Con un aporte mensual ayudás a sostener esta página, y tu negocio aparece aquí con enlace
          a tus redes. Escribinos y te contamos cómo.
        </p>
      </div>
      <Button href="/contacto" variant="amber" size="lg">
        Contactar a la parroquia
      </Button>
    </section>
  )
}
