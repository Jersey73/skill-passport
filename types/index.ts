// ============================================================
// SKILL PASSPORT — Global Type Definitions
// ============================================================

export type Difficulty = 'easy' | 'medium' | 'hard'
export type AssessmentStatus = 'in_progress' | 'completed' | 'expired' | 'flagged'
export type ProgrammingLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go' | 'rust'

// ---- Database Row Types ----

export interface User {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  github_url: string | null
  portfolio_url: string | null
  primary_language: ProgrammingLanguage
  years_of_exp: number
  resume_url: string | null
  overall_score: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface TestCase {
  input: string
  expected_output: string
  is_hidden: boolean
}

export interface StarterCode {
  javascript?: string
  typescript?: string
  python?: string
  java?: string
  cpp?: string
  go?: string
  rust?: string
}

export interface Question {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  topic: string
  time_limit_ms: number
  test_cases: TestCase[]
  starter_code: StarterCode
  is_active: boolean
  created_at: string
}

export interface CheatEvent {
  type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'context_menu'
  timestamp: string
  count?: number
}

export interface Assessment {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  expires_at: string
  status: AssessmentStatus
  is_flagged_for_cheating: boolean
  cheat_events: CheatEvent[]
  tab_switch_count: number
  final_score: number | null
  question_ids: string[]
  created_at: string
}

export interface MetricDetail {
  score: number
  reasoning: string
}

export interface AIMetrics {
  metrics: {
    algorithm_efficiency: MetricDetail
    code_readability: MetricDetail
    problem_solving: MetricDetail
  }
  overall_score: number
  feedback: {
    strengths: string[]
    weaknesses: string[]
    improvement_suggestions: string[]
  }
  is_plagiarized_or_suspicious: boolean
}

export interface Submission {
  id: string
  assessment_id: string
  question_id: string
  user_id: string
  language: ProgrammingLanguage
  raw_code: string      // Base64 encoded
  ai_metrics: AIMetrics | null
  overall_score: number | null
  is_suspicious: boolean
  submitted_at: string
}

// ---- API Payload Types ----

export interface EvaluateRequest {
  assessment_id: string
  question_id: string
  encoded_code: string   // Base64
  language: ProgrammingLanguage
  question_title: string
  question_description: string
}

export interface EvaluateResponse {
  success: boolean
  submission_id: string
  ai_metrics: AIMetrics
  error?: string
}

// ---- UI / Form Types ----

export interface OnboardingFormData {
  full_name: string
  username: string
  github_url: string
  portfolio_url: string
  primary_language: ProgrammingLanguage
  years_of_exp: number
  resume: File | null
}

// ---- Dashboard / Profile Types ----

export interface SkillScore {
  subject: string
  score: number
  fullMark: number
}

export interface PassportProfile {
  user: User
  assessments: Assessment[]
  submissions: Submission[]
  skillScores: SkillScore[]
}
