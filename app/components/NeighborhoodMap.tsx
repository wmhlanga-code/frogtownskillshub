import Image from 'next/image'

export default function NeighborhoodMap({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-frogtown-200 overflow-hidden ${className}`}>
      <Image
        src="/images/frogtown-map.jpg"
        alt="Aerial map of Frogtown with the neighborhood boundary in green and quadrant dividing lines in yellow, labeled R1-R3, O1-O3, Y1-Y3, and G1-G4"
        width={3128}
        height={1798}
        className="w-full h-auto"
        sizes="(min-width: 768px) 672px, 100vw"
      />
    </div>
  )
}
