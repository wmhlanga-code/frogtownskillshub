import Nav from '../components/Nav'
import NeighborhoodMap from '../components/NeighborhoodMap'
import { QUADRANT_GRID, QUADRANT_COMPASS } from '@/lib/quadrants'

const PRINCIPLES = [
  {
    title: 'Submit your skills',
    body: 'Neighbors offer what they can help with — a trade, a piece of knowledge, a helping hand.',
  },
  {
    title: 'Browse and connect',
    body: 'Anyone in the neighborhood can search the directory and reach out directly.',
  },
  {
    title: 'Built on proximity',
    body: 'Listings are organized by quadrant, so it is easy to find help nearby.',
  },
  {
    title: 'Built on trust',
    body: 'Every submission is reviewed by a community admin before it goes public.',
  },
]

const ADMINS = [
  {
    name: 'Frogtown Neighborhood Association',
    role: 'Platform sponsor',
  },
  {
    name: 'Community Lead Admin',
    role: 'Volunteer admin',
  },
  {
    name: 'Community Lead Admin',
    role: 'Volunteer admin',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <Nav />

      <section className="bg-frogtown-900 text-white px-4 py-10">
        <h1 className="text-2xl font-bold">About Frogtown Skills</h1>
        <p className="text-frogtown-200 mt-2">
          A neighborhood-built directory connecting Frogtown residents with each other through
          skills, tools, and trust.
        </p>
      </section>

      <main className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-10">
        <section>
          <h2 className="text-lg font-bold text-frogtown-800 mb-3">What this is</h2>
          <p className="text-sm text-muted-green mb-3">
            Frogtown Skills Hub is a non-commercial, volunteer-run directory built by and for the
            Frogtown neighborhood. It exists to help neighbors find each other for the everyday
            skills, tools, and knowledge that make a community self-sufficient.
          </p>
          <p className="text-sm text-muted-green">
            There is no payment processing and no marketplace — just a trusted list of neighbors
            willing to help, reviewed by community admins before appearing publicly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-frogtown-800 mb-3">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="bg-white border border-frogtown-200 rounded-lg p-4 border-l-4 border-l-frogtown-800"
              >
                <h3 className="text-sm font-bold text-frogtown-800">{p.title}</h3>
                <p className="text-xs text-muted-green mt-1">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-frogtown-800 mb-3">The neighborhood map</h2>
          <p className="text-sm text-muted-green mb-3">
            Frogtown is divided into thirteen quadrants, grouped by color and numbered by position.
            Listings show their quadrant instead of an exact address, so neighbors can find help
            nearby without anyone sharing their precise location. The green outline marks the
            neighborhood boundary; the yellow lines mark the divisions between quadrants.
          </p>
          <NeighborhoodMap />

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
        </section>

        <section>
          <h2 className="text-lg font-bold text-frogtown-800 mb-3">Who runs this</h2>
          <div className="flex flex-col gap-3">
            {ADMINS.map((admin, i) => (
              <div key={i} className="bg-white border border-frogtown-200 rounded-lg p-4">
                <p className="text-sm font-bold text-frogtown-800">{admin.name}</p>
                <p className="text-xs text-muted-green mt-1">{admin.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-frogtown-800 text-white rounded-xl p-5">
          <h3 className="text-lg font-bold">Get in touch</h3>
          <p className="text-sm text-frogtown-200 mt-2">
            Questions about a listing, a safety concern, or want to become a community admin?
            Reach out to the team.
          </p>
          <button className="bg-white text-frogtown-800 font-bold text-sm px-4 py-2 rounded mt-4">
            Contact the admin team
          </button>
        </section>
      </main>
    </div>
  )
}
