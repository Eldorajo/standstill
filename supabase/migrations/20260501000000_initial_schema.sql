-- Standstill Initial Schema
-- This migration creates the core tables for shadow workflow tracking

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Tenants table (singleton per user)
CREATE TABLE ss_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_user_id)
);

-- Enable RLS on tenants
ALTER TABLE ss_tenants ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenants
CREATE POLICY "Users can view their own tenant" ON ss_tenants
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Users can insert their own tenant" ON ss_tenants
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their own tenant" ON ss_tenants
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their own tenant" ON ss_tenants
  FOR DELETE USING (owner_user_id = auth.uid());

-- Workflows table
CREATE TABLE ss_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  breadth INTEGER NOT NULL CHECK (breadth >= 1),
  criticality INTEGER NOT NULL CHECK (criticality >= 1 AND criticality <= 5),
  spof_risk BOOLEAN NOT NULL DEFAULT FALSE,
  spof_rationale TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES ss_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workflows
ALTER TABLE ss_workflows ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflows
CREATE POLICY "Users can view their own workflows" ON ss_workflows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own workflows" ON ss_workflows
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workflows" ON ss_workflows
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workflows" ON ss_workflows
  FOR DELETE USING (user_id = auth.uid());

-- Score runs table
CREATE TABLE ss_score_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ DEFAULT NOW(),
  ran_by TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES ss_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on score runs
ALTER TABLE ss_score_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies for score runs
CREATE POLICY "Users can view their own score runs" ON ss_score_runs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own score runs" ON ss_score_runs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own score runs" ON ss_score_runs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own score runs" ON ss_score_runs
  FOR DELETE USING (user_id = auth.uid());

-- Workflow scores table
CREATE TABLE ss_workflow_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES ss_workflows(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES ss_score_runs(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  score_breakdown JSONB NOT NULL,
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES ss_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workflow scores
ALTER TABLE ss_workflow_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow scores
CREATE POLICY "Users can view their own workflow scores" ON ss_workflow_scores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own workflow scores" ON ss_workflow_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workflow scores" ON ss_workflow_scores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workflow scores" ON ss_workflow_scores
  FOR DELETE USING (user_id = auth.uid());

-- Audit reports table
CREATE TABLE ss_audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_md TEXT NOT NULL,
  workflow_count INTEGER NOT NULL,
  claude_input_summary TEXT,
  claude_model TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES ss_tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit reports
ALTER TABLE ss_audit_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit reports
CREATE POLICY "Users can view their own audit reports" ON ss_audit_reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own audit reports" ON ss_audit_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own audit reports" ON ss_audit_reports
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own audit reports" ON ss_audit_reports
  FOR DELETE USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_workflows_user_id ON ss_workflows(user_id);
CREATE INDEX idx_workflows_tenant_id ON ss_workflows(tenant_id);
CREATE INDEX idx_score_runs_user_id ON ss_score_runs(user_id);
CREATE INDEX idx_workflow_scores_workflow_id ON ss_workflow_scores(workflow_id);
CREATE INDEX idx_workflow_scores_run_id ON ss_workflow_scores(run_id);
CREATE INDEX idx_audit_reports_user_id ON ss_audit_reports(user_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ss_tenants_updated_at BEFORE UPDATE ON ss_tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ss_workflows_updated_at BEFORE UPDATE ON ss_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();