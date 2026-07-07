import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import nodemailer from "npm:nodemailer@6";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

interface EmailResult {
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { emails } = (await req.json()) as { emails: EmailPayload[] };

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "emails array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (emails.length > 50) {
      return new Response(
        JSON.stringify({ error: "Maximum 50 emails per batch" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const transport = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
      port: Number(Deno.env.get("SMTP_PORT") || 465),
      secure: true,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const defaultFrom =
      Deno.env.get("SMTP_FROM") ||
      "Billion Soul Harvest <info@billionsoulharvest.org>";

    const results: EmailResult[] = [];

    for (const email of emails) {
      try {
        const info = await transport.sendMail({
          from: email.from || defaultFrom,
          to: email.to,
          subject: email.subject,
          html: email.html,
          replyTo: email.replyTo,
          headers: email.headers,
        });
        results.push({
          to: email.to,
          success: true,
          messageId: info.messageId,
        });
      } catch (err) {
        results.push({
          to: email.to,
          success: false,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
    }

    transport.close();

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
