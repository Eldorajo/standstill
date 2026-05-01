import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

interface ScoreRequest {
  workflow_id?: string
  score_all?: boolean
}

interface ScoreResponse {
  scored: number
  run_id: string
  results: Array<{ workflow_id: string; score: number }>
}

interface Workflow {
  id: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  breadth: number
  criticality: number
  spof_risk: boolean
}

interface ScoreBreakdown {
  frequency_score: number
  breadth_score: number
  criticality_score: number
  spof_score: number
  total: number
}

// Heuristic scoring function - must match lib/scoring.ts exactly
function calculateWorkflowScore(workflow: Workflow): { score: number; breakdown: ScoreBreakdown } {
  // Frequency scoring
  const frequencyMap = {
    daily: 30,
    weekly: 21,
    monthly: 12,
    quarterly: 3
  }
  const frequency_score = frequencyMap[workflow.frequency] || 0

  // Breadth scoring - logarithmic scale
  const breadth_score = Math.min(25, Math.log(Math.max(1, workflow.breadth) + 1) * 8)

  // Criticality scoring
  const criticality_score = Math.min(20, workflow.criticality * 4)

  // SPOF risk scoring
  const spof_score = workflow.spof_risk ? 25 : 0

  // Total score (0-100)
  const total = Math.round((frequency_score + breadth_score + criticality_score + spof_score) * 100) / 100

  const breakdown: ScoreBreakdown = {
    frequency_score: Math.round(frequency_score * 100) / 100,
    breadth_score: Math.round(breadth_score * 100) / 100,
    criticality_score: Math.round(criticality_score * 100) / 100,
    spof_score,
    total
  }

  return { score: total, breakdown }
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
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    let requestBody: ScoreRequest
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate request body
    if (!requestBody.workflow_id && !requestBody.score_all) {
      return new Response(
        JSON.stringify({ error: 'Either workflow_id or score_all must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
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
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch workflows based on request
    let workflowQuery = supabase
      .from('ss_workflows')
      .select('id, frequency, breadth, criticality, spof_risk')
      .eq('user_id', user.id)

    if (requestBody.workflow_id) {
      workflowQuery = workflowQuery.eq('id', requestBody.workflow_id)
    }

    const { data: workflows, error: workflowError } = await workflowQuery
    if (workflowError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflows' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({ scored: 0, run_id: null, results: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create score run record
    const { data: scoreRun, error: runError } = await supabase
      .from('ss_score_runs')
      .insert({
        user_id: user.id,
        ran_by: 'manual',
        workflows_scored: workflows.length
      })
      .select('id')
      .single()

    if (runError || !scoreRun) {
      return new Response(
        JSON.stringify({ error: 'Failed to create score run' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate scores for each workflow
    const results: Array<{ workflow_id: string; score: number }> = []
    const scoreInserts: Array<any> = []

    for (const workflow of workflows) {
      const { score, breakdown } = calculateWorkflowScore(workflow as Workflow)
      
      results.push({
        workflow_id: workflow.id,
        score
      })

      scoreInserts.push({
        workflow_id: workflow.id,
        run_id: scoreRun.id,
        score,
        score_breakdown: breakdown
      })
    }

    // Insert workflow scores
    const { error: scoresError } = await supabase
      .from('ss_workflow_scores')
      .insert(scoreInserts)

    if (scoresError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save scores' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response: ScoreResponse = {
      scored: workflows.length,
      run_id: scoreRun.id,
      results
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('ss-score function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})