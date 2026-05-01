export interface WorkflowData {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  breadth: number
  criticality: number
  spof_risk: boolean
}

export interface ScoreBreakdown {
  frequency_score: number
  breadth_score: number
  criticality_score: number
  spof_score: number
  total: number
}

export interface ScoredWorkflow extends WorkflowData {
  score: number
  breakdown: ScoreBreakdown
}

/**
 * Calculate workflow risk score using heuristic algorithm
 * Must match supabase/functions/ss-score/index.ts implementation exactly
 */
export function calculateWorkflowScore(workflow: WorkflowData): ScoredWorkflow {
  // Frequency scoring (max 30 points)
  const frequencyMap = {
    daily: 30,
    weekly: 21,
    monthly: 12,
    quarterly: 3
  }
  const frequency_score = frequencyMap[workflow.frequency] || 0

  // Breadth scoring - logarithmic scale (max 25 points)
  const breadth_score = Math.min(25, Math.log(Math.max(1, workflow.breadth) + 1) * 8)

  // Criticality scoring (max 20 points)
  const criticality_score = Math.min(20, workflow.criticality * 4)

  // SPOF risk scoring (0 or 25 points)
  const spof_score = workflow.spof_risk ? 25 : 0

  // Total score (0-100), rounded to 2 decimals
  const total = Math.round((frequency_score + breadth_score + criticality_score + spof_score) * 100) / 100

  const breakdown: ScoreBreakdown = {
    frequency_score: Math.round(frequency_score * 100) / 100,
    breadth_score: Math.round(breadth_score * 100) / 100,
    criticality_score: Math.round(criticality_score * 100) / 100,
    spof_score,
    total
  }

  return {
    ...workflow,
    score: total,
    breakdown
  }
}

/**
 * Get score category and color based on total score
 */
export function getScoreCategory(score: number): {
  category: 'low' | 'medium' | 'high' | 'critical'
  color: string
  label: string
} {
  if (score >= 75) {
    return { category: 'critical', color: 'text-red-600', label: 'Critical Risk' }
  } else if (score >= 50) {
    return { category: 'high', color: 'text-orange-600', label: 'High Risk' }
  } else if (score >= 25) {
    return { category: 'medium', color: 'text-yellow-600', label: 'Medium Risk' }
  } else {
    return { category: 'low', color: 'text-green-600', label: 'Low Risk' }
  }
}