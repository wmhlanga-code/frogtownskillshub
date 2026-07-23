import Link from 'next/link'
import Nav from './components/Nav'
import NewsStrip from './components/NewsStrip'
import DirectoryClient from './components/DirectoryClient'
import { createClient } from '@/lib/supabase/server'
import type { NewsPost, SkillOfferer } from '@/lib/types'

export default async function HomePage() {
  const supabase = createClient()

  const [offerersResult, newsResult] = await Promise.all([
    supabase
      .from('skill_offerers')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('news_posts')
      .select('*')
      .eq('published', true)
      .order('pinned', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const offerers = (offerersResult.data ?? []) as SkillOfferer[]
  const newsPosts = (newsResult.data ?? []) as NewsPost[]

  return (
    <div className="min-h-screen bg-off-white">
      <Nav />

      <section className="bg-frogtown-800 text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Find a neighbor with the skills you need.</h1>
          <p className="text-frogtown-200 mt-2">Trusted, local, Frogtown.</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto">
        <NewsStrip posts={newsPosts} />
        <DirectoryClient offerers={offerers} />
      </div>

      <Link
        href="/offer"
        className="md:hidden fixed bottom-4 right-4 bg-frogtown-800 text-white font-bold px-4 py-3 rounded-full shadow-lg"
      >
        Offer your skills
      </Link>
    </div>
  )
}
