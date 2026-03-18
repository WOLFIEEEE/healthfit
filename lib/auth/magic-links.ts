export function resolveSafeNextPath(next: string | null | undefined) {
  if (!next) {
    return null;
  }

  const normalized = next.trim();

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return null;
  }

  return normalized;
}

export function buildMagicLinkCallbackUrl(props: {
  origin: string;
  tokenHash: string;
  type: string;
  next?: string | null;
}) {
  const url = new URL("/api/auth/callback", props.origin);
  url.searchParams.set("token_hash", props.tokenHash);
  url.searchParams.set("type", props.type);

  const safeNextPath = resolveSafeNextPath(props.next);

  if (safeNextPath) {
    url.searchParams.set("next", safeNextPath);
  }

  return url.toString();
}
