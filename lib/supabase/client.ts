import { createBrowserClient } from "@supabase/ssr";
import { assertSupabasePublicEnv } from "@/lib/supabase/env";

export const createClient = () => {
  assertSupabasePublicEnv();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
