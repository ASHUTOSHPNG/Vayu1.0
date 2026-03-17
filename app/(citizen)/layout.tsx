import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wind } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VAYU | Real-time Air Quality for Your City",
    description: "Track real-time AQI, pollution sources, and get personalized health advisories for any location in India. Powered by satellite data and AI.",
    openGraph: {
        title: "VAYU | Real-time Air Quality for Your City",
        description: "Track real-time AQI, pollution sources, and get personalized health advisories for any location in India. Powered by satellite data and AI.",
        url: 'https://vayu.vercel.app',
        siteName: 'VAYU Bharat',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'VAYU - Real-time AQI Dashboard',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VAYU | Real-time Air Quality for Your City',
        description: 'Track real-time AQI, pollution sources, and get personalized health advisories for any location in India.',
        images: ['/og-image.png'],
        creator: '@vayu_india',
    },
    keywords: ['AQI', 'Air Quality', 'India Pollution', 'Sentinel-5P', 'OpenAQ', 'Satellite Air Quality'],
};

export default function CitizenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 font-sans text-white">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-teal-500/10 bg-slate-950/70 backdrop-blur-xl shadow-lg shadow-teal-900/10">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 group-hover:scale-105 transition-all duration-300">
                                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Wind className="h-6 w-6 relative z-10" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-cyan-200">VAYU</span>
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex text-nowrap">
                        {[
                            { href: "/", label: "Home" },
                            { href: "/search", label: "Search" },
                            { href: "/health-guide", label: "Health Guide" },
                            { href: "/data-sources", label: "Data Sources" },
                            { href: "/about", label: "About" },
                        ].map((item) => (
                            <Link 
                                key={item.href}
                                href={item.href} 
                                className="relative px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5 group"
                            >
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button asChild className="hidden sm:flex bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-white font-medium shadow-none hover:translate-y-0 transition-all rounded-lg px-5">
                            <Link href="/login">
                                Login
                            </Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-400 font-bold text-slate-900 hover:from-teal-300 hover:to-cyan-400 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 rounded-lg px-6">
                            <Link href="/register">
                                <span className="flex items-center gap-2">
                                    Register
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-slate-950 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-teal-500/20">
                                    <Wind className="h-6 w-6" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white">VAYU</span>
                            </div>
                            <p className="max-w-sm text-base leading-relaxed text-zinc-400 mb-8">
                                Empowering citizens with real-time, hyper-local air quality insights for a healthier, more sustainable urban life. Built with precision, powered by data.
                            </p>
                            <div className="flex gap-4">
                                {/* Social placeholders if needed, or just leave empty as requested to remove github */}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Product</h3>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li><Link href="/#problem" className="hover:text-teal-400 transition-colors">The Problem</Link></li>
                                <li><Link href="/#solution" className="hover:text-teal-400 transition-colors">Our Solution</Link></li>
                                <li><Link href="/#features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                                <li><Link href="/#sources" className="hover:text-teal-400 transition-colors">Data Network</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Resources</h3>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li><Link href="/data-sources" className="hover:text-teal-400 transition-colors">Data Sources</Link></li>
                                <li><Link href="/health-guide" className="hover:text-teal-400 transition-colors">Health Guide</Link></li>
                                <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Access</h3>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li><Link href="/login" className="hover:text-teal-400 transition-colors">Login</Link></li>
                                <li><Link href="/register" className="hover:text-teal-400 transition-colors">Register</Link></li>
                                <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">Admin Console</Link></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-zinc-500">
                            © {new Date().getFullYear()} VAYU. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-xs text-zinc-500 hover:text-zinc-300">Privacy Policy</Link>
                            <Link href="#" className="text-xs text-zinc-500 hover:text-zinc-300">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
