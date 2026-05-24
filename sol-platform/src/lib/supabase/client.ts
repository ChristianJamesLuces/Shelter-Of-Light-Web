import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://danbqeaomjncrtpsuoae.supabase.co',
    'sb_publishable__gkX9xLTmEp82O97lJsk6w_XVpyAiKj'
  )
}