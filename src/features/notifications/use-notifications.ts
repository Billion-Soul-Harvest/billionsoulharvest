"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type { Notification } from "./notification-types";

export function useNotifications(onNewNotification?: (n: Notification) => void) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const onNewRef = useRef(onNewNotification);
  onNewRef.current = onNewNotification;
  const channelIdRef = useRef(crypto.randomUUID());

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    userIdRef.current = user.id;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const supabase = createClient();

    async function init() {
      await fetchNotifications();
      const userId = userIdRef.current;
      if (!userId) return;

      channel = supabase
        .channel(`notifications-${channelIdRef.current}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            onNewRef.current?.(newNotif);
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
