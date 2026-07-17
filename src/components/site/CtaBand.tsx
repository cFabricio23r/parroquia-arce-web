import { Button } from '@/components/ui/Button'

/**
 * Banda de CTA azul con patron de puntos — ds.css:24-28 (.cta-band).
 */
export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string
  text: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-12 text-center text-white"
      style={{ background: 'linear-gradient(160deg, var(--color-blue), var(--color-navy))' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[.18]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,.4) 1.2px, transparent 1.3px)',
          backgroundSize: '22px 22px',
        }}
      />
      <h2 className="relative font-display text-[clamp(28px,3.4vw,42px)] font-medium">{title}</h2>
      <p className="relative mx-auto mb-[26px] mt-[14px] max-w-[50ch] text-[17px] text-[#CFE2F5]">
        {text}
      </p>
      <div className="relative flex flex-wrap justify-center gap-[13px]">
        <Button href={primary.href} variant="amber" size="lg">
          {primary.label}
        </Button>
        {secondary && (
          <Button href={secondary.href} variant="outline-light" size="lg">
            {secondary.label}
          </Button>
        )}
      </div>
    </div>
  )
}
