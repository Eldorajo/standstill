import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Card } from '../components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { scoreWorkflowClient } from '../lib/scoring';
import { supabase } from '../lib/supabase';
import type { Frequency } from '../lib/types';

export function Capture() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    owner_role: '',
    frequency: 'monthly' as Frequency,
    breadth: 1,
    criticality: 3,
    spof_risk: false,
    spof_rationale: '',
    notes: ''
  });

  const scoreResult = scoreWorkflowClient({
    frequency: formData.frequency,
    breadth: formData.breadth,
    criticality: formData.criticality,
    spof_risk: formData.spof_risk
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.owner_role.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert workflow
      const { data: workflow, error: insertError } = await supabase
        .from('ss_workflows')
        .insert({
          name: formData.name.trim(),
          owner_role: formData.owner_role.trim(),
          frequency: formData.frequency,
          breadth: formData.breadth,
          criticality: formData.criticality,
          spof_risk: formData.spof_risk,
          spof_rationale: formData.spof_risk ? formData.spof_rationale : null,
          notes: formData.notes.trim() || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call ss-score edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        await fetch(`${process.env.VITE_SUPABASE_FUNCTIONS_URL}/ss-score`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ workflow_id: workflow.id })
        });
      }

      navigate('/findings');
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.owner_role.trim();

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Capture Workflow
          </h1>
          <p className="text-slate-400">
            Document a workflow to understand its risk and criticality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Workflow name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Q4 close reconciliation tracker"
                  className="bg-slate-800 border-slate-600 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_role" className="text-slate-200">
                  Primary owner role *
                </Label>
                <Input
                  id="owner_role"
                  value={formData.owner_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_role: e.target.value }))}
                  placeholder="FP&A senior analyst"
                  className="bg-slate-800 border-slate-600 text-slate-100"
                  required
                />
                <p className="text-xs text-slate-500">
                  Refer to role, not the individual
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: Frequency) => 
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breadth" className="text-slate-200">
                  Breadth
                </Label>
                <Input
                  id="breadth"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.breadth}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    breadth: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                  }))}
                  className="bg-slate-800 border-slate-600 text-slate-100"
                />
                <p className="text-xs text-slate-500">
                  How many teams depend on it
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-200">Criticality</Label>
                <div className="px-2">
                  <Slider
                    value={[formData.criticality]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, criticality: value }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 - Nice to have</span>
                    <span className="text-slate-300">{formData.criticality}/5</span>
                    <span>5 - Revenue critical</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="spof_risk"
                    checked={formData.spof_risk}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, spof_risk: !!checked }))
                    }
                  />
                  <Label htmlFor="spof_risk" className="text-slate-200">
                    Single point of failure risk
                  </Label>
                </div>
                
                {formData.spof_risk && (
                  <Textarea
                    value={formData.spof_rationale}
                    onChange={(e) => setFormData(prev => ({ ...prev, spof_rationale: e.target.value }))}
                    placeholder="Explain the single point of failure..."
                    className="bg-slate-800 border-slate-600 text-slate-100"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-200">
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional context or details..."
                  className="bg-slate-800 border-slate-600 text-slate-100"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/findings')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Capture Workflow'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Score Preview Column */}
          <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700">
            <ScoreBreakdown breakdown={scoreResult.breakdown} />
          </Card>
        </div>
      </div>
    </div>
  );
}