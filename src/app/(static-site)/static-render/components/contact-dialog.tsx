"use client";

import { useState, useRef, useEffect } from "react";

export function ContactDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleClose() {
    setOpen(false);
    if (status === "sent") {
      setStatus("idle");
    }
  }

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

  return (
    <>
      {children ? (
        <button onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-transform shadow-lg shadow-[#00b8d4]/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Us
        </button>
      )}

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="backdrop:bg-black/50 bg-transparent p-0 m-auto max-w-lg w-full rounded-2xl"
      >
        <div className="bg-white rounded-2xl p-8 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#44474d] hover:text-[#0d223f] transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-[#0d223f] mb-2">
            Contact Us
          </h2>
          <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d] mb-6">
            We would love to hear from you. Send us a message and we&apos;ll get back to you soon.
          </p>

          {status === "sent" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#e7f8ff] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00b8d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] mb-2">
                Message Sent!
              </h3>
              <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d]">
                Thank you for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 bg-[#00b8d4] text-white px-8 py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-transform"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-[#0d223f] mb-1 font-[family-name:var(--font-geist-sans)]">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#b4c7ec]/50 focus:border-[#00b8d4] focus:ring-2 focus:ring-[#00b8d4]/20 outline-none transition-all text-sm font-[family-name:var(--font-jakarta)] text-[#0d223f]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-[#0d223f] mb-1 font-[family-name:var(--font-geist-sans)]">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#b4c7ec]/50 focus:border-[#00b8d4] focus:ring-2 focus:ring-[#00b8d4]/20 outline-none transition-all text-sm font-[family-name:var(--font-jakarta)] text-[#0d223f]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-[#0d223f] mb-1 font-[family-name:var(--font-geist-sans)]">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-[#b4c7ec]/50 focus:border-[#00b8d4] focus:ring-2 focus:ring-[#00b8d4]/20 outline-none transition-all text-sm font-[family-name:var(--font-jakarta)] text-[#0d223f] resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              {status === "error" && (
                <p className="text-red-600 text-sm font-[family-name:var(--font-geist-sans)]">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-[#00b8d4] text-white py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-[1.02] transition-transform shadow-lg shadow-[#00b8d4]/20 disabled:opacity-60 disabled:hover:scale-100"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
