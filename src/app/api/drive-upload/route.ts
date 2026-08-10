import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { Readable } from "stream";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function POST(request: Request) {
  try {
    // Verify admin user
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 500MB" },
        { status: 400 }
      );
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { error: "Google Drive folder not configured" },
        { status: 500 }
      );
    }

    const drive = getDriveClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Upload to Google Drive
    const driveFile = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id,name,mimeType",
    });

    const fileId = driveFile.data.id!;

    // Set public read permission
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return NextResponse.json({
      fileId,
      fileName: driveFile.data.name,
      mimeType: driveFile.data.mimeType,
      embedUrl,
    });
  } catch (err) {
    console.error("Drive upload error:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
