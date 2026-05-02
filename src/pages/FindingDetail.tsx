import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Card, Badge, Spinner } from '../components/ui'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { supabase } from '../lib/supabase'
import type { Workflow, WorkflowScore } from '../lib/types'

interface FindingData {
  workflow: Workflow
  latestScore?: WorkflowScore
}

function FindingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<FindingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      navigate('/findings')
      return
    }
    loadFindingDetail(id)
  }, [id, navigate])

  async function loadFindingDetail(workflowId: string) {
    try {
      // Fetch the workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('ss_workflows')
        .select('*')
        .eq('id', workflowId)
        .single()

      if (workflowError) {
        if (workflowError.code === 'PGRST116') {
          throw new Error('Workflow not found')
        }
        throw workflowError
      }

      // Fetch the latest score for this workflow
      const { data: latestScore, error: scoreError } = await supabase
        .from('ss_workflow_scores')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('scored_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (scoreError) throw scoreError

      setData({
        workflow,
        latestScore: latestScore || undefined
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to load finding details')
    } finally {
      setLoading(false)
    }
  }

  function getRecommendedAction(workflow: Workflow) {
    if (workflow.spof_risk) {
      return 'Identify a backup operator and document the workflow.'
    }
    if (workflow.criticality >= 4) {
      return 'Document the workflow and confirm the owner has cover.'
    }
    return 'Monitor; consider documenting if criticality grows.'
  }

  function getScoreBadgeVariant(score?: number) {
    if (!score) return 'default'
    if (score >= 70) return 'high'
    if (score >= 40) return 'med'
    return 'low'
  }

  // Convert server score breakdown to client format for ScoreBreakdown component
  function convertScoreBreakdown(serverBreakdown: any) {
    if (!serverBreakdown) {
      return {
        frequency: { value: 'unknown', contribution: 0, weight: '0-30pts' },
        breadth: { value: 0, contribution: 0, weight: '0-25pts' },
        criticality: { value: 0, contribution: 0, weight: '0-20pts' },
        spof_risk: { value: false, contribution: 0, weight: '0-25pts' },
        total: 0
      }
    }

    return {
      frequency: {
        value: data?.workflow?.frequency || 'unknown',
        contribution: serverBreakdown.frequency_score || 0,
        weight: '0-30pts'
      },
      breadth: {
        value: data?.workflow?.breadth || 0,
        contribution: serverBreakdown.breadth_score || 0,
        weight: '0-25pts'
      },
      criticality: {
        value: data?.workflow?.criticality || 0,
        contribution: serverBreakdown.criticality_score || 0,
        weight: '0-20pts'
      },
      spof_risk: {
        value: data?.workflow?.spof_risk || false,
        contribution: serverBreakdown.spof_score || 0,
        weight: '0-25pts'
      },
      total: serverBreakdown.total || 0
    }
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
        <Link to="/findings" className="inline-flex items-center text-muted hover:text-ink transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to findings
        </Link>
        <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { workflow, latestScore } = data
  const scoreBreakdown = convertScoreBreakdown(latestScore?.score_breakdown)

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/findings" className="inline-flex items-center text-muted hover:text-ink transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to findings
        </Link>

        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-semibold text-ink">{workflow.name}</h1>
            {workflow.spof_risk && (
              <Badge variant="high" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>SPOF</span>
              </Badge>
            )}
          </div>
          <p className="text-muted">Owned by {workflow.owner_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <p className="kicker mb-2">CURRENT SCORE</p>
            <div className="text-4xl font-bold text-accent mb-2">
              {latestScore?.score?.toFixed(1) ?? '—'}
            </div>
            <Badge variant={getScoreBadgeVariant(latestScore?.score)}>
              {latestScore?.score ? (
                latestScore.score >= 70 ? 'High risk' :
                latestScore.score >= 40 ? 'Medium risk' : 'Low risk'
              ) : 'Not scored'}
            </Badge>
          </Card>

          <Card className="text-center">
            <p className="kicker mb-2">FREQUENCY</p>
            <div className="text-4xl font-bold text-ink mb-2">
              {workflow.frequency.charAt(0).toUpperCase() + workflow.frequency.slice(1)}
            </div>
            <p className="text-muted text-sm">How often it runs</p>
          </Card>

          <Card className="text-center">
            <p className="kicker mb-2">CRITICALITY</p>
            <div className="text-4xl font-bold text-ink mb-2">
              {workflow.criticality}/5
            </div>
            <p className="text-muted text-sm">Business impact level</p>
          </Card>
        </div>

        {latestScore && (
          <Card className="mb-6">
            <ScoreBreakdown breakdown={scoreBreakdown} />
          </Card>
        )}

        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-ink mb-4">Recommended action</h3>
          <p className="text-ink">{getRecommendedAction(workflow)}</p>
        </Card>

        {workflow.spof_risk && workflow.spof_rationale && (
          <Card className="mb-6">
            <p className="kicker mb-3">— SPOF RATIONALE</p>
            <p className="text-ink">{workflow.spof_rationale}</p>
          </Card>
        )}

        {workflow.notes && (
          <Card>
            <p className="kicker mb-3">— NOTES</p>
            <p className="text-ink whitespace-pre-wrap">{workflow.notes}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FindingDetail