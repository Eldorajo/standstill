import type { ScoreBreakdown as ScoreBreakdownData } from '../lib/scoring'

interface Props {
  breakdown: ScoreBreakdownData
}

function Bar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="h-2 w-full rounded-full bg-sunken overflow-hidden">
      <div className="h-full bg-accent transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}

export function ScoreBreakdown({ breakdown }: Props) {
  const items = [
    { label: 'Frequency', display: String(breakdown.frequency.value), contribution: breakdown.frequency.contribution, weight: breakdown.frequency.weight, max: 30 },
    { label: 'Breadth', display: `${breakdown.breadth.value} teams`, contribution: breakdown.breadth.contribution, weight: breakdown.breadth.weight, max: 25 },
    { label: 'Criticality', display: `${breakdown.criticality.value}/5`, contribution: breakdown.criticality.contribution, weight: breakdown.criticality.weight, max: 20 },
    { label: 'SPOF risk', display: breakdown.spof_risk.value ? 'Yes' : 'No', contribution: breakdown.spof_risk.contribution, weight: breakdown.spof_risk.weight, max: 25 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-ink">Score breakdown</h3>
        <span className="kicker">live preview</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted">{item.label}</span>
              <span className="text-ink">{item.display} • {item.contribution}pts <span className="text-dim">({item.weight})</span></span>
            </div>
            <Bar pct={(item.contribution / item.max) * 100} />
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="font-semibold text-ink">Total</span>
        <span className="text-3xl font-bold text-accent">{breakdown.total}</span>
      </div>
    </div>
  )
}

export default ScoreBreakdown
