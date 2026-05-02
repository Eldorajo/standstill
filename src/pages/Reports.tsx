import { useEffect, useState } from 'react'
import { FileText, BarChart3, AlertTriangle, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button, Card, Spinner, Badge } from '../components/ui'
import { supabase, FUNCTIONS_URL } from '../lib/supabase'
import type { AuditReport } from '../lib/types'

function Reports() {
  const [reports, setReports] = useState<AuditReport[]>([])
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      const { data, error: fetchError } = await supabase
        .from('ss_audit_reports')
        .select('*')
        .order('generated_at', { ascending: false })

      if (fetchError) throw fetchError

      setReports(data || [])
      // Auto-select most recent if any exist
      if (data && data.length > 0) {
        setSelectedReport(data[0])
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  async function generateReport() {
    setGenerating(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${FUNCTIONS_URL}/ss-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      })

      const result = await response.json()
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to generate report')
      }

      // Refetch reports and select the new one
      await loadReports()
      if (result.report) {
        setSelectedReport(result.report)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error && reports.length === 0) {
    return (
      <div className="p-8">
        <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="kicker mb-2">reports • step 3</p>
            <h1 className="text-3xl font-semibold text-ink">Audit reports</h1>
            <p className="text-muted mt-1">AI-assisted analysis of your workflow findings.</p>
          </div>
          
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">No reports yet</h2>
            <p className="text-muted mb-6">
              Generate your first audit report from captured workflow findings. 
              Claude will analyze your risk patterns and provide actionable recommendations.
            </p>
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate report
                </>
              )}
            </Button>
            {error && (
              <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg mt-4">
                {error}
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar - report history */}
      <div className="w-80 border-r border-border bg-elev p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="kicker mb-1">reports • step 3</p>
              <h2 className="text-lg font-semibold text-ink">Report history</h2>
            </div>
            <Button
              size="sm"
              onClick={generateReport}
              disabled={generating}
              className="ml-2"
            >
              {generating ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <BarChart3 className="h-3 w-3" />
              )}
            </Button>
          </div>
          {error && (
            <div className="text-xs text-risk-high bg-risk-high/10 border border-risk-high/20 px-2 py-1 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {reports.map((report) => {
            const isSelected = selectedReport?.id === report.id
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-accent/20 border-accent/30 text-accent'
                    : 'bg-surface border-border text-ink hover:bg-surface/80'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {formatDate(report.generated_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    {report.workflow_count} workflows
                  </span>
                  {report.claude_model && (
                    <Badge variant="default" className="text-xs">
                      AI
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main panel - selected report */}
      <div className="flex-1 overflow-y-auto">
        {selectedReport ? (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-semibold text-ink">Audit Report</h1>
                  {selectedReport.claude_model && (
                    <Badge variant="accent" className="flex items-center space-x-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>AI-Generated</span>
                    </Badge>
                  )}
                </div>
                <p className="text-muted">
                  Generated {formatDate(selectedReport.generated_at)} • {selectedReport.workflow_count} workflows analyzed
                </p>
                {selectedReport.claude_input_summary && (
                  <p className="text-dim text-sm mt-1">
                    Input: {selectedReport.claude_input_summary}
                  </p>
                )}
              </div>

              <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown>{selectedReport.content_md}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-muted">Select a report from the sidebar to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports