"use client";

import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";

export default function GoogleSignIn() {
  const supabaseEnabled = hasSupabasePublicEnv();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!supabaseEnabled) {
      return;
    }

    const supabase = createClient();
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full justify-center rounded-2xl border-white/70 bg-white/70 text-sm"
      onClick={handleLogin}
      disabled={!supabaseEnabled || loading}
    >
      {loading ? (
        <LoaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <Image
          src="/assets/google.png"
          alt="Google"
          width={16}
          height={16}
          className="mr-2"
        />
      )}
      Continue with Google
    </Button>
  );
}
