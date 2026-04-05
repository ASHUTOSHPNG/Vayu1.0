"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    BarChart3,
    Grid,
    Settings,
    Bell,
    Wind,
    Factory,
    ShieldAlert,
    LogOut,
    Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/store/adminStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NAV_ITEMS = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'Ward Analysis', href: '/ward-analysis', icon: Grid },
    { name: 'Source Apportionment', href: '/source-detection', icon: Factory },
    { name: 'Policy Hub', href: '/policy-hub', icon: ShieldAlert },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { profile, fullName, adminContext } = useAdminContext();
    const { setAdminContext, setSelectedCityId, selectedCityId } = useAdminStore();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setAdminContext(null, null);
            setSelectedCityId(null);
            queryClient.clear();
            toast.success("Signed out successfully");
            router.push('/login?message=signed_out');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Error signing out");
        }
    };

    const isAdminCentral = adminContext?.type === 'central_admin';
    const isImpersonating = isAdminCentral && selectedCityId;
    const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

    return (
        <div className="flex flex-col h-full w-[260px] bg-[#0A1628] text-white border-r border-[#1e2a3b] shadow-2xl relative z-10 transition-all duration-300">
            {/* Logo Area */}
            <div className="p-6 flex items-center space-x-3 border-b border-[#1e2a3b] relative overflow-hidden group">
                <div className="relative">
                    <Wind className="h-8 w-8 text-[#00D4FF]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none origin-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="absolute w-1 h-1 bg-[#00D4FF] rounded-full animate-ping top-0 left-0" />
                        <span className="absolute w-1 h-1 bg-[#00D4FF] rounded-full animate-ping bottom-0 right-0 delay-75" />
                    </div>
                </div>
                <span className="text-xl font-bold tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Vayu
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium relative",
                                isActive
                                    ? "bg-[#00D4FF]/10 text-[#00D4FF]"
                                    : "text-gray-400 hover:bg-[#1e2a3b] hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                isActive ? "text-[#00D4FF]" : "text-gray-500 group-hover:text-gray-300"
                            )} />
                            <span>{item.name}</span>
                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Fixed Bottom User Section */}
            <div className="p-4 border-t border-[#1e2a3b] bg-[#0A1628]">
                <div className="bg-[#132238] rounded-2xl border border-[#1e2a3b] p-4 flex flex-col gap-4">
                    {/* User Info Row */}
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-blue-600 flex items-center justify-center text-sm font-bold shadow-lg border border-[#0A1628]">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                                {fullName || 'Administrator'}
                            </p>
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight mt-1 border",
                                isAdminCentral
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                    : "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30"
                            )}>
                                {isAdminCentral ? 'Central Admin' : `${profile?.assigned_city_name || 'City'} Admin`}
                            </span>
                        </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between border-t border-[#1e2a3b] pt-3 px-1">
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            <SettingsIcon className="h-3.5 w-3.5" />
                            Settings
                        </Link>

                        <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
                            <AlertDialogTrigger asChild>
                                <button className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors">
                                    <LogOut className="h-3.5 w-3.5" />
                                    Sign Out
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Sign out of VAYU Admin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will need to sign in again to access the dashboard and monitoring tools.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                                    >
                                        Sign Out
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    );
}
