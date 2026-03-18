"use client";

import { EmailMagicLinkForm } from "@/components/auth/email-magic-link-form";
import { PasswordAuthForm } from "@/components/auth/password-auth-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthMethods(props: { nextPath?: string | null }) {
  return (
    <Tabs defaultValue="password" className="gap-5">
      <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-secondary/80 p-1">
        <TabsTrigger value="password" className="rounded-xl py-2.5">
          Password
        </TabsTrigger>
        <TabsTrigger value="magic-link" className="rounded-xl py-2.5">
          Magic link
        </TabsTrigger>
      </TabsList>

      <TabsContent value="password" className="space-y-3">
        <div className="rounded-2xl border border-border/70 bg-white/65 px-4 py-3 text-sm text-muted-foreground">
          Sign in instantly with your email and password, or create a new account
          here.
        </div>
        <PasswordAuthForm nextPath={props.nextPath} />
      </TabsContent>

      <TabsContent value="magic-link" className="space-y-3">
        <div className="rounded-2xl border border-border/70 bg-white/65 px-4 py-3 text-sm text-muted-foreground">
          Prefer passwordless access? We&apos;ll send a secure sign-in link to your
          inbox.
        </div>
        <EmailMagicLinkForm nextPath={props.nextPath} />
      </TabsContent>
    </Tabs>
  );
}
