import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { sanityRevalidateSecret } from "@/sanity/env";
import { getSectionForDocumentType } from "@/sanity/lib/content";

type SanityWebhookPayload = {
  _type?: string;
  slug?: {
    current?: string;
  } | string;
};

export async function POST(request: NextRequest) {
  if (!sanityRevalidateSecret) {
    return NextResponse.json(
      { ok: false, message: "Missing SANITY_REVALIDATE_SECRET." },
      { status: 500 }
    );
  }

  const { body, isValidSignature } = await parseBody<SanityWebhookPayload>(
    request,
    sanityRevalidateSecret
  );

  if (!isValidSignature || !body) {
    return NextResponse.json(
      { ok: false, message: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  revalidateTag("sanity", "max");
  revalidateTag("sanity:insights", "max");
  revalidateTag("sanity:settings", "max");
  revalidatePath("/");
  revalidatePath("/insights");

  const slug =
    typeof body.slug === "string" ? body.slug : body.slug?.current ?? null;
  const section = body._type ? getSectionForDocumentType(body._type) : null;

  if (section) {
    revalidateTag(`sanity:${section.key}`, "max");
    revalidatePath(section.href);

    if (slug) {
      revalidateTag(`sanity:${section.key}:${slug}`, "max");
      revalidatePath(`${section.href}/${slug}`);
    }
  }

  if (body._type === "siteSettings") {
    revalidatePath("/blog");
    revalidatePath("/articles");
    revalidatePath("/news");
    revalidatePath("/guides");
  }

  return NextResponse.json({ ok: true, revalidated: true, section: section?.key ?? null });
}
