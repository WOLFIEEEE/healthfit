import { resolveSafeNextPath } from "@/lib/auth/magic-links";

export function resolvePostAuthPath(
  next: string | null | undefined,
  onboardingCompleted: boolean
) {
  const safeNextPath = resolveSafeNextPath(next);

  if (safeNextPath) {
    return safeNextPath;
  }

  return onboardingCompleted ? "/dashboard/overview" : "/onboarding";
}
