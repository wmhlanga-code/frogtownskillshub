import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/admin'
import ReportResolveButton from '@/app/components/admin/ReportResolveButton'
import type { Message, MessageThread, Report } from '@/lib/types'

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function ReportedThreadPage({ params }: { params: { threadId: string } }) {
  const service = createServiceRoleClient()

  const [threadResult, messagesResult, reportsResult] = await Promise.all([
    service
      .from('message_threads')
      .select('*, skill_offerers(*)')
      .eq('id', params.threadId)
      .maybeSingle(),
    service
      .from('messages')
      .select('*')
      .eq('thread_id', params.threadId)
      .order('sent_at', { ascending: true }),
    service
      .from('reports')
      .select('*')
      .eq('thread_id', params.threadId)
      .order('created_at', { ascending: false }),
  ])

  if (!threadResult.data) {
    notFound()
  }

  const thread = threadResult.data as MessageThread & { skill_offerers?: MessageThread['skill_offerer'] }
  const messages = (messagesResult.data ?? []) as Message[]
  const reports = (reportsResult.data ?? []) as Report[]
  const offerer = thread.skill_offerers

  return (
    <div className="p-4 sm:p-7 max-w-2xl">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Reported conversation</h1>
      <p className="text-sm text-muted-green mb-6">
        {offerer?.display_name ?? 'Neighbor'}
        {offerer?.quadrant ? ` — ${offerer.quadrant}` : ''}
        {thread.seeker_name ? ` · with ${thread.seeker_name}` : ''}
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 transition-shadow hover:shadow-md"
          >
            <p className="text-xs text-muted-green">
              Reported by {report.reported_by_role} on {formatTimestamp(report.created_at)}
            </p>
            {report.reason && <p className="text-sm text-frogtown-900 mt-2">{report.reason}</p>}
            <div className="mt-3">
              {report.resolved ? (
                <span className="text-xs text-muted-green">Resolved</span>
              ) : (
                <ReportResolveButton reportId={report.id} />
              )}
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <p className="text-sm text-muted-green">No reports found for this thread.</p>
        )}
      </div>

      <div className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 sm:p-5">
        <h2 className="text-sm font-bold text-frogtown-900 mb-4">Transcript</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-green">No messages in this conversation.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => {
              const isOfferer = message.sender_role === 'offerer'
              return (
                <div key={message.id} className="flex gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm bg-gradient-to-br ${
                      isOfferer ? 'from-frogtown-600 to-frogtown-800' : 'from-frogtown-400 to-frogtown-600'
                    }`}
                  >
                    {isOfferer ? 'O' : 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-frogtown-700 uppercase tracking-wide">
                        {message.sender_role}
                      </span>
                      <span className="text-xs text-muted-green">{formatTimestamp(message.sent_at)}</span>
                    </div>
                    <p className="text-sm text-frogtown-900 mt-1 bg-frogtown-50 rounded-xl rounded-tl-sm px-3.5 py-2 inline-block max-w-full">
                      {message.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
