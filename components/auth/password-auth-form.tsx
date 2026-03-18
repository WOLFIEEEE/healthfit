"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import {
  PasswordAuthState,
  signInWithPassword,
  signUpWithPassword,
} from "@/actions/password-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState: PasswordAuthState = null;

export function PasswordAuthForm(props: { nextPath?: string | null }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithPassword,
    initialState
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithPassword,
    initialState
  );

  const activeState = mode === "sign-in" ? signInState : signUpState;
  const pending = mode === "sign-in" ? signInPending : signUpPending;

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => setMode(value as "sign-in" | "sign-up")}
      className="gap-4"
    >
      <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-secondary/80 p-1">
        <TabsTrigger value="sign-in" className="rounded-xl py-2.5">
          Sign in
        </TabsTrigger>
        <TabsTrigger value="sign-up" className="rounded-xl py-2.5">
          Create account
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sign-in">
        <form action={signInAction} className="space-y-3">
          <input type="hidden" name="next" value={props.nextPath ?? ""} />
          <div className="space-y-1">
            <label
              htmlFor="password-sign-in-email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password-sign-in-email"
                name="email"
                data-testid="password-sign-in-email"
                type="email"
                autoComplete="email"
                placeholder="you@healthfit.ai"
                required
                className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password-sign-in-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password-sign-in-password"
                name="password"
                data-testid="password-sign-in-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
              />
            </div>
          </div>
          <Button
            className="h-12 w-full rounded-2xl text-sm"
            disabled={pending}
            data-testid="password-sign-in-submit"
          >
            {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Sign in with password
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="sign-up">
        <form action={signUpAction} className="space-y-3">
          <input type="hidden" name="next" value={props.nextPath ?? ""} />
          <div className="space-y-1">
            <label
              htmlFor="password-sign-up-name"
              className="text-sm font-medium text-foreground"
            >
              Full name
            </label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password-sign-up-name"
                name="fullName"
                data-testid="password-sign-up-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                required
                className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password-sign-up-email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password-sign-up-email"
                name="email"
                data-testid="password-sign-up-email"
                type="email"
                autoComplete="email"
                placeholder="you@healthfit.ai"
                required
                className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password-sign-up-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password-sign-up-password"
                name="password"
                data-testid="password-sign-up-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                required
                className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password-sign-up-confirm"
              className="text-sm font-medium text-foreground"
            >
              Confirm password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password-sign-up-confirm"
                name="confirmPassword"
                data-testid="password-sign-up-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                required
                className="h-12 rounded-2xl border-white/70 bg-white/80 pl-11"
              />
            </div>
          </div>
          <Button
            className="h-12 w-full rounded-2xl text-sm"
            disabled={pending}
            data-testid="password-sign-up-submit"
          >
            {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Create account with password
          </Button>
          <p className="text-xs leading-6 text-muted-foreground">
            If email confirmation is enabled on Supabase, we&apos;ll send a
            verification email before the first password sign-in.
          </p>
        </form>
      </TabsContent>

      {activeState?.success ? (
        <p className="text-sm text-primary">{activeState.data}</p>
      ) : activeState?.error ? (
        <p className="text-sm text-destructive">{activeState.error}</p>
      ) : null}
    </Tabs>
  );
}
