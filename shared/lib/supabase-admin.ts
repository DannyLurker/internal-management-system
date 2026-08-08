import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key.
// Do NOT import this from any client component or route that ships to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
