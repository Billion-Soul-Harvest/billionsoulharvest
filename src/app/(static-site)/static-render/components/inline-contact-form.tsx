"use client";

import { useState } from "react";

export function InlineContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div
        className="bg-white text-[#0a0a0a]"
        style={{ padding: "48px 44px" }}
      >
        <div
          className="font-[family-name:var(--font-geist-mono)]"
          style={{
            padding: "16px 18px",
            backgroundColor: "#0a0a0a",
            color: "#1ecdec",
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Message Sent! Thank you for reaching out. We&apos;ll get back to you soon.
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white text-[#0a0a0a]"
      style={{ padding: "48px 44px" }}
    >
      <p
        className="font-[family-name:var(--font-jakarta)]"
        style={{
          fontSize: "16.5px",
          lineHeight: 1.6,
          color: "#505870",
          margin: 0,
          marginBottom: "30px",
        }}
      >
        Send us a message and we&apos;ll get back to you soon.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <div>
          <label
            htmlFor="inline-name"
            className="font-[family-name:var(--font-geist-mono)]"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#506b9f",
              marginBottom: "8px",
            }}
          >
            Name
          </label>
          <input
            id="inline-name"
            name="name"
            type="text"
            required
            className="w-full font-[family-name:var(--font-jakarta)] outline-none transition-colors placeholder:text-[#999] focus:border-[#1ecdec]"
            style={{
              padding: "10px 0",
              borderBottom: "1px solid rgba(10,10,10,0.28)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              backgroundColor: "transparent",
              fontSize: "17px",
              color: "#0a0a0a",
            }}
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="inline-email"
            className="font-[family-name:var(--font-geist-mono)]"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#506b9f",
              marginBottom: "8px",
            }}
          >
            Email
          </label>
          <input
            id="inline-email"
            name="email"
            type="email"
            required
            className="w-full font-[family-name:var(--font-jakarta)] outline-none transition-colors placeholder:text-[#999] focus:border-[#1ecdec]"
            style={{
              padding: "10px 0",
              borderBottom: "1px solid rgba(10,10,10,0.28)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              backgroundColor: "transparent",
              fontSize: "17px",
              color: "#0a0a0a",
            }}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label
            htmlFor="inline-message"
            className="font-[family-name:var(--font-geist-mono)]"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#506b9f",
              marginBottom: "8px",
            }}
          >
            Message
          </label>
          <textarea
            id="inline-message"
            name="message"
            required
            rows={5}
            className="w-full font-[family-name:var(--font-jakarta)] outline-none transition-colors placeholder:text-[#999] focus:border-[#1ecdec]"
            style={{
              padding: "10px 0",
              borderBottom: "1px solid rgba(10,10,10,0.28)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              backgroundColor: "transparent",
              fontSize: "17px",
              lineHeight: 1.6,
              color: "#0a0a0a",
              resize: "vertical",
            }}
            placeholder="How can we help you?"
          />
        </div>

        {status === "error" && (
          <p className="text-red-600 text-sm font-[family-name:var(--font-geist-sans)]" style={{ margin: 0 }}>
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full font-[family-name:var(--font-jakarta)] hover:bg-[#45d6f0] transition-colors disabled:opacity-60"
          style={{
            padding: "22px 26px",
            backgroundColor: "#1ecdec",
            color: "#0a0a0a",
            fontWeight: 800,
            fontSize: "14px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
          }}
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
