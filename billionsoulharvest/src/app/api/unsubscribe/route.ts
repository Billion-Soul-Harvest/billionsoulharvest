import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken } from "@/shared/utils/unsubscribe-token";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function unsubscribeContact(contactId: string) {
  const supabase = getSupabase();
  await supabase
    .from("contacts")
    .update({
      email_unsubscribed: true,
      email_unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", contactId);
}

// GET: Render unsubscribe confirmation page and process unsubscribe
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("id");
  const token = searchParams.get("token");

  if (!contactId || !token) {
    return new NextResponse(renderPage("Invalid Link", "This unsubscribe link is invalid."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!verifyUnsubscribeToken(contactId, token)) {
    return new NextResponse(renderPage("Invalid Link", "This unsubscribe link is invalid or has expired."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  await unsubscribeContact(contactId);

  return new NextResponse(
    renderPage(
      "Unsubscribed",
      "You have been successfully unsubscribed from Billion Soul Harvest emails. You will no longer receive campaign emails from us."
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

// POST: RFC 8058 one-click unsubscribe
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("id");
  const token = searchParams.get("token");

  if (!contactId || !token || !verifyUnsubscribeToken(contactId, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  await unsubscribeContact(contactId);

  return NextResponse.json({ success: true });
}

function renderPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Billion Soul Harvest</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #faf8f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 48px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      border: 1px solid #e8e0d4;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .logo {
      color: #d4a853;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1a3a2a;
      font-size: 24px;
      margin: 0 0 16px;
    }
    p {
      color: #4a4a4a;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">BILLION SOUL HARVEST</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
