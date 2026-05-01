import type { Frequency } from './types';

export interface ScoreInput {
  frequency: Frequency;
  breadth: number;
  criticality: number;
  spof_risk: boolean;
}

export interface ScoreBreakdown {
  frequency: { value: string; contribution: number; weight: string };
  breadth: { value: number; contribution: number; weight: string };
  criticality: { value: number; contribution: number; weight: string };
  spof_risk: { value: boolean; contribution: number; weight: string };
  total: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

export function scoreWorkflowClient(input: ScoreInput): ScoreResult {
  const freqMap: Record<Frequency, number> = {
    daily: 30,
    weekly: 21,
    monthly: 12,
    quarterly: 3
  };

  const freqContrib = freqMap[input.frequency];
  const breadthContrib = Math.min(25, Math.log(Math.max(1, input.breadth) + 1) * 8);
  const critContrib = input.criticality * 4;
  const spofContrib = input.spof_risk ? 25 : 0;

  const score = Math.round((freqContrib + breadthContrib + critContrib + spofContrib) * 100) / 100;

  const breakdown: ScoreBreakdown = {
    frequency: {
      value: input.frequency,
      contribution: freqContrib,
      weight: '0-30pts'
    },
    breadth: {
      value: input.breadth,
      contribution: Math.round(breadthContrib * 100) / 100,
      weight: '0-25pts'
    },
    criticality: {
      value: input.criticality,
      contribution: critContrib,
      weight: '0-20pts'
    },
    spof_risk: {
      value: input.spof_risk,
      contribution: spofContrib,
      weight: '0-25pts'
    },
    total: score
  };

  return { score, breakdown };
}