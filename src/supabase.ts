import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
export const supabase = createClient<Database>('https://bieydyoyhczpohqvxxkd.supabase.co', import.meta.env.VITE_SUPABASE_ANON_KEY, {})
