import { createClient } from "@supabase/supabase-js";

let adminClientInstance: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  if (!adminClientInstance) {
    adminClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return adminClientInstance;
}

export function getAdminAuthClient() {
  return getAdminClient().auth.admin;
}
