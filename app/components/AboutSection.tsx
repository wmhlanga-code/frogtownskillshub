import NeighborhoodMap from './NeighborhoodMap'
import { QUADRANT_GRID, QUADRANT_COMPASS } from '@/lib/quadrants'
import type { AboutTeamMember } from '@/lib/types'

const PRINCIPLES = [
  {
    title: 'Submit your skills',
    body: 'Neighbors offer what they can help with — a trade, a piece of knowledge, a helping hand.',
    icon: (
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: 'Browse and connect',
    body: 'Anyone in the neighborhood can search the directory and reach out directly.',
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="m19.5 19.5-3.7-3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Built on proximity',
    body: 'Listings are organized by quadrant, so it is easy to find help nearby.',
    icon: (
      <>
        <path
          d="M12 21s-6.5-5.6-6.5-10.5A6.5 6.5 0 0 1 18.5 10.5C18.5 15.4 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
  {
    title: 'Built on trust',
    body: 'Every submission is reviewed by a community admin before it goes public.',
    icon: (
      <path
        d="M12 3.5 5 6v5.5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-2.5Z M9 12l2 2 4-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ),
  },
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function AboutSection({
  team,
  contactEmail,
  offererCount,
}: {
  team: AboutTeamMember[]
  contactEmail?: string
  offererCount: number
}) {
  return (
    <section id="about" className="scroll-mt-16">
      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 pt-14 pb-10">
          <p className="text-xs font-extrabold uppercase tracking-widest text-frogtown-600 mb-2">
            About the project
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-frogtown-900">
            A directory built by the neighborhood, for the neighborhood
          </h2>

          {offererCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-frogtown-50 border border-frogtown-200 text-frogtown-700 text-xs font-semibold rounded-full px-3 py-1.5 mt-4">
              <span className="h-1.5 w-1.5 rounded-full bg-frogtown-600" />
              {offererCount} {offererCount === 1 ? 'neighbor' : 'neighbors'} already sharing skills
            </div>
          )}

          <p className="text-sm text-muted-green mt-5 leading-relaxed">
            Frogtown Skills Hub is a non-commercial, volunteer-run directory built by and for the
            Frogtown neighborhood. It exists to help neighbors find each other for the everyday
            skills, tools, and knowledge that make a community self-sufficient.
          </p>
          <p className="text-sm text-muted-green mt-3 leading-relaxed">
            There is no payment processing and no marketplace — just a trusted list of neighbors
            willing to help, reviewed by community admins before appearing publicly.
          </p>
        </div>
      </div>

      <div className="bg-frogtown-50 border-y border-frogtown-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h3 className="text-lg font-bold text-frogtown-900 mb-5">How it works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-4 flex gap-3"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-frogtown-800 text-frogtown-200 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    {p.icon}
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-frogtown-900">{p.title}</h4>
                  <p className="text-xs text-muted-green mt-1 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h3 className="text-lg font-bold text-frogtown-900 mb-3">The neighborhood map</h3>
          <p className="text-sm text-muted-green mb-4 leading-relaxed">
            Frogtown is divided into thirteen quadrants, grouped by color and numbered by position.
            Listings show their quadrant instead of an exact address, so neighbors can find help
            nearby without anyone sharing their precise location. The green outline marks the
            neighborhood boundary; the yellow lines mark the divisions between quadrants.
          </p>
          <div className="rounded-xl overflow-hidden border border-frogtown-200 shadow-sm">
            <NeighborhoodMap />
          </div>

          <p className="text-xs font-semibold text-frogtown-700 uppercase tracking-widest mt-6 mb-2">
            Quick reference
          </p>
          <div className="grid grid-cols-4 gap-2 max-w-xs">
            {QUADRANT_GRID.flat().map((code, i) => {
              if (!code) return <div key={`empty-${i}`} />
              return (
                <div
                  key={code}
                  className="rounded-lg p-3 text-center bg-frogtown-50 border border-frogtown-200 text-frogtown-800"
                >
                  <div className="font-bold">{code}</div>
                  <div className="text-xs">{QUADRANT_COMPASS[code]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {team.length > 0 && (
        <div className="bg-frogtown-50 border-y border-frogtown-100">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <h3 className="text-lg font-bold text-frogtown-900 mb-5">Who runs this</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 flex items-center gap-3"
                >
                  <div className="flex-shrink-0 h-11 w-11 rounded-full bg-frogtown-800 text-white font-bold text-sm flex items-center justify-center">
                    {initials(member.name) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-frogtown-900 truncate">{member.name}</p>
                    <p className="text-xs text-muted-green mt-0.5 truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-frogtown-900">
        <div className="max-w-2xl mx-auto px-4 py-14">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Get in touch</h3>
          <p className="text-sm text-frogtown-200 mt-2 max-w-md leading-relaxed">
            Questions about a listing, a safety concern, or want to become a community admin?
            Reach out to the team.
          </p>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block bg-white text-frogtown-900 font-bold text-sm px-5 py-2.5 rounded-lg mt-5 hover:bg-frogtown-100 transition-colors"
            >
              Contact the admin team
            </a>
          ) : (
            <p className="text-xs text-frogtown-300 mt-5">
              Contact details for the admin team have not been set up yet.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
