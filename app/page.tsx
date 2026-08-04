import Link from 'next/link'
import Nav from './components/Nav'
import DirectoryClient from './components/DirectoryClient'
import AboutSection from './components/AboutSection'
import { createClient } from '@/lib/supabase/server'
import type { NewsPost, SiteSettings, SkillOfferer } from '@/lib/types'

export default async function HomePage() {
  const supabase = createClient()

  const [offerersResult, newsResult, settingsResult] = await Promise.all([
    supabase
      // public_skill_offerers is a view exposing only public-safe columns
      // (no email/phone) and only active rows - anon/authenticated no
      // longer have a SELECT grant on the base skill_offerers table.
      .from('public_skill_offerers')
      .select('id, display_name, quadrant, cross_streets, skill_categories, skills, bio, languages, active, created_at')
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

      <DirectoryClient
        offerers={offerers}
        newsPosts={newsPosts}
        heroHeading={heroHeading}
        heroSubheading={heroSubheading}
      />

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
