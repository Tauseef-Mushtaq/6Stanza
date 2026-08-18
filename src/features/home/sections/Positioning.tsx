import { Container } from '@/components/ui/Container';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { AccentLine } from '@/components/ui/Divider';
import { Reveal, Parallax } from '@/components/motion';

/**
 * CHAPTER 02 — the bridge from hero to substance. Positions 6STANZA as
 * a technology partner, not a web agency, using typography scale and a
 * parallax-drifting numeral rather than a new visual system.
 */
export function Positioning() {
  return (
    <section
      className='relative flex min-h-svh w-full flex-col justify-center overflow-hidden'
      style={{ background: 'var(--stz-navy-950)', color: 'var(--stz-white)' }}
    >
      <Parallax
        speed={0.25}
        className='pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none font-[var(--font-display)]'
      >
        <span
          style={{
            fontSize: 'clamp(10rem, 28vw, 30rem)',
            color: 'rgba(143,176,255,0.06)',
          }}
        >
          02
        </span>
      </Parallax>

      <Container className='relative flex flex-col gap-8'>
        <Reveal direction='up'>
          <div className='flex items-center gap-3'>
            <AccentLine />
            <TechnicalLabel style={{ color: 'var(--color-brand-soft)' }}>
              Positioning
            </TechnicalLabel>
          </div>
        </Reveal>

        <Reveal direction='up' delay={0.1} staggerChildren>
          <p
            className='max-w-3xl font-[var(--font-display)] tracking-tight'
            style={{
              fontSize: 'clamp(1.75rem, 3.4vw, 3.25rem)',
              lineHeight: 'var(--leading-tight)',
            }}
          >
            6STANZA is not a web development shop.
          </p>
          <p
            className='mt-4 max-w-2xl font-[var(--font-display)] tracking-tight'
            style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              lineHeight: 'var(--leading-tight)',
              color: 'var(--color-muted-inverse)',
            }}
          >
            We&apos;re a trusted technology partner — built for the companies
            that treat their infrastructure as seriously as their product.
          </p>
        </Reveal>

        <Reveal direction='up' delay={0.2}>
          <p
            className='max-w-xl pt-2'
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-muted-inverse)',
            }}
          >
            Every engagement runs on the same discipline: strategy before code,
            systems before features, security before scale. It&apos;s the
            difference between a site that launches and a system that lasts.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
