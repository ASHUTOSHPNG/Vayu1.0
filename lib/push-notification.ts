'use client';
import { createClient } from '@/lib/supabase/client';

export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered successfully:', registration);
            return registration;
        } catch (error) {
            console.error('SW registration failed:', error);
        }
    }
}

export async function subscribeUser() {
    const registration = await registerServiceWorker();
    if (!registration) {
        console.error('Service Worker registration not found');
        return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
        console.error('Push Notifications error: NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set in environment variables.');
        return;
    }

    try {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        const supabase = createClient();
        const { error } = await (supabase as any).from('push_subscriptions').upsert({
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!) as any)),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!) as any)),
            threshold_aqi: 100
        });

        if (error) {
            console.error('Error saving subscription to database:', error);
            return subscription;
        }

        console.log('User subscribed to push notifications successfully');
        return subscription;
    } catch (error) {
        console.error('Failed to subscribe user to push notifications:', error);
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}