import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Security check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Configure web-push with VAPID keys
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        {
          message: "VAPID keys not configured",
          status: "error",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }

    webpush.setVapidDetails("mailto:admin@vayu.app", publicKey, privateKey);

    const supabase = await createClient();

    // 1. Fetch critical AQI alerts (AQI > 200)
    const { data: alerts, error: alertError } = await (supabase as any)
      .from("aqi_readings")
      .select("*, locations!inner(id, name, city)")
      .gte("aqi_value", 200)
      .order("recorded_at", { ascending: false })
      .limit(10);

    if (alertError) {
      console.error("Error fetching alerts:", alertError);
      return NextResponse.json(
        {
          message: "Error fetching alerts",
          error: alertError.message,
          status: "error",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({
        message: "No critical alerts to notify",
        status: "success",
        notificationsSent: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Fetch all active push subscriptions
    const { data: subscriptions, error: subError } = (await supabase as any)
      .from("push_subscriptions")
      .select("*");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return NextResponse.json(
        {
          message: "Error fetching subscriptions",
          error: subError.message,
          status: "error",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        message: "No active subscriptions",
        status: "success",
        notificationsSent: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Send Web Push notifications
    let notificationsSent = 0;
    let notificationsFailed = 0;
    const failedEndpoints = [];

    for (const alert of alerts) {
      const notification = {
        title: `🚨 Critical Air Quality Alert`,
        body: `AQI ${alert.aqi_value} in ${alert.locations[0].name}, ${alert.locations[0].city}. Avoid outdoor activities.`,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        data: {
          url: `/search?city=${encodeURIComponent(alert.locations[0].city)}`,
          aqi: alert.aqi_value,
          location: alert.locations[0].name,
        },
      };

      for (const sub of subscriptions) {
        // Check if this subscription's AQI threshold is exceeded
        if (alert.aqi_value < sub.threshold_aqi) {
          continue;
        }

        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notification),
          );

          notificationsSent++;
        } catch (error: any) {
          console.error(
            "Push notification error:",
            error.statusCode,
            error.message,
          );
          notificationsFailed++;

          // Remove subscription if endpoint is invalid (410 Gone)
          if (error.statusCode === 410 || error.statusCode === 404) {
            failedEndpoints.push(sub.endpoint);
            try {
              await (supabase as any)
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", sub.endpoint);
            } catch (deleteError) {
              console.error("Error deleting subscription:", deleteError);
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: "Push alerts cron completed",
      status: "success",
      alertsProcessed: alerts.length,
      subscriptionsChecked: subscriptions.length,
      notificationsSent,
      notificationsFailed,
      removedEndpoints: failedEndpoints.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Push alerts cron error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
