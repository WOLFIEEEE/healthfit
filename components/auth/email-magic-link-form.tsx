"use client";

import { useActionState } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { sendMagicLink } from "@/actions/send-magic-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MagicLinkState =
  | { success: true; data: string }
  | { success: false; error: string }
  | null;

const initialState: MagicLinkState = null;

export function EmailMagicLinkForm(props: { nextPath?: string | null }) {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={props.nextPath ?? ""} />
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@healthfit.ai"
            required
            className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
          />
        </div>
      </div>
      <Button className="h-12 w-full rounded-2xl text-sm" disabled={pending}>
        {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
        Send magic link
      </Button>
      {state?.success ? (
        <p className="text-sm text-primary">{state.data}</p>
      ) : state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
