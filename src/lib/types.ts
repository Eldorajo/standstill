export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export interface Workflow {
  id: string
  tenant_id: string
  name: string
  description: string
  owner_name: string
  frequency: Frequency
  people_count: number
  systems_count: number
  criticality: number
  spof_risk: boolean
  created_at: string
  updated_at: string
}

export interface WorkflowScore {
  id: string
  tenant_id: string
  workflow_id: string
  run_id: string
  score: number
  score_breakdown: ScoreBreakdown
  created_at: string
}

export interface ScoreBreakdown {
  frequency: { input: Frequency; weight: number; contribution: number }
  breadth: { input: number; weight: number; contribution: number }
  criticality: { input: number; weight: number; contribution: number }
  spof_risk: { input: boolean; weight: number; contribution: number }
}

export interface ScoreRun {
  id: string
  tenant_id: string
  ran_at: string
  workflow_count: number
}

export interface Report {
  id: string
  tenant_id: string
  generated_at: string
  content: string
  workflow_count: number
  avg_score: number
}