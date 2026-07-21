import Nav from '../components/Nav'
import OfferForm from '../components/OfferForm'

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <Nav />

      <section className="bg-frogtown-900 text-white px-4 py-10">
        <h1 className="text-2xl font-bold">Offer your skills to the neighborhood</h1>
        <p className="text-frogtown-200 mt-2">
          Your submission will be reviewed by a community admin before it appears publicly.
        </p>
      </section>

      <OfferForm />
    </div>
  )
}
