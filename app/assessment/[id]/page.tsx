import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewAssessmentEngine from '@/components/assessment/NewAssessmentEngine'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AssessmentPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/?auth=required')

  // Get user profile to determine language preference
  const { data: profile } = await supabase
    .from('users')
    .select('primary_language')
    .eq('id', authUser.id)
    .single()

  // Default to python if not set
  const userLanguage = (profile?.primary_language === 'java') ? 'java' : 'python'

  return (
    <NewAssessmentEngine
      assessmentId={id}
      language={userLanguage as 'java' | 'python'}
    />
  )
}
