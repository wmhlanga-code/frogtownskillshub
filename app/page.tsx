import Link from 'next/link'
import Nav from './components/Nav'
import DirectoryClient from './components/DirectoryClient'
import HeroBanner from './components/HeroBanner'
import AboutSection from './components/AboutSection'
import { createClient } from '@/lib/supabase/server'
import type { NewsPost, SiteSettings, SkillOfferer } from '@/lib/types'

export default async function HomePage() {
  const supabase = createClient()

  const [offerersResult, newsResult, settingsResult] = await Promise.all([
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
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  const offerers = (offerersResult.data ?? []) as SkillOfferer[]
  const newsPosts = (newsResult.data ?? []) as NewsPost[]
  const settings = settingsResult.data as SiteSettings | null
  const heroHeading = settings?.hero_heading || 'Find a neighbor with the skills you need.'
  const heroSubheading = settings?.hero_subheading || 'Trusted, local, Frogtown.'
  const aboutTeam = settings?.about_team ?? []
  const contactEmail = settings?.contact_email

  return (
    <div className="min-h-screen bg-off-white">
      <Nav />

      <HeroBanner>
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-2xl sm:text-4xl font-bold drop-shadow-sm">{heroHeading}</h1>
          <p className="text-frogtown-200 mt-3 text-base sm:text-lg">{heroSubheading}</p>
        </div>
      </HeroBanner>

      <DirectoryClient offerers={offerers} newsPosts={newsPosts} />

      <AboutSection team={aboutTeam} contactEmail={contactEmail} offererCount={offerers.length} />

      <Link
        href="/offer"
        className="md:hidden fixed bottom-4 right-4 bg-frogtown-800 text-white font-bold px-4 py-3 rounded-full shadow-lg"
      >
        Offer your skills
      </Link>
    </div>
  )
}
