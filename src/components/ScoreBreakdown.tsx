import { Progress } from './ui/progress';
import type { ScoreBreakdown } from '../lib/scoring';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdown;
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const items = [
    {
      label: 'Frequency',
      value: breakdown.frequency.value,
      contribution: breakdown.frequency.contribution,
      weight: breakdown.frequency.weight,
      max: 30
    },
    {
      label: 'Breadth',
      value: `${breakdown.breadth.value} teams`,
      contribution: breakdown.breadth.contribution,
      weight: breakdown.breadth.weight,
      max: 25
    },
    {
      label: 'Criticality',
      value: `${breakdown.criticality.value}/5`,
      contribution: breakdown.criticality.contribution,
      weight: breakdown.criticality.weight,
      max: 20
    },
    {
      label: 'SPOF Risk',
      value: breakdown.spof_risk.value ? 'Yes' : 'No',
      contribution: breakdown.spof_risk.contribution,
      weight: breakdown.spof_risk.weight,
      max: 25
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200">Score Breakdown</h3>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-slate-300">
                {item.value} → {item.contribution}pts ({item.weight})
              </span>
            </div>
            <Progress 
              value={(item.contribution / item.max) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-200">Total Score</span>
          <span className="text-2xl font-bold text-primary">
            {breakdown.total}
          </span>
        </div>
      </div>
    </div>
  );
}