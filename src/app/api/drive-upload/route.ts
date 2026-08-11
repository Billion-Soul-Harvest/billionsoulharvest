import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";

export const runtime = "edge";

async function getAccessToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await res.json();
  return data.access_token as string;
}

async function verifyAdmin(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .single();

  return adminUser ? user : null;
}

// POST: Create resumable upload session, OR stream-upload file to Google Drive
export async function POST(request: Request) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // JSON request = create upload session
    if (contentType.includes("application/json")) {
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

      const accessToken = await getAccessToken();

      // Create resumable upload session
      const initRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

      return NextResponse.json({ uploadUrl });
    }

    // Binary/form request = proxy upload to Google Drive resumable URL
    const uploadUrl = request.headers.get("x-upload-url");
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "x-upload-url header is required" },
        { status: 400 }
      );
    }

    const body = request.body;
    if (!body) {
      return NextResponse.json(
        { error: "No file body" },
        { status: 400 }
      );
    }

    const fileMimeType = contentType.split(";")[0].trim();

    // Stream the body directly to Google Drive
    const driveRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileMimeType,
      },
      body: body,
      // @ts-expect-error - duplex is needed for streaming request bodies
      duplex: "half",
    });

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      console.error("Drive upload error:", errText);
      return NextResponse.json(
        { error: "Upload to Google Drive failed" },
        { status: 500 }
      );
    }

    const driveFile = await driveRes.json();
    const fileId = driveFile.id;

    // Set public read permission
    const accessToken = await getAccessToken();
    const permRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      }
    );

    if (!permRes.ok) {
      console.error("Drive permission error:", await permRes.text());
    }

    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return NextResponse.json({
      fileId,
      fileName: driveFile.name,
      mimeType: driveFile.mimeType,
      embedUrl,
    });
  } catch (err) {
    console.error("Drive upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
