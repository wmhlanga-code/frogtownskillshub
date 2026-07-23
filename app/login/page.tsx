import Nav from '../components/Nav'
import LoginForm from '../components/LoginForm'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  return (
    <div className="min-h-screen bg-off-white">
      <Nav />
      <LoginForm redirectTo={searchParams.redirect ?? '/'} />
    </div>
  )
}
