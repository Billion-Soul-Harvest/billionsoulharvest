import { AccountManager } from "@/features/mailbox/account-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Accounts — BSH Admin",
};

export default function MailboxAccountsPage() {
  return <AccountManager />;
}
