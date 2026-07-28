import Image from 'next/image'

// The photo, heading, and the overlapping search card are all one section
// here by design — they used to be split across two components coordinated
// by matching negative-margin/reserved-gap pixel values, which drifted out
// of sync easily. Keeping them together means the card is always laid out
// in normal flow on top of the photo, with no magic numbers to maintain.
export default function HeroBanner({
  children,
  overlap,
}: {
  children: React.ReactNode
  overlap?: React.ReactNode
}) {
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

      {overlap && <div className="relative z-10 px-4 pb-8 sm:pb-10">{overlap}</div>}
    </section>
  )
}
