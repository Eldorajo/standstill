import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button, Card, Badge, Spinner } from '../components/ui'
import { supabase } from '../lib/supabase'
import type { Workflow, WorkflowScore } from '../lib/types'

interface WorkflowWithScore extends Workflow {
  latest_score?: WorkflowScore
  primary_driver?: string
}

function Findings() {
  const [workflows, setWorkflows] = useState<WorkflowWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFindings()
  }, [])

  async function loadFindings() {
    try {
      // Fetch all workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('ss_workflows')
        .select('*')
        .order('created_at', { ascending: false })

      if (workflowsError) throw workflowsError

      if (!workflowsData || workflowsData.length === 0) {
        setWorkflows([])
        setLoading(false)
        return
      }

      // Fetch all workflow scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('ss_workflow_scores')
        .select('*')
        .order('scored_at', { ascending: false })

      if (scoresError) throw scoresError

      // Reduce to keep only the most recent score per workflow_id
      const latestScores = new Map<string, WorkflowScore>()
      if (scoresData) {
        for (const score of scoresData) {
          if (!latestScores.has(score.workflow_id)) {
            latestScores.set(score.workflow_id, score)
          }
        }
      }

      // Attach scores to workflows and compute primary driver
      const workflowsWithScores: WorkflowWithScore[] = workflowsData.map(workflow => {
        const latestScore = latestScores.get(workflow.id)
        let primaryDriver = 'none'
        
        if (latestScore?.score_breakdown) {
          const breakdown = latestScore.score_breakdown as any
          let maxContribution = 0
          let maxKey = 'none'
          
          for (const [key, value] of Object.entries(breakdown)) {
            if (typeof value === 'object' && value !== null && 'contribution' in value) {
              const contribution = (value as any).contribution
              if (contribution > maxContribution) {
                maxContribution = contribution
                maxKey = key
              }
            }
          }
          
          primaryDriver = maxKey.replace('_', ' ')
        }
        
        return {
          ...workflow,
          latest_score: latestScore,
          primary_driver: primaryDriver
        }
      })

      // Sort by score desc (workflows without scores go to bottom)
      workflowsWithScores.sort((a, b) => {
        const scoreA = a.latest_score?.score ?? 0
        const scoreB = b.latest_score?.score ?? 0
        return scoreB - scoreA
      })

      setWorkflows(workflowsWithScores)
    } catch (e: any) {
      setError(e?.message || 'Failed to load findings')
    } finally {
      setLoading(false)
    }
  }

  function getScoreBadgeVariant(score?: number) {
    if (!score) return 'default'
    if (score >= 70) return 'high'
    if (score >= 40) return 'med'
    return 'low'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (workflows.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="kicker mb-2">findings · step 2</p>
            <h1 className="text-3xl font-semibold text-ink">Workflow risk ledger</h1>
            <p className="text-muted mt-1">No workflows captured yet.</p>
          </div>
          
          <Card className="text-center py-12">
            <h2 className="text-xl font-semibold text-ink mb-2">Get started</h2>
            <p className="text-muted mb-6">Capture your first shadow workflow to see risk scores here.</p>
            <Link to="/capture">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Capture workflow
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="kicker mb-2">findings · step 2</p>
            <h1 className="text-3xl font-semibold text-ink">Workflow risk ledger</h1>
            <p className="text-muted mt-1">{workflows.length} workflows tracked</p>
          </div>
          <Link to="/capture">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Capture workflow
            </Button>
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted">Workflow</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Details</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="border-b border-border hover:bg-elev/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {workflow.spof_risk && (
                          <AlertTriangle className="h-4 w-4 text-risk-high" />
                        )}
                        <Link to={`/findings/${workflow.id}`} className="text-ink hover:text-accent transition-colors">
                          {workflow.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {workflow.owner_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-ink">
                        {workflow.primary_driver}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getScoreBadgeVariant(workflow.latest_score?.score)}>
                        {workflow.latest_score?.score?.toFixed(1) ?? '—'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/findings/${workflow.id}`} className="text-accent hover:text-accent/80 text-sm">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Findings