import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mdzylkxbvlgkmmlapwxe.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kenlsa3hidmxna21tbGFwd3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjU4NzUsImV4cCI6MjA5MDY0MTg3NX0.IF8ZhY2oP-PmKaWll3-bpVQ4ILNEabmuommuasTTckY'
  );
}
