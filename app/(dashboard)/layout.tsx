"use client";

import { useEffect } from 'react';
import { AdminNav } from '@/components/shared/AdminNav';
import { AdminHeader } from '@/components/shared/AdminHeader';
import { useSessionGuard } from '@/lib/admin/useSessionGuard';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Session and Auth Security
    useSessionGuard();

    // 2. Hydrate Global Store
    const { profile, adminContext, isLoading } = useAdminContext();
    const { selectedCityId, setSelectedCityId } = useAdminStore();

    const isImpersonating = adminContext?.type === 'central_admin' && selectedCityId;

    return (
        <div className="flex h-screen bg-[#06101c] overflow-hidden selection:bg-[#00D4FF] selection:text-black">
            {/* Sidebar Navigation */}
            <AdminNav />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AdminHeader />

                {/* Impersonation Banner for Central Admins */}
                {isImpersonating && (
                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-amber-500 text-sm font-medium sticky top-0 z-50 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>
                                👁 Viewing data as if you were the <span className="font-bold underline">{selectedCityId}</span> city admin.
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedCityId(null)}
                            className="p-1 hover:bg-amber-500/20 rounded-full transition-colors flex items-center gap-1 text-xs"
                        >
                            Reset to All Cities <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {/* Sub-bg glowing gradient effect for Depth */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#00D4FF]/5 to-transparent pointer-events-none" />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
