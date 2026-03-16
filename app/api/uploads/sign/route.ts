import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { uploadRequestSchema } from "@/lib/healthfit/contracts";
import { createId } from "@/lib/healthfit/ids";

const bucketMap = {
  avatars: process.env.SUPABASE_AVATAR_BUCKET ?? "avatars",
  "progress-photos":
    process.env.SUPABASE_PROGRESS_BUCKET ?? "progress-photos",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = uploadRequestSchema.parse(await request.json());
    const path = `${user.id}/${createId("asset")}.${payload.extension}`;
    const bucket = bucketMap[payload.bucket];
    const storageBucket = getAdminClient().storage.from(bucket) as unknown as {
      createSignedUploadUrl: (
        path: string
      ) => Promise<{ data?: { signedUrl: string; path: string; token: string }; error?: { message: string } }>;
    };

    const { data, error } = await storageBucket.createSignedUploadUrl(path);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bucket,
        path,
        signedUrl: data?.signedUrl,
        token: data?.token,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create upload URL",
      },
      { status: 400 }
    );
  }
}
