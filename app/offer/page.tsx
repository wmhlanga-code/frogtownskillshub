import Nav from '../components/Nav'
import OfferForm from '../components/OfferForm'

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <Nav />

      <section className="bg-gradient-to-br from-frogtown-900 via-frogtown-800 to-frogtown-700 text-white px-4 py-10 sm:py-14">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Offer your skills to the neighborhood</h1>
          <p className="text-frogtown-200 mt-2 text-sm sm:text-base">
            Your submission will be reviewed by a community admin before it appears publicly.
          </p>
        </div>
      </section>

      <OfferForm />
    </div>
  )
}
