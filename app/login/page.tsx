import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AuthMethods } from "@/components/auth/auth-methods";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { getUser } from "@/actions/get-user";
import { resolveSafeNextPath } from "@/lib/auth/magic-links";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import { Activity, Dumbbell, HeartPulse, Sparkles } from "lucide-react";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Sign In",
  description: "Secure Healthfit.ai account sign in.",
});

export default async function LoginPage(props: {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}) {
  const userRes = await getUser();
  const { error, next } = await props.searchParams;
  const nextPath = resolveSafeNextPath(next ?? null);

  if (userRes.success && userRes.data) {
    redirect(nextPath ?? "/dashboard/overview");
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left - Image panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1000&q=85"
          alt="Wellness"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/40 to-foreground/70" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <BrandMark className="[&_div]:text-white [&_div]:text-white/70" />

          <div>
            <h1 className="max-w-md text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Your wellness dashboard awaits.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
              Sign in with a password or a secure email link to access your
              goals, coach, workouts, meal logs, check-ins, and billing.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { icon: Dumbbell, label: "Adaptive weekly programs" },
                { icon: Sparkles, label: "AI coach with guardrails" },
                { icon: HeartPulse, label: "Nutrition & hydration" },
                { icon: Activity, label: "Progress & billing" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm"
                  >
                    <Icon className="size-4 text-emerald-400" />
                    <span className="text-xs text-white/80">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-white/30">
            Healthfit.ai provides wellness guidance only.
          </p>
        </div>
      </div>

      {/* Right - Form panel */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <BrandMark />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="pill">Secure sign in</p>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your password or a magic link to get back into your member workspace.
            </p>
          </div>

          <div className="mt-10">
            <AuthMethods nextPath={nextPath} />

            {error ? (
              <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>

          <p className="mt-10 text-xs leading-6 text-muted-foreground">
            Healthfit.ai provides wellness guidance only and does not replace
            medical professionals, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </main>
  );
}
