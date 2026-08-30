"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return;

    const registration = await navigator.serviceWorker.register(
      "/service-worker.js",
      {
        updateViaCache: "none", // always fetch the latest service-worker.js, never a cached copy
      },
    );

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // required: every push must show a visible notification
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ) as BufferSource,
    });

    // Send it to your backend to store in Prisma
    await axios.post("/api/push/subscribe", subscription, {
      headers: { "Content-Type": "application/json" },
    });
  }

  return { permission, subscribe };
}
