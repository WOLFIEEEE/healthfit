import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createUser } from "@/actions/create-user";
import { resolvePostAuthPath } from "@/lib/auth/post-auth";
import { createClient } from "@/lib/supabase/server";

export function buildRedirectUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const protocol =
    request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    requestUrl.host;

  return new URL(path, `${protocol}://${host}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const error = searchParams.get("error_description");
  const next = searchParams.get("next");
  const supabase = await createClient();

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(request, `/login?error=${encodeURIComponent(error)}`)
    );
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      return NextResponse.redirect(
        buildRedirectUrl(
          request,
          `/login?error=${encodeURIComponent(exchangeError.message)}`
        )
      );
    }
  } else if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (verifyError) {
      return NextResponse.redirect(
        buildRedirectUrl(
          request,
          `/login?error=${encodeURIComponent(verifyError.message)}`
        )
      );
    }
  }

  const createUserRes = await createUser();

  if (!createUserRes.success) {
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        `/login?error=${encodeURIComponent(createUserRes.error)}`
      )
    );
  }

  const redirectPath = resolvePostAuthPath(
    next,
    createUserRes.data.onboardingCompleted
  );

  return NextResponse.redirect(buildRedirectUrl(request, redirectPath));
}
