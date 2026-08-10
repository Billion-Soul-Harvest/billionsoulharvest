import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";

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

export async function GET() {
  try {
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

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { error: "Google Drive folder not configured" },
        { status: 500 }
      );
    }

    const drive = getDriveClient();
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,size,createdTime,thumbnailLink)",
      orderBy: "createdTime desc",
      pageSize: 50,
    });

    const files = (res.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size ? Number(f.size) : 0,
      createdTime: f.createdTime,
      thumbnailLink: f.thumbnailLink,
      embedUrl: `https://drive.google.com/file/d/${f.id}/preview`,
    }));

    return NextResponse.json({ files });
  } catch (err) {
    console.error("Drive list error:", err);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
