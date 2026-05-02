import { useEffect, useState } from 'react'
import { FileText, Clock, Users } from 'lucide-react'
import { Button, Card, Spinner } from '../components/ui'
import { supabase, FUNCTIONS_URL } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'
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
      const { data: reportsData, error: reportsError } = await supabase
        .from('ss_audit_reports')
        .select('*')
        .order('generated_at', { ascending: false })

      if (reportsError) throw reportsError

      setReports(reportsData || [])
      // Auto-select the most recent if any exist
      if (reportsData && reportsData.length > 0) {
        setSelectedReport(reportsData[0])
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
        throw new Error('No valid session')
      }

      const response = await fetch(`${FUNCTIONS_URL}/ss-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Failed to generate report')
      }

      // Refresh reports list and select the new report
      await loadReports()
      const newReport = data.report
      if (newReport) {
        setSelectedReport(newReport)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
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

  if (reports.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="kicker mb-2">reports · step 3</p>
            <h1 className="text-3xl font-semibold text-ink">Audit reports</h1>
            <p className="text-muted mt-1">No reports generated yet.</p>
          </div>
          
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">Generate your first report</h2>
            <p className="text-muted mb-6">Capture workflows and get scores, then generate a Claude-assisted audit report.</p>
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Spinner className="mr-2" />
                  Generating report...
                </>
              ) : (
                'Generate report'
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="kicker mb-2">reports · step 3</p>
            <h1 className="text-3xl font-semibold text-ink">Audit reports</h1>
            <p className="text-muted mt-1">{reports.length} report{reports.length !== 1 ? 's' : ''} generated</p>
          </div>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              'Generate report'
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* History sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold text-ink mb-4">Report history</h3>
              <div className="space-y-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedReport?.id === report.id
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'text-muted hover:text-ink hover:bg-elev/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-mono">
                        {formatDate(report.generated_at)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">
                        {report.workflow_count} workflow{report.workflow_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Report content */}
          <div className="lg:col-span-3">
            {selectedReport ? (
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-ink">Audit Report</h2>
                    <div className="flex items-center space-x-4 text-xs text-muted">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(selectedReport.generated_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{selectedReport.workflow_count} workflows</span>
                      </div>
                      {selectedReport.claude_model && (
                        <div className="flex items-center space-x-1">
                          <span className="font-mono">{selectedReport.claude_model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-invert prose-slate max-w-none">
                  <ReactMarkdown>{selectedReport.content_md}</ReactMarkdown>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted">Select a report from the history to view its contents.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports