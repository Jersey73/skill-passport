import { z } from 'zod'

export const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust'
] as const

// ---- Onboarding Form Schema ----
export const onboardingSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long'),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens and underscores'),

  github_url: z
    .string()
    .url('Must be a valid URL')
    .refine(url => url.includes('github.com'), 'Must be a GitHub URL')
    .optional()
    .or(z.literal('')),

  portfolio_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),

  primary_language: z.enum(PROGRAMMING_LANGUAGES, {
    errorMap: () => ({ message: 'Please select a programming language' }),
  }),

  years_of_exp: z
    .number()
    .min(0, 'Cannot be negative')
    .max(50, 'Please enter a realistic value')
    .int('Must be a whole number'),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

// ---- Evaluate API Payload Schema ----
export const evaluatePayloadSchema = z.object({
  assessment_id:       z.string().uuid(),
  question_id:         z.string().uuid(),
  encoded_code:        z.string().min(1, 'Code cannot be empty'),  // Base64
  language:            z.enum(PROGRAMMING_LANGUAGES),
  question_title:      z.string().min(1),
  question_description: z.string().min(1),
})

// ---- AI Response Schema (strict validation before DB write) ----
export const aiMetricsSchema = z.object({
  metrics: z.object({
    algorithm_efficiency: z.object({
      score:     z.number().int().min(0).max(100),
      reasoning: z.string(),
    }),
    code_readability: z.object({
      score:     z.number().int().min(0).max(100),
      reasoning: z.string(),
    }),
    problem_solving: z.object({
      score:     z.number().int().min(0).max(100),
      reasoning: z.string(),
    }),
  }),
  overall_score: z.number().int().min(0).max(100),
  feedback: z.object({
    strengths:                z.array(z.string()),
    weaknesses:               z.array(z.string()),
    improvement_suggestions:  z.array(z.string()),
  }),
  is_plagiarized_or_suspicious: z.boolean(),
})

export type AIMetricsSchema = z.infer<typeof aiMetricsSchema>
