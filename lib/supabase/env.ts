const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;
const requiredAdminEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function hasSupabasePublicEnv() {
  return requiredPublicEnv.every((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.length > 0;
  });
}

export function assertSupabasePublicEnv() {
  if (hasSupabasePublicEnv()) {
    return;
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
  );
}

export function hasSupabaseAdminEnv() {
  return requiredAdminEnv.every((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.length > 0;
  });
}
