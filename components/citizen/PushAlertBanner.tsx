'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, BellRing, X } from 'lucide-react';
import { subscribeUser } from '@/lib/push-notification';
import { Badge } from '@/components/ui/badge';

export const PushAlertBanner: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'subscribing' | 'success' | 'denied'>('idle');
    const [isVisible, setIsVisible] = useState(true);

    const handleSubscribe = async () => {
        setStatus('subscribing');
        const sub = await subscribeUser();
        if (sub) {
            setStatus('success');
            setTimeout(() => setIsVisible(false), 3000);
        } else {
            setStatus('denied');
        }
    };

    if (!isVisible) return null;

    return (
        <Card className="p-6 border-teal-100 bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-2xl overflow-hidden relative group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-100 group-hover:scale-110 transition-transform duration-500">
                        {status === 'success' ? <BellRing className="h-7 w-7 animate-bounce" /> : <Bell className="h-7 w-7" />}
                    </div>
                    <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-xl tracking-tight">{"Stay Breathin' Safe"}</h4>
                            <Badge className="bg-white/20 hover:bg-white/20 text-[10px] font-bold border-none uppercase tracking-tighter">Real-time alerts</Badge>
                        </div>
                        <p className="text-teal-50 text-sm max-w-sm opacity-90">Get instant push notifications when the AQI in your neighborhood crosses unsafe thresholds.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSubscribe}
                        disabled={status === 'subscribing' || status === 'success'}
                        className="bg-white text-teal-700 hover:bg-teal-50 font-black px-8 py-6 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {status === 'subscribing' ? 'Requesting Access...' : status === 'success' ? 'Notifications Enabled!' : 'Enable Alert Notifications'}
                    </Button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-3 rounded-xl hover:bg-white/10 text-teal-100/50 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 blur-2xl rounded-full -ml-16 -mb-16"></div>
        </Card>
    );
};
