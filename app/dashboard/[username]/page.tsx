import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'
import PassportCard from '@/components/dashboard/PassportCard'
import SkillRadarChart from '@/components/dashboard/SkillRadarChart'
import ScoreBreakdown from '@/components/dashboard/ScoreBreakdown'
import AssessmentHistory from '@/components/dashboard/AssessmentHistory'
import type { User, Assessment, Submission, SkillScore } from '@/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('full_name, username, overall_score')
    .eq('username', username)
    .single()

  if (!user) return { title: 'Skill Passport' }

  return {
    title: `${user.full_name ?? user.username}'s Skill Passport`,
    description: `${user.full_name ?? user.username} has a verified Skill Passport score of ${user.overall_score}/100.`,
  }
}

function computeSkillScores(submissions: Submission[]): SkillScore[] {
  const completed = submissions.filter(s => s.ai_metrics !== null)
  if (completed.length === 0) return []

  const totals = { algorithm: 0, readability: 0, problemSolving: 0 }

  for (const s of completed) {
    totals.algorithm     += s.ai_metrics!.metrics.algorithm_efficiency.score
    totals.readability   += s.ai_metrics!.metrics.code_readability.score
    totals.problemSolving += s.ai_metrics!.metrics.problem_solving.score
  }

  const n = completed.length
  return [
    { subject: 'Algorithm\nEfficiency', score: Math.round(totals.algorithm / n),     fullMark: 100 },
    { subject: 'Code\nReadability',     score: Math.round(totals.readability / n),    fullMark: 100 },
    { subject: 'Problem\nSolving',      score: Math.round(totals.problemSolving / n), fullMark: 100 },
  ]
}

export default async function DashboardPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Resolve "me" alias to the authenticated user's username
  let username = resolvedParams.username
  if (username === 'me') {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/?auth=required')

    const { data: profile } = await supabase
      .from('users')
      .select('username')
      .eq('id', authUser.id)
      .single()

    if (!profile) redirect('/onboarding')
    username = profile.username
  }

  // Fetch public profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (!user) notFound()
  if (!user.is_public) {
    // Private profile — only owner can view
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser?.id !== user.id) notFound()
  }

  // Determine if viewer is the owner
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const isOwner = authUser?.id === user.id

  // Fetch assessments
  const { data: assessments = [] } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10)

  // Fetch submissions with ai_metrics
  const { data: submissions = [] } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', user.id)
    .not('ai_metrics', 'is', null)

  const skillScores = computeSkillScores(submissions as Submission[])
  const hasData     = skillScores.length > 0

  return (
    <main className="min-h-screen bg-[var(--bg-void)] bg-grid">
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(ellipse, var(--accent-primary) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-20">

        {/* Passport Card (full width) */}
        <div className="animate-fade-up">
          <PassportCard
            user={user as User}
            isOwner={isOwner}
            assessmentCount={(assessments as Assessment[]).filter(a => a.status === 'completed').length}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-up delay-100">
          <SkillRadarChart skillScores={skillScores} hasData={hasData} />
          <ScoreBreakdown  skillScores={skillScores} hasData={hasData} />
        </div>

        {/* Assessment history */}
        <div className="mt-6 animate-fade-up delay-200">
          <AssessmentHistory
            assessments={assessments as Assessment[]}
            isOwner={isOwner}
          />
        </div>
      </div>
    </main>
  )
}
