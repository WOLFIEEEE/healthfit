import { NextResponse } from "next/server";
import { createUser } from "@/actions/create-user";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const error = searchParams.get("error_description");
  const next = searchParams.get("next");
  const supabase = await createClient();

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  } else if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "magiclink",
    });

    if (verifyError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(verifyError.message)}`
      );
    }
  }

  const createUserRes = await createUser();

  if (!createUserRes.success) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(createUserRes.error)}`
    );
  }

  const redirectPath =
    next ??
    (createUserRes.data.onboardingCompleted
      ? "/dashboard/overview"
      : "/onboarding");

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
