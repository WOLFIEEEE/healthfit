const localhostAppUrl = "http://localhost:4001";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function resolveAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return trimTrailingSlash(
      vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`
    );
  }

  return localhostAppUrl;
}
