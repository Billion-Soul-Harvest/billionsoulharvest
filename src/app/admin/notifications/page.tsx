import { NotificationList } from "@/features/notifications/notification-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — BSH Admin",
};

export default function NotificationsPage() {
  return <NotificationList />;
}
