export type Quadrant = 'R1'|'R2'|'R3'|'O1'|'O2'|'O3'|'Y1'|'Y2'|'Y3'|'G1'|'G2'|'G3'|'G4'
export type SkillCategory = 'Practical'|'Knowledge'|'Care'|'Emergency'|'Social'
export type NewsTag = 'Notice'|'Event'|'Update'|'Pinned'

export type SkillOfferer = {
  id: string
  display_name: string
  email?: string
  quadrant: Quadrant
  cross_streets?: string
  skill_categories: string[]
  skills?: string[]
  bio?: string
  languages: string[]
  active: boolean
  approved_at: string
  created_at: string
}

export type NewsPost = {
  id: string
  title: string
  body?: string
  tag: NewsTag
  pinned: boolean
  published: boolean
  created_at: string
}

export type Submission = {
  id: string
  full_name: string
  display_name: string
  email: string
  phone?: string
  quadrant: Quadrant
  cross_streets?: string
  skill_categories: string[]
  skills?: string[]
  bio?: string
  languages: string[]
  status: 'pending'|'approved'|'rejected'
  reviewer_notes?: string
  submitted_at: string
  reviewed_at?: string
}

export type Admin = {
  id: string
  name: string
  email: string
  role: 'admin'|'super_admin'
  active: boolean
  created_at: string
}

export type MessageThread = {
  id: string
  offerer_id: string
  seeker_id?: string
  seeker_name?: string
  created_at: string
  skill_offerer?: SkillOfferer
  last_message?: Message
  last_message_body?: string
  last_message_at?: string
  unread_count?: number
  my_role?: 'seeker' | 'offerer'
  other_party_name?: string
}

export type Message = {
  id: string
  thread_id: string
  sender_role: 'seeker' | 'offerer'
  body: string
  sent_at: string
  read_at?: string
}

export type User = {
  id: string
  name: string
  email: string
  created_at: string
}

export type Report = {
  id: string
  thread_id: string
  reason?: string
  resolved: boolean
  created_at: string
  message_threads?: MessageThread
}
