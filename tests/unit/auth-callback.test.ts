import { describe, expect, it } from "vitest";
import { buildRedirectUrl } from "@/app/api/auth/callback/route";

describe("buildRedirectUrl", () => {
  it("prefers forwarded headers for the redirect host", () => {
    const request = new Request("http://localhost:4001/api/auth/callback", {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "exotic-hen-really.ngrok-free.app",
      },
    });

    expect(buildRedirectUrl(request, "/dashboard/overview").toString()).toBe(
      "https://exotic-hen-really.ngrok-free.app/dashboard/overview"
    );
  });

  it("falls back to the host header when forwarded headers are missing", () => {
    const request = new Request("http://localhost:4001/api/auth/callback", {
      headers: {
        host: "127.0.0.1:3001",
      },
    });

    expect(buildRedirectUrl(request, "/login?error=Invalid").toString()).toBe(
      "http://127.0.0.1:3001/login?error=Invalid"
    );
  });
});
