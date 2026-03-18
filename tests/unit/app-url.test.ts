import { afterEach, describe, expect, it } from "vitest";
import { resolveAppUrl } from "@/lib/config/app-url";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalVercelUrl = process.env.VERCEL_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }

  if (originalVercelUrl === undefined) {
    delete process.env.VERCEL_URL;
  } else {
    process.env.VERCEL_URL = originalVercelUrl;
  }
});

describe("resolveAppUrl", () => {
  it("prefers NEXT_PUBLIC_APP_URL and trims trailing slashes", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com///";
    delete process.env.VERCEL_URL;

    expect(resolveAppUrl()).toBe("https://example.com");
  });

  it("falls back to VERCEL_URL when the public app url is missing", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "preview.example.app/";

    expect(resolveAppUrl()).toBe("https://preview.example.app");
  });

  it("falls back to the local app port used by the dev scripts", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;

    expect(resolveAppUrl()).toBe("http://localhost:4001");
  });
});
