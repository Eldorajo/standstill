import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

interface ReportResponse {
  ok: true
  report: {
    id: string
    content_md: string
    workflow_count: number
    claude_input_summary?: string
    claude_model?: string
    generated_at: string
  }
}

interface ErrorResponse {
  error: string
}

interface WorkflowWithScore {
  id: string
  name: string
  owner_name: string
  frequency: string
  breadth: number
  criticality: number
  spof_risk: boolean
  spof_rationale?: string
  latest_score?: {
    score: number
    score_breakdown: any
  }
}

interface ClaudeRequest {
  model: string
  max_tokens: number
  temperature: number
  messages: Array<{
    role: string
    content: string
  }>
}

interface ClaudeResponse {
  content: Array<{
    text: string
    type: string
  }>
}

function getPrimaryRiskDriver(scoreBreakdown: any): string {
  if (!scoreBreakdown) return 'unknown'
  
  let maxContribution = 0
  let primaryDriver = 'none'
  
  const components = {
    frequency_score: 'frequency',
    breadth_score: 'breadth',
    criticality_score: 'criticality',
    spof_score: 'spof risk'
  }
  
  for (const [key, label] of Object.entries(components)) {
    const contribution = scoreBreakdown[key] || 0
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryDriver = label
    }
  }
  
  return primaryDriver
}

function buildClaudePrompt(workflows: WorkflowWithScore[]): { prompt: string; inputSummary: string } {
  const totalWorkflows = workflows.length
  const spofWorkflows = workflows.filter(w => w.spof_risk)
  const scoredWorkflows = workflows.filter(w => w.latest_score)
  const topRiskWorkflows = scoredWorkflows
    .sort((a, b) => (b.latest_score?.score || 0) - (a.latest_score?.score || 0))
    .slice(0, 5)
  
  const workflowSummary = workflows.map(w => {
    const score = w.latest_score?.score?.toFixed(1) || 'unscored'
    const driver = w.latest_score ? getPrimaryRiskDriver(w.latest_score.score_breakdown) : 'none'
    const spofFlag = w.spof_risk ? ' [SPOF]' : ''
    return `- "${w.name}" (${w.owner_name}, ${w.frequency}, score: ${score}, primary risk: ${driver})${spofFlag}`
  }).join('\n')
  
  const topRiskSummary = topRiskWorkflows.map(w => {
    const score = w.latest_score?.score?.toFixed(1) || '0'
    const driver = getPrimaryRiskDriver(w.latest_score?.score_breakdown)
    return `- "${w.name}" (score: ${score}, driver: ${driver})`
  }).join('\n')
  
  const spofSummary = spofWorkflows.slice(0, 5).map(w => {
    const rationale = w.spof_rationale ? ` - ${w.spof_rationale}` : ''
    return `- "${w.name}" (${w.owner_name})${rationale}`
  }).join('\n')
  
  const inputSummary = `${totalWorkflows} workflows, ${spofWorkflows.length} SPOFs, ${scoredWorkflows.length} scored`
  
  const prompt = `You are generating an enterprise audit report on shadow workflow risk patterns. This is an internal audit document - be professional, direct, and actionable.

IMPORTANT CONSTRAINTS:
- Never name specific individuals - only refer to roles (e.g., "FP&A senior analyst" not "Sarah Johnson")
- Frame issues as "knowledge concentration" not "personal dependencies"
- Focus on systemic risks, not individual performance
- Use audit-grade tone - no marketing fluff or excessive praise

DATA ANALYZED:
Total workflows captured: ${totalWorkflows}
Workflows with SPOF risk: ${spofWorkflows.length}
Workflows scored: ${scoredWorkflows.length}

ALL WORKFLOWS:
${workflowSummary}

TOP 5 RISK WORKFLOWS BY SCORE:
${topRiskSummary}

SPOF WORKFLOWS:
${spofSummary}

Generate a markdown report with exactly these sections:

## Executive Summary
Brief overview of risk patterns discovered. 2-3 sentences.

## Top Risk Workflows  
Analyze the highest-scoring workflows. What patterns drive the scores? Are they frequency, breadth, criticality, or SPOF risk?

## Single Points of Failure
Details on workflows marked as SPOFs. What knowledge/access is concentrated? What happens if those roles are unavailable?

## Recommended Next Steps
3-5 specific, actionable recommendations prioritized by impact. Focus on documentation, cross-training, or process improvements.

## Methodology
Brief explanation of how workflows were scored (frequency 0-30pts, breadth 0-25pts, criticality 0-20pts, SPOF 0-25pts, total 0-100pts).

Keep the entire report under 800 words. Be specific about the workflow names and risk patterns you observed in the data.`

  return { prompt, inputSummary }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' } as ErrorResponse),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' } as ErrorResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' } as ErrorResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create tenant
    let { data: tenant, error: tenantError } = await supabase
      .from('ss_tenants')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (tenantError && tenantError.code === 'PGRST116') {
      // Tenant doesn't exist, create it
      const { data: newTenant, error: createError } = await supabase
        .from('ss_tenants')
        .insert({
          owner_user_id: user.id,
          name: 'Default Tenant'
        })
        .select('id')
        .single()

      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create tenant' } as ErrorResponse),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      tenant = newTenant
    } else if (tenantError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tenant' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all workflows for the user
    const { data: workflows, error: workflowsError } = await supabase
      .from('ss_workflows')
      .select('*')
      .eq('user_id', user.id)

    if (workflowsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflows' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No workflows captured. Add some workflows before generating a report.' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch latest scores for each workflow
    const { data: scores, error: scoresError } = await supabase
      .from('ss_workflow_scores')
      .select('*')
      .in('workflow_id', workflows.map(w => w.id))
      .order('scored_at', { ascending: false })

    if (scoresError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflow scores' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map latest scores to workflows
    const latestScores = new Map()
    if (scores) {
      for (const score of scores) {
        if (!latestScores.has(score.workflow_id)) {
          latestScores.set(score.workflow_id, {
            score: score.score,
            score_breakdown: score.score_breakdown
          })
        }
      }
    }

    const workflowsWithScores: WorkflowWithScore[] = workflows.map(workflow => ({
      ...workflow,
      latest_score: latestScores.get(workflow.id)
    }))

    // Build Claude prompt
    const { prompt, inputSummary } = buildClaudePrompt(workflowsWithScores)

    // Call Anthropic Claude API
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claudeModel = 'claude-3-5-sonnet-20241022'
    const claudeRequest: ClaudeRequest = {
      model: claudeModel,
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claudeData: ClaudeResponse = await claudeResponse.json()
    const reportContent = claudeData.content?.[0]?.text

    if (!reportContent) {
      return new Response(
        JSON.stringify({ error: 'AI service returned empty response' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert audit report
    const { data: report, error: reportError } = await supabase
      .from('ss_audit_reports')
      .insert({
        content_md: reportContent,
        workflow_count: workflows.length,
        claude_input_summary: inputSummary,
        claude_model: claudeModel,
        user_id: user.id,
        tenant_id: tenant.id
      })
      .select('*')
      .single()

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Failed to save report' } as ErrorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response: ReportResponse = {
      ok: true,
      report: {
        id: report.id,
        content_md: report.content_md,
        workflow_count: report.workflow_count,
        claude_input_summary: report.claude_input_summary,
        claude_model: report.claude_model,
        generated_at: report.generated_at
      }
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('ss-report function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' } as ErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})