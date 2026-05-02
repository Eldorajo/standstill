import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

interface ReportResponse {
  ok: boolean
  report?: any
  error?: string
}

interface WorkflowSummary {
  name: string
  score: number
  primary_risk_driver: string
  spof_risk: boolean
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
        JSON.stringify({ ok: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Authorization header required' }),
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
        JSON.stringify({ ok: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's default tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('ss_tenants')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (tenantError || !tenant) {
      // Create default tenant if it doesn't exist
      const { data: newTenant, error: createError } = await supabase
        .from('ss_tenants')
        .insert({
          owner_user_id: user.id,
          name: 'Default Organization'
        })
        .select('id')
        .single()
      
      if (createError || !newTenant) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Failed to create tenant' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      tenant.id = newTenant.id
    }

    // Fetch all workflows for the user
    const { data: workflows, error: workflowsError } = await supabase
      .from('ss_workflows')
      .select('id, name, owner_name, spof_risk')
      .eq('user_id', user.id)

    if (workflowsError) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to fetch workflows' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No workflows captured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch latest scores for each workflow
    const { data: allScores, error: scoresError } = await supabase
      .from('ss_workflow_scores')
      .select('workflow_id, score, score_breakdown, scored_at')
      .in('workflow_id', workflows.map(w => w.id))
      .order('scored_at', { ascending: false })

    if (scoresError) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to fetch scores' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the latest score per workflow
    const latestScores = new Map()
    if (allScores) {
      for (const score of allScores) {
        if (!latestScores.has(score.workflow_id)) {
          latestScores.set(score.workflow_id, score)
        }
      }
    }

    // Build workflow summaries
    const workflowSummaries: WorkflowSummary[] = []
    for (const workflow of workflows) {
      const score = latestScores.get(workflow.id)
      if (score) {
        // Determine primary risk driver from score breakdown
        let primaryDriver = 'unknown'
        if (score.score_breakdown) {
          const breakdown = score.score_breakdown
          let maxContribution = 0
          let maxKey = 'unknown'
          
          for (const [key, value] of Object.entries(breakdown)) {
            if (typeof value === 'object' && value !== null && 'contribution' in (value as any)) {
              const contribution = (value as any).contribution || 0
              if (contribution > maxContribution) {
                maxContribution = contribution
                maxKey = key
              }
            } else if (key.endsWith('_score') && typeof value === 'number' && value > maxContribution) {
              maxContribution = value
              maxKey = key.replace('_score', '')
            }
          }
          
          primaryDriver = maxKey.replace('_', ' ')
        }

        workflowSummaries.push({
          name: workflow.name,
          score: score.score,
          primary_risk_driver: primaryDriver,
          spof_risk: workflow.spof_risk
        })
      }
    }

    if (workflowSummaries.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No scored workflows available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare structured input for Claude
    const spofWorkflows = workflowSummaries.filter(w => w.spof_risk).slice(0, 5)
    const topScored = [...workflowSummaries].sort((a, b) => b.score - a.score).slice(0, 5)
    
    const claudeInput = {
      total_workflows: workflowSummaries.length,
      top_spof_workflows: spofWorkflows.map(w => `${w.name} (score: ${w.score})`),
      top_scored_workflows: topScored.map(w => `${w.name} (score: ${w.score}, driver: ${w.primary_risk_driver})`),
      avg_score: Math.round((workflowSummaries.reduce((sum, w) => sum + w.score, 0) / workflowSummaries.length) * 10) / 10
    }

    const claudeInputSummary = JSON.stringify(claudeInput)

    // Call Anthropic Claude API
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are generating an audit report for shadow workflow risk analysis. Be precise, professional, and audit-grade in tone.

Input data:
- Total workflows analyzed: ${claudeInput.total_workflows}
- Average risk score: ${claudeInput.avg_score}/100
- Top SPOF workflows: ${claudeInput.top_spof_workflows.join(', ')}
- Highest scored workflows: ${claudeInput.top_scored_workflows.join(', ')}

Generate a Markdown report with these exact sections:

# Executive Summary
# Top Risk Areas
# Single Point of Failure Workflows  
# Recommended Next Steps
# Methodology

Constraints:
- Never name specific individuals - only refer to roles (e.g., "senior analyst", "finance lead")
- Frame issues as "knowledge concentration" not "personal risk"
- Be specific about which workflows are highest risk
- Recommend concrete next steps
- Keep total length under 1500 words
- Use professional audit language, not marketing copy`

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!claudeResponse.ok) {
      console.error('Claude API error:', await claudeResponse.text())
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to generate report with Claude' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claudeResult = await claudeResponse.json()
    const reportContent = claudeResult.content?.[0]?.text || 'Report generation failed'

    // Insert the audit report
    const { data: report, error: insertError } = await supabase
      .from('ss_audit_reports')
      .insert({
        content_md: reportContent,
        workflow_count: workflowSummaries.length,
        claude_input_summary: claudeInputSummary,
        claude_model: 'claude-3-5-sonnet-20241022',
        user_id: user.id,
        tenant_id: tenant.id
      })
      .select()
      .single()

    if (insertError || !report) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to save report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response: ReportResponse = {
      ok: true,
      report
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('ss-report function error:', error)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})