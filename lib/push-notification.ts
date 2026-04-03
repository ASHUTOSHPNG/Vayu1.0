"use client";

import { createClient } from "@/lib/supabase/client";

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("SW registration failed:", error);
    }
  }
}

export async function subscribeUser() {
  const registration = await registerServiceWorker();
  if (!registration) {
    console.error("Service Worker registration not found");
    return;
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.error(
      "Push Notifications error: NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set in environment variables.",
    );
    return;
  }

  try {
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Extract and encode subscription keys
    const p256dhKey = subscription.getKey("p256dh");
    const authKey = subscription.getKey("auth");

    if (!p256dhKey || !authKey) {
      console.error("Failed to get subscription keys");
      return;
    }

    const p256dhString = btoa(
      String.fromCharCode.apply(
        null,
        Array.from(new Uint8Array(p256dhKey)) as any,
      ),
    );
    const authString = btoa(
      String.fromCharCode.apply(
        null,
        Array.from(new Uint8Array(authKey)) as any,
      ),
    );

    const supabase = createClient();

    // TODO: Implement push subscription storage when push_subscriptions table is created
    // const { error } = await supabase.from("push_subscriptions").upsert({
    //   user_id: user.id,
    //   endpoint: subscription.endpoint,
    //   p256dh: p256dhString,
    //   auth: authString,
    //   threshold_aqi: 100,
    // });

    // if (error) {
    //   console.error("Error saving subscription to database:", error);
    //   return subscription;
    // }

    console.log("User subscribed to push notifications successfully");
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe user to push notifications:", error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
