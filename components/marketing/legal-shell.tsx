import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export function LegalShell(props: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="page-shell py-12">
        <div className="soft-panel px-6 py-8 sm:px-10">
          <p className="pill">Healthfit.ai trust center</p>
          <h1 className="mt-5 text-4xl font-semibold">{props.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            {props.intro}
          </p>
          <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
            {props.children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
