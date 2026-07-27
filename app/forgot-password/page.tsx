import ForgotPasswordForm from '@/app/components/ForgotPasswordForm'

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-frogtown-900 h-13 flex items-center px-5">
        <span className="text-white font-bold">
          Frogtown <span className="text-frogtown-400">Skills</span>
        </span>
      </div>
      <ForgotPasswordForm next={searchParams.next ?? '/'} />
    </div>
  )
}
