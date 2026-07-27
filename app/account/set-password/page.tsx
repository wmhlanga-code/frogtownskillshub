import SetPasswordForm from '@/app/components/SetPasswordForm'

export default function SetPasswordPage({
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
      <SetPasswordForm next={searchParams.next ?? '/'} />
    </div>
  )
}
