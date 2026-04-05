'use client';

import React from 'react';
import { MapPin, Shield, Eye, Lock } from 'lucide-react';

interface LocationPermissionModalProps {
    isOpen: boolean;
    onAllow: () => void;
    onSkip: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
    isOpen,
    onAllow,
    onSkip,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <style jsx global>{`
            @keyframes bounce-subtle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .animate-bounce-subtle {
                animation: bounce-subtle 2s ease-in-out infinite;
            }
        `}</style>
            <div className="bg-white rounded-2xl w-full max-w-[420px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="bg-teal-50 p-6 rounded-full animate-bounce-subtle">
                        <MapPin size={64} className="text-teal-600" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            See the air quality right where you are
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed px-2">
                            VAYU uses your GPS location to show you real-time AQI for your exact neighborhood.
                            Your location is never stored or shared.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full pt-2">
                        <div className="flex flex-col items-center space-y-1">
                            <Shield size={20} className="text-teal-500" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Private</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <Eye size={20} className="text-teal-500" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Not Stored</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <Lock size={20} className="text-teal-500" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Secure</span>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-4 pt-2">
                        <button
                            onClick={onAllow}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-teal-600/20"
                        >
                            Allow Location Access
                        </button>
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-400 hover:text-gray-600 font-medium underline underline-offset-4 decoration-gray-300 transition-colors"
                        >
                            Skip — search manually instead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
