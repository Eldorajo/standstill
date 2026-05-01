export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface Tenant {
  id: string;
  owner_user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  owner_name: string;
  frequency: Frequency;
  breadth: number;
  criticality: number;
  spof_risk: boolean;
  spof_rationale?: string;
  notes?: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreComponent {
  input: number | boolean | string;
  weight: number;
  contribution: number;
}

export interface ScoreBreakdown {
  frequency: ScoreComponent;
  breadth: ScoreComponent;
  criticality: ScoreComponent;
  spof_risk: ScoreComponent;
}

export interface ScoreRun {
  id: string;
  ran_at: string;
  ran_by: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
}

export interface WorkflowScore {
  id: string;
  workflow_id: string;
  run_id: string;
  score: number;
  score_breakdown: ScoreBreakdown;
  scored_at: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
}

export interface AuditReport {
  id: string;
  content_md: string;
  workflow_count: number;
  claude_input_summary?: string;
  claude_model?: string;
  generated_at: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
}

// Database table names for reference
export const TABLE_NAMES = {
  TENANTS: 'ss_tenants',
  WORKFLOWS: 'ss_workflows',
  SCORE_RUNS: 'ss_score_runs',
  WORKFLOW_SCORES: 'ss_workflow_scores',
  AUDIT_REPORTS: 'ss_audit_reports',
} as const;

// Frequency options for UI components
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
] as const;

// Criticality scale for UI components
export const CRITICALITY_LEVELS = [
  { value: 1, label: 'Low', description: 'Minor impact if disrupted' },
  { value: 2, label: 'Low-Medium', description: 'Some impact but workarounds exist' },
  { value: 3, label: 'Medium', description: 'Significant impact on operations' },
  { value: 4, label: 'High', description: 'Major disruption to business' },
  { value: 5, label: 'Critical', description: 'Business-stopping if disrupted' },
] as const;