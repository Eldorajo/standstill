import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rynpbrojfbvullbqsbji.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key'

if (SUPABASE_ANON_KEY === 'missing-anon-key') {
  console.warn('VITE_SUPABASE_ANON_KEY not found in environment variables; Supabase requests will fail until it is set')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export { SUPABASE_URL }
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
