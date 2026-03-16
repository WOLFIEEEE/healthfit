const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
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
