import { createServiceRoleClient } from '@/lib/admin'
import NewsManager from '@/app/components/admin/NewsManager'
import type { NewsPost } from '@/lib/types'

export default async function AdminNewsPage() {
  const service = createServiceRoleClient()

  const { data } = await service
    .from('news_posts')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as NewsPost[]

  return (
    <div className="p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-6">News and Updates</h1>
      <NewsManager posts={posts} />
    </div>
  )
}
