import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = url && key && !url.startsWith('your_')
export const supabase = isConfigured ? createClient(url, key) : null
