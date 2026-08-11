import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";

function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  return oauth2Client;
}

// POST: Create a resumable upload session and return the upload URL + access token
export async function POST(request: Request) {
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

    const { fileName, mimeType, fileSize } = await request.json();
    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: "fileName and mimeType are required" },
        { status: 400 }
      );
    }
    if (fileSize > 500 * 1024 * 1024) {
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

    const oauth2Client = getOAuth2Client();
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    // Create resumable upload session
    const initRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName,
          parents: [folderId],
        }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error("Drive resumable init error:", errText);
      return NextResponse.json(
        { error: "Failed to create upload session" },
        { status: 500 }
      );
    }

    const uploadUrl = initRes.headers.get("Location");
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "No upload URL returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ uploadUrl, accessToken: token });
  } catch (err) {
    console.error("Drive upload init error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Set file permissions to public after upload completes
export async function PUT(request: Request) {
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

    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    const oauth2Client = getOAuth2Client();
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return NextResponse.json({ fileId, embedUrl });
  } catch (err) {
    console.error("Drive permission error:", err);
    const message = err instanceof Error ? err.message : "Failed to set permissions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
