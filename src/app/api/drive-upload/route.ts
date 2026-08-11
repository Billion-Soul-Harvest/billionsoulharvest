import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";

export const runtime = "edge";

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh access token");
  const data = await res.json();
  return data.access_token as string;
}

async function verifyAdmin() {
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

// POST with JSON body: create resumable upload session
// PUT with binary body + x-upload-url header: proxy a chunk to Google Drive
export async function POST(request: Request) {
  try {
    const user = await verifyAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const accessToken = await getAccessToken();

    const initRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": mimeType,
          "X-Upload-Content-Length": String(fileSize),
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
  } catch (err) {
    console.error("Drive upload init error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Proxy a chunk to Google Drive's resumable upload URL
export async function PUT(request: Request) {
  try {
    const user = await verifyAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadUrl = request.headers.get("x-upload-url");
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "x-upload-url header is required" },
        { status: 400 }
      );
    }

    const contentRange = request.headers.get("x-content-range");
    const contentType = request.headers.get("content-type") || "application/octet-stream";
    const body = request.body;
    if (!body) {
      return NextResponse.json({ error: "No body" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Content-Type": contentType,
    };
    if (contentRange) {
      headers["Content-Range"] = contentRange;
    }

    const driveRes = await fetch(uploadUrl, {
      method: "PUT",
      headers,
      body,
      // @ts-expect-error - duplex needed for streaming
      duplex: "half",
    });

    // 308 Resume Incomplete = chunk accepted, more expected
    if (driveRes.status === 308) {
      const range = driveRes.headers.get("Range");
      return NextResponse.json({ status: "incomplete", range });
    }

    // 200/201 = upload complete
    if (driveRes.ok) {
      const driveFile = await driveRes.json();
      const fileId = driveFile.id;

      // Set public read permission
      const accessToken = await getAccessToken();
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "reader", type: "anyone" }),
        }
      );

      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      return NextResponse.json({
        status: "complete",
        fileId,
        fileName: driveFile.name,
        embedUrl,
      });
    }

    const errText = await driveRes.text();
    console.error("Drive chunk upload error:", driveRes.status, errText);
    return NextResponse.json(
      { error: "Chunk upload failed" },
      { status: 500 }
    );
  } catch (err) {
    console.error("Drive chunk error:", err);
    const message = err instanceof Error ? err.message : "Chunk upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
