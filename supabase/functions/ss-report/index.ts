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

    // Fetch all workflows for the user
    const { data: workflows, error: workflowError } = await supabase
      .from('ss_workflows')
      .select('id, name, spof_risk')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (workflowError) {
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
      if (!score) continue // Skip workflows without scores

      // Determine primary risk driver from score breakdown
      let primaryDriver = 'none'
      const breakdown = score.score_breakdown
      if (breakdown) {
        let maxContribution = 0
        for (const [key, value] of Object.entries(breakdown)) {
          if (typeof value === 'object' && value !== null && 'contribution' in value) {
            const contribution = (value as any).contribution || (value as any)[key.replace('_score', '')] || 0
            if (contribution > maxContribution) {
              maxContribution = contribution
              primaryDriver = key.replace('_score', '').replace('_', ' ')
            }
          } else if (key.endsWith('_score') && typeof value === 'number' && value > maxContribution) {
            maxContribution = value
            primaryDriver = key.replace('_score', '').replace('_', ' ')
          }
        }
      }

      workflowSummaries.push({
        name: workflow.name,
        score: score.score,
        primary_risk_driver: primaryDriver,
        spof_risk: workflow.spof_risk
      })
    }

    if (workflowSummaries.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No scored workflows found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sort workflows by score descending
    workflowSummaries.sort((a, b) => b.score - a.score)

    // Prepare structured input for Claude
    const top5ByScore = workflowSummaries.slice(0, 5)
    const spofWorkflows = workflowSummaries.filter(w => w.spof_risk).slice(0, 5)
    const avgScore = workflowSummaries.reduce((sum, w) => sum + w.score, 0) / workflowSummaries.length
    
    const claudeInput = {
      workflow_count: workflowSummaries.length,
      average_score: Math.round(avgScore * 100) / 100,
      top_5_by_score: top5ByScore,
      spof_workflows: spofWorkflows,
      risk_drivers: {
        frequency: workflowSummaries.filter(w => w.primary_risk_driver === 'frequency').length,
        breadth: workflowSummaries.filter(w => w.primary_risk_driver === 'breadth').length,
        criticality: workflowSummaries.filter(w => w.primary_risk_driver === 'criticality').length,
        spof: workflowSummaries.filter(w => w.primary_risk_driver === 'spof risk').length,
      }
    }

    // Call Anthropic Claude API
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are generating an enterprise shadow workflow audit report. Based on the following scored findings, create a comprehensive Markdown report.

**STRICT REQUIREMENTS:**
- Use audit-grade professional tone, no marketing fluff
- Frame risks as "knowledge concentration" not "personal risk"
- NEVER name specific individuals - only refer to roles/functions
- Focus on organizational resilience, not blame
- Structure: Executive Summary, Top Risks, SPOF Workflows, Recommended Next Steps, Methodology

**FINDINGS DATA:**
- Total workflows analyzed: ${claudeInput.workflow_count}
- Average risk score: ${claudeInput.average_score}/100
- Top 5 highest-risk workflows: ${JSON.stringify(claudeInput.top_5_by_score, null, 2)}
- Single Point of Failure workflows: ${JSON.stringify(claudeInput.spof_workflows, null, 2)}
- Primary risk driver distribution: ${JSON.stringify(claudeInput.risk_drivers, null, 2)}

**SCORING METHODOLOGY (include in report):**
- Frequency: Daily (30pts), Weekly (21pts), Monthly (12pts), Quarterly (3pts)
- Breadth: Logarithmic scale, max 25pts based on team count
- Criticality: User-rated 1-5 scale, 4pts per level (max 20pts)
- SPOF Risk: Boolean, 25pts if true
- Total possible: 100pts

Generate the complete audit report in Markdown format.`

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', errorText)
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to generate report with Claude' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claudeResult = await claudeResponse.json()
    const reportContent = claudeResult.content[0].text

    // Insert audit report into database
    const { data: report, error: insertError } = await supabase
      .from('ss_audit_reports')
      .insert({
        content_md: reportContent,
        workflow_count: workflowSummaries.length,
        claude_input_summary: JSON.stringify(claudeInput),
        claude_model: 'claude-3-5-sonnet-20241022',
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
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