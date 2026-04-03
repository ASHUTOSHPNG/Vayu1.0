"use client";
import { useState } from 'react';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    User,
    Bell,
    Lock,
    Database as DbIcon,
    Mail,
    RefreshCw,
    ShieldCheck,
    Clock,
    UserCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function SettingsPage() {
    const { profile, fullName, email, isCentralAdmin, adminContext } = useAdminContext();
    const supabase = createClient();

    // Notification states
    const [emailAlerts, setEmailAlerts] = useState((profile?.notification_settings as any)?.email_alerts ?? true);
    const [dailySummary, setDailySummary] = useState((profile?.notification_settings as any)?.daily_summary ?? false);
    const [threshold, setThreshold] = useState((profile?.notification_settings as any)?.anomaly_threshold ?? 150);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);

    // Password states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Cron state
    const [isRefreshingData, setIsRefreshingData] = useState(false);

    const handleSaveNotifications = async () => {
        if (!profile) return;
        setIsSavingNotifications(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    notification_settings: {
                        email_alerts: emailAlerts,
                        daily_summary: dailySummary,
                        anomaly_threshold: threshold
                    }
                } as any)
                .eq('id', profile.id);
            if (error) throw error;
            toast.success("Notification preferences updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update preferences");
        } finally {
            setIsSavingNotifications(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleSignOutAll = async () => {
        try {
            const { error } = await supabase.auth.signOut({ scope: 'global' });
            if (error) throw error;
            // useSessionGuard will handle redirect
        } catch (error) {
            toast.error("Error signing out");
        }
    };

    const handleManualRefresh = async () => {
        setIsRefreshingData(true);
        try {
            const response = await fetch('/api/cron/refresh-data', {
                method: 'POST'
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`Data refresh triggered: ${data.processed || 0} records processed`);
            } else {
                throw new Error(data.message || "Refresh failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to trigger data refresh");
        } finally {
            setIsRefreshingData(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-[#00D4FF]" />
                    Admin Settings
                </h1>
                <p className="text-gray-400 mt-2">Manage your account preferences and administrative tools.</p>
            </div>

            {/* 1. Profile Information */}
            <Card className="bg-[#0e213b] border-[#1e2a3b] shadow-xl overflow-hidden">
                <CardHeader className="border-b border-[#1e2a3b] bg-[#132238]/50">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <User className="h-5 w-5 text-[#00D4FF]" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-500 text-xs uppercase tracking-widest font-bold">Full Name</Label>
                            <p className="text-white font-medium mt-1">{fullName}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500 text-xs uppercase tracking-widest font-bold">Email Address</Label>
                            <p className="text-white font-medium mt-1 truncate">{email || 'N/A'}</p>
                            <span className="text-[10px] text-gray-500 font-mono italic">(Connected via Auth)</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-500 text-xs uppercase tracking-widest font-bold">Role & Scope</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isCentralAdmin ? 'bg-amber-500/20 text-amber-500' : 'bg-[#00D4FF]/20 text-[#00D4FF]'}`}>
                                    {isCentralAdmin ? 'Central Administrator' : 'City Administrator'}
                                </span>
                                {!isCentralAdmin && (
                                    <span className="text-white font-medium">({profile.assigned_city_name})</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label className="text-gray-500 text-xs uppercase tracking-widest font-bold">Account Timeline</Label>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Last login:{' '}
                                    {(profile as any).last_login_at
                                        ? format(new Date((profile as any).last_login_at), 'PPP pp')
                                        : 'Never'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <a href="mailto:admin@airsense.in" className="text-[#00D4FF] hover:underline text-sm flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Need to change profile info? Contact support
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Notification Preferences */}
            <Card className="bg-[#0e213b] border-[#1e2a3b] shadow-xl">
                <CardHeader className="border-b border-[#1e2a3b] bg-[#132238]/50">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Bell className="h-5 w-5 text-[#00D4FF]" />
                        Notification Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-white text-base">Critical AQI Alerts</Label>
                            <p className="text-gray-400 text-xs">Receive email notifications for anomalies above threshold.</p>
                        </div>
                        <Switch
                            checked={emailAlerts}
                            onCheckedChange={setEmailAlerts}
                            className="data-[state=checked]:bg-[#00D4FF]"
                        />
                    </div>
                    <Separator className="bg-[#1e2a3b]" />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-white text-base">Daily Summary Reports</Label>
                            <p className="text-gray-400 text-xs">Receive a curated digest of city performance every morning.</p>
                        </div>
                        <Switch
                            checked={dailySummary}
                            onCheckedChange={setDailySummary}
                            className="data-[state=checked]:bg-[#00D4FF]"
                        />
                    </div>
                    <Separator className="bg-[#1e2a3b]" />
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-white">Anomaly Threshold (AQI)</Label>
                            <span className="text-[#00D4FF] font-bold bg-[#00D4FF]/10 px-3 py-1 rounded-full text-sm">
                                {threshold} AQI
                            </span>
                        </div>
                        <Slider
                            value={[threshold]}
                            onValueChange={([val]) => setThreshold(val)}
                            max={300}
                            min={100}
                            step={5}
                            className="[&_[role=slider]]:bg-[#00D4FF]"
                        />
                    </div>
                    <div className="pt-4">
                        <Button
                            onClick={handleSaveNotifications}
                            disabled={isSavingNotifications}
                            className="bg-[#00D4FF] hover:bg-[#00b8e6] text-[#0A1628] font-bold"
                        >
                            {isSavingNotifications ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Preferences
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Security Section */}
            <Card className="bg-[#0e213b] border-[#1e2a3b] shadow-xl">
                <CardHeader className="border-b border-[#1e2a3b] bg-[#132238]/50">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Lock className="h-5 w-5 text-[#00D4FF]" />
                        Security & Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label className="text-white">New Password</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-[#0A1628] border-[#1e2a3b] text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Confirm New Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-[#0A1628] border-[#1e2a3b] text-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isUpdatingPassword || !newPassword}
                            variant="outline"
                            className="border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10"
                        >
                            Change Password
                        </Button>
                    </form>
                    <Separator className="bg-[#1e2a3b]" />
                    <div>
                        <Label className="text-white text-base">Session Management</Label>
                        <p className="text-gray-400 text-xs mt-1 mb-4">You can force a sign-out on all active devices for security.</p>
                        <Button
                            variant="destructive"
                            onClick={handleSignOutAll}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20"
                        >
                            Sign Out of All Devices
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Super Admin Section */}
            {isCentralAdmin && (
                <Card className="bg-[#0e213b] border-[#1e2a3b] shadow-xl border-t-2 border-t-amber-500/50">
                    <CardHeader className="border-b border-[#1e2a3b] bg-amber-500/5">
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                            <DbIcon className="h-5 w-5" />
                            System Maintenance (Central Admin Only)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#0A1628] border border-[#1e2a3b]">
                                <Label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Data Freshness</Label>
                                <p className="text-white text-lg font-bold mt-1">Live</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[#0A1628] border border-[#1e2a3b]">
                                <Label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">System Health</Label>
                                <p className="text-emerald-500 text-lg font-bold mt-1">Optimal</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white text-base">Manual Data Synchronization</Label>
                                <p className="text-gray-400 text-xs mt-1">Trigger the pipeline to fetch latest readings from all city sensors immediately.</p>
                            </div>
                            <Button
                                onClick={handleManualRefresh}
                                disabled={isRefreshingData}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                            >
                                {isRefreshingData ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                                Trigger Manual Data Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}