'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import GlassCard from '@/components/shared/GlassCard'
import type { SkillScore } from '@/types'

interface SkillRadarChartProps {
  skillScores: SkillScore[]
  hasData:     boolean
}

const PLACEHOLDER_SCORES: SkillScore[] = [
  { subject: 'Algorithm\nEfficiency', score: 0, fullMark: 100 },
  { subject: 'Code\nReadability',     score: 0, fullMark: 100 },
  { subject: 'Problem\nSolving',      score: 0, fullMark: 100 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="glass px-3 py-2 rounded-xl text-xs"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <p className="text-white/50">{payload[0]?.payload?.subject?.replace('\n', ' ')}</p>
      <p className="text-[var(--accent-primary)] font-bold text-base mt-0.5">
        {payload[0]?.value}<span className="text-white/30 font-normal">/100</span>
      </p>
    </div>
  )
}

export default function SkillRadarChart({ skillScores, hasData }: SkillRadarChartProps) {
  const data = hasData ? skillScores : PLACEHOLDER_SCORES

  return (
    <GlassCard className="p-7 h-full">
      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-base font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Skill Breakdown
        </h3>
        <p className="text-xs text-white/35 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
          {hasData ? 'Average across all assessments' : 'Complete an assessment to see your scores'}
        </p>
      </div>

      {/* Chart */}
      <div className={`relative ${!hasData ? 'opacity-30 select-none pointer-events-none' : ''}`}>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="0"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload }) => {
                const lines = (payload.value as string).split('\n')
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.45)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                  >
                    {lines.map((line: string, i: number) => (
                      <tspan key={i} x={x} dy={i === 0 ? -6 : 13}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                )
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="score"
              dataKey="score"
              stroke="var(--accent-primary)"
              fill="var(--accent-primary)"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{
                r:           4,
                fill:        'var(--accent-primary)',
                strokeWidth: 0,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score legend */}
      {hasData && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {skillScores.map(skill => (
            <div key={skill.subject} className="text-center">
              <div
                className="text-xl font-bold text-[var(--accent-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {skill.score}
              </div>
              <div
                className="text-[9px] text-white/30 uppercase tracking-wide leading-tight mt-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {skill.subject.replace('\n', ' ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
