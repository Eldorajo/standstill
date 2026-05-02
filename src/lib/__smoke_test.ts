// Smoke test to verify core functionality works
import { createClient } from '@supabase/supabase-js'
import { calculateWorkflowScore } from './scoring'
import type { Workflow } from './types'

// Test data
const mockWorkflow: Workflow = {
  id: 'test-1',
  name: 'Critical Expense Approval Process',
  description: 'Sarah manually reviews and approves all expenses over $500 via email',
  owner: 'Sarah Johnson',
  stakeholder_count: 25,
  frequency: 'daily',
  business_impact: 'high',
  documentation_level: 'none',
  failure_scenarios: ['Sarah is on vacation', 'Email gets lost', 'Sarah leaves company'],
  dependencies: ['Email system', 'Sarah\'s knowledge'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tenant_id: 'test-tenant'
}

export async function runSmokeTest() {
  console.log('🧪 Running Standstill smoke test...')
  
  // Test 1: Scoring engine
  try {
    const score = calculateWorkflowScore(mockWorkflow)
    console.log('✅ Scoring engine works:', score)
  } catch (error) {
    console.error('❌ Scoring engine failed:', error)
    return false
  }
  
  // Test 2: Supabase connection (only if env vars are available)
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
      const { error } = await supabase.from('workflows').select('count').limit(1)
      if (error && !error.message.includes('relation "workflows" does not exist')) {
        console.error('❌ Supabase connection failed:', error)
        return false
      }
      console.log('✅ Supabase connection works')
    } catch (error) {
      console.error('❌ Supabase test failed:', error)
      return false
    }
  } else {
    console.log('⏭️ Skipping Supabase test (no env vars)')
  }
  
  console.log('🎉 Smoke test passed!')
  return true
}

// Auto-run in development
if (import.meta.env.DEV) {
  runSmokeTest()
}
