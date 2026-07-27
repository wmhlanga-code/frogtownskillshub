import Image from 'next/image'

// The gap reserved at the bottom (HERO_GAP_CLASS) must match the negative
// margin the overlapping search card pulls up by (see DirectoryClient), so
// the card always lands fully on the photo no matter how much hero text
// an admin enters above it — the reserved gap is a fixed block, independent
// of the content block's height.
export default function HeroBanner({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/frogtown-hero.webp"
        alt="A Frogtown community garden with a mural of the neighborhood painted on the building behind it"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-frogtown-900/95 via-frogtown-900/75 to-frogtown-700/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-frogtown-900/40 via-transparent to-frogtown-900/40" />

      <div className="relative z-10 flex items-center min-h-[180px] sm:min-h-[260px] px-4 py-10 sm:py-14">
        <div className="w-full">{children}</div>
      </div>

      <div className="relative z-10 h-60 sm:h-56" aria-hidden="true" />
    </section>
  )
}
