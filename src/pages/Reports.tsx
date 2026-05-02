import { useEffect, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button, Card, Spinner } from '../components/ui'
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
      
      // Auto-select the most recent report if any exist
      if (data && data.length > 0 && !selectedReport) {
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
        throw new Error('Not authenticated')
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
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report')
      }
      
      // Refetch reports and select the new one
      await loadReports()
      
      // The new report should be first in the list
      if (result.report) {
        setSelectedReport(result.report)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <p className="kicker mb-2">reports · step 3</p>
            <h1 className="text-3xl font-semibold text-ink">Audit reports</h1>
            <p className="text-muted mt-1">Generate Claude-assisted analysis of your workflow risks.</p>
          </div>
          
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">No reports yet</h2>
            <p className="text-muted mb-6">
              Generate your first audit report from captured workflow findings.
            </p>
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Generating
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="kicker mb-2">reports · step 3</p>
            <h1 className="text-3xl font-semibold text-ink">Audit reports</h1>
            <p className="text-muted mt-1">{reports.length} reports generated</p>
          </div>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Generating
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Generate report
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* History sidebar */}
          <div className="col-span-1">
            <Card className="h-full">
              <h3 className="text-lg font-semibold text-ink mb-4">Report history</h3>
              <div className="space-y-2 overflow-y-auto">
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
                    <div className="text-sm font-medium mb-1">
                      {formatDate(report.generated_at)}
                    </div>
                    <div className="text-xs opacity-75">
                      {report.workflow_count} workflows
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Report content */}
          <div className="col-span-3">
            <Card className="h-full overflow-hidden">
              {selectedReport ? (
                <div className="h-full overflow-y-auto">
                  <div className="prose prose-invert prose-slate max-w-none">
                    <ReactMarkdown>{selectedReport.content_md}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a report from the sidebar</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports