import { redirect } from "next/navigation";
import GoogleSignIn from "@/components/auth/google-signin";
import { EmailMagicLinkForm } from "@/components/auth/email-magic-link-form";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { getUser } from "@/actions/get-user";

export default async function LoginPage(props: {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const userRes = await getUser();
  const { error } = await props.searchParams;

  if (userRes.success && userRes.data) {
    redirect("/dashboard/overview");
  }

  return (
    <main className="page-shell flex min-h-screen items-center py-12">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="soft-panel relative overflow-hidden px-6 py-8 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-transparent to-lime-50/80" />
          <div className="relative">
            <BrandMark />
            <div className="mt-10 max-w-xl">
              <p className="pill">Member access</p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight">
                Sign in to your wellness dashboard.
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Continue with Google or request a magic link to access your
                goals, coach, workouts, meal logs, check-ins, and billing.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                "Adaptive weekly programs",
                "AI coach with guardrails",
                "Nutrition and hydration tracking",
                "Progress and billing in one place",
              ].map((item) => (
                <div key={item} className="surface-card px-4 py-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="soft-panel px-6 py-8 sm:px-8">
          <p className="pill">Secure sign in</p>
          <h2 className="mt-5 text-3xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick the sign-in method that fits your routine and return to your
            green-and-cream member workspace.
          </p>
          <div className="mt-8 space-y-5">
            <GoogleSignIn />
            <div className="glass-line h-px w-full" />
            <EmailMagicLinkForm />
            {error ? (
              <div className="rounded-[1.25rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>
          <p className="mt-8 text-xs leading-6 text-muted-foreground">
            Healthfit.ai provides wellness guidance only and does not replace
            medical professionals, diagnosis, or treatment.
          </p>
        </section>
      </div>
    </main>
  );
}
