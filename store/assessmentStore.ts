import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Question, Assessment, Submission, ProgrammingLanguage } from '@/types'

export type SubmissionStatus = 'idle' | 'submitting' | 'evaluating' | 'done' | 'error'

interface QuestionState {
  code:     string
  language: ProgrammingLanguage
  status:   SubmissionStatus
  result:   Submission | null
}

interface AssessmentStore {
  // ── Assessment metadata ──
  assessment:  Assessment | null
  questions:   Question[]
  currentIndex: number

  // ── Anti-cheat state ──
  tabSwitchCount:  number
  isFailed:        boolean
  warningMessage:  string | null

  // ── Per-question code + results ──
  questionStates: Record<string, QuestionState>

  // ── Console output ──
  consoleOutput: string[]

  // ── Timer ──
  secondsRemaining: number
  timerExpired:     boolean

  // ── Actions ──
  setAssessment:   (assessment: Assessment)  => void
  setQuestions:    (questions: Question[])   => void
  setCurrentIndex: (index: number)           => void
  setCode:         (questionId: string, code: string) => void
  setLanguage:     (questionId: string, lang: ProgrammingLanguage) => void
  setSubmissionStatus: (questionId: string, status: SubmissionStatus) => void
  setSubmissionResult: (questionId: string, result: Submission)      => void
  recordTabSwitch: () => void
  dismissWarning:  () => void
  failAssessment:  () => void
  appendConsole:   (line: string) => void
  clearConsole:    () => void
  setSeconds:      (seconds: number) => void
  expireTimer:     () => void
  reset:           () => void
}

const INITIAL_QUESTION_STATE: QuestionState = {
  code:     '',
  language: 'javascript',
  status:   'idle',
  result:   null,
}

export const useAssessmentStore = create<AssessmentStore>()(
  devtools(
    (set, get) => ({
      assessment:       null,
      questions:        [],
      currentIndex:     0,
      tabSwitchCount:   0,
      isFailed:         false,
      warningMessage:   null,
      questionStates:   {},
      consoleOutput:    [],
      secondsRemaining: 60 * 60,  // 60 minutes
      timerExpired:     false,

      setAssessment: (assessment) => set({ assessment }),

      setQuestions: (questions) => {
        const questionStates: Record<string, QuestionState> = {}
        questions.forEach(q => {
          questionStates[q.id] = {
            ...INITIAL_QUESTION_STATE,
            code: q.starter_code?.javascript ?? '',
          }
        })
        set({ questions, questionStates })
      },

      setCurrentIndex: (currentIndex) => set({ currentIndex }),

      setCode: (questionId, code) =>
        set(state => ({
          questionStates: {
            ...state.questionStates,
            [questionId]: {
              ...(state.questionStates[questionId] ?? INITIAL_QUESTION_STATE),
              code,
            },
          },
        })),

      setLanguage: (questionId, language) =>
        set(state => ({
          questionStates: {
            ...state.questionStates,
            [questionId]: {
              ...(state.questionStates[questionId] ?? INITIAL_QUESTION_STATE),
              language,
            },
          },
        })),

      setSubmissionStatus: (questionId, status) =>
        set(state => ({
          questionStates: {
            ...state.questionStates,
            [questionId]: {
              ...(state.questionStates[questionId] ?? INITIAL_QUESTION_STATE),
              status,
            },
          },
        })),

      setSubmissionResult: (questionId, result) =>
        set(state => ({
          questionStates: {
            ...state.questionStates,
            [questionId]: {
              ...(state.questionStates[questionId] ?? INITIAL_QUESTION_STATE),
              result,
              status: 'done',
            },
          },
        })),

      recordTabSwitch: () => {
        const count = get().tabSwitchCount + 1
        set({ tabSwitchCount: count })

        if (count === 1) {
          set({ warningMessage: '⚠️ Warning: Tab switching detected. A second violation will auto-fail your assessment.' })
        } else if (count >= 2) {
          set({
            isFailed:       true,
            warningMessage: null,
          })
        }
      },

      dismissWarning: () => set({ warningMessage: null }),

      failAssessment: () => set({ isFailed: true }),

      appendConsole: (line) =>
        set(state => ({
          consoleOutput: [...state.consoleOutput.slice(-199), line],
        })),

      clearConsole: () => set({ consoleOutput: [] }),

      setSeconds: (secondsRemaining) => set({ secondsRemaining }),

      expireTimer: () => set({ timerExpired: true }),

      reset: () =>
        set({
          assessment:       null,
          questions:        [],
          currentIndex:     0,
          tabSwitchCount:   0,
          isFailed:         false,
          warningMessage:   null,
          questionStates:   {},
          consoleOutput:    [],
          secondsRemaining: 60 * 60,
          timerExpired:     false,
        }),
    }),
    { name: 'assessment-store' }
  )
)
