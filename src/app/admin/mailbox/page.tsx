import { Suspense } from "react";
import { MailboxLayout } from "@/features/mailbox/mailbox-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mailbox — BSH Admin",
};

export default function MailboxPage() {
  return (
    <Suspense>
      <MailboxLayout />
    </Suspense>
  );
}
