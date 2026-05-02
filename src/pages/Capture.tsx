import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button, Input, Textarea, Select, Label, Card, Spinner } from '../components/ui'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { scoreWorkflowClient } from '../lib/scoring'
import { supabase, FUNCTIONS_URL } from '../lib/supabase'
import type { Frequency } from '../lib/types'

function Capture() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    owner_name: '',
    frequency: 'monthly' as Frequency,
    breadth: 1,
    criticality: 3,
    spof_risk: false,
    spof_rationale: '',
    notes: '',
  })

  const { score, breakdown } = scoreWorkflowClient({
    frequency: form.frequency,
    breadth: form.breadth,
    criticality: form.criticality,
    spof_risk: form.spof_risk,
  })

  const isValid = form.name.trim().length > 0 && form.owner_name.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError(null)
    try {
      const { data: workflow, error: insertErr } = await supabase
        .from('ss_workflows')
        .insert({
          name: form.name.trim(),
          owner_name: form.owner_name.trim(),
          frequency: form.frequency,
          breadth: form.breadth,
          criticality: form.criticality,
          spof_risk: form.spof_risk,
          spof_rationale: form.spof_risk ? form.spof_rationale.trim() || null : null,
          notes: form.notes.trim() || null,
        })
        .select()
        .single()
      if (insertErr) throw insertErr

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await fetch(`${FUNCTIONS_URL}/ss-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ workflow_id: workflow.id }),
        })
      }
      navigate('/findings')
    } catch (e: any) {
      setError(e?.message || 'Failed to save workflow')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="kicker mb-2">capture · step 1</p>
          <h1 className="text-3xl font-semibold text-ink">Document a workflow</h1>
          <p className="text-muted mt-1">Capture once. Score lives on the right.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="name">Workflow name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Q4 close reconciliation tracker"
                  required
                />
              </div>

              <div>
                <Label htmlFor="owner_name" hint="Refer to role, not the individual.">
                  Primary owner role
                </Label>
                <Input
                  id="owner_name"
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  placeholder="FP&A senior analyst"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    id="frequency"
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breadth" hint="How many teams depend on it.">
                    Breadth
                  </Label>
                  <Input
                    id="breadth"
                    type="number"
                    min={1}
                    max={50}
                    value={form.breadth}
                    onChange={(e) => setForm({ ...form, breadth: Math.max(1, Math.min(50, parseInt(e.target.value) || 1)) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="criticality" hint="1 = nice to have · 5 = revenue-critical">
                  Criticality: {form.criticality}
                </Label>
                <input
                  id="criticality"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={form.criticality}
                  onChange={(e) => setForm({ ...form, criticality: parseInt(e.target.value) })}
                  className="w-full accent-accent"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.spof_risk}
                    onChange={(e) => setForm({ ...form, spof_risk: e.target.checked })}
                    className="h-4 w-4 rounded border-border bg-elev accent-accent"
                  />
                  <span className="text-ink">Single point of failure risk</span>
                </label>
                {form.spof_risk && (
                  <Textarea
                    value={form.spof_rationale}
                    onChange={(e) => setForm({ ...form, spof_rationale: e.target.value })}
                    placeholder="Why is this a SPOF? What knowledge or access is concentrated?"
                    rows={3}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Anything else useful for the audit."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={!isValid || submitting}>
                  {submitting ? <><Spinner className="mr-2" /> Saving</> : 'Capture workflow'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/findings')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <ScoreBreakdown breakdown={breakdown} />
            <p className="kicker mt-6">computed score: {score}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Capture
