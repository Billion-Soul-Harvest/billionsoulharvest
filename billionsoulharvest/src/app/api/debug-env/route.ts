import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN ?? "NOT SET",
    NEXT_PUBLIC_ADMIN_DOMAIN: process.env.NEXT_PUBLIC_ADMIN_DOMAIN ?? "NOT SET",
  });
}
