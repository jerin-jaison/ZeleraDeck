/**
 * Supabase anon client — used for:
 *   • INSERT storefront_views  (public visitors, no auth required)
 *   • SELECT storefront_views  (dashboard stats, filtered by shop_id at app level)
 *
 * The service-role key is NEVER used here. All operations use the anon key.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[ZeleraDeck] Supabase env vars missing — view tracking disabled.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.local'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnon || '')
