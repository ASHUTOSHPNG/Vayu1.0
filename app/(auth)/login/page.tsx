"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Wind, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [infoType, setInfoType] = useState<'success' | 'warning' | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    useEffect(() => {
        if (message === 'signed_out') {
            setInfoMessage("You have been signed out successfully.");
            setInfoType('success');
        } else if (message === 'session_expired') {
            setInfoMessage("Your session has expired. Please sign in again.");
            setInfoType('warning');
        }

        if (message) {
            const timer = setTimeout(() => {
                setInfoMessage(null);
                setInfoType(null);
                // Clear the URL param without refreshing
                const url = new URL(window.location.href);
                url.searchParams.delete('message');
                window.history.replaceState({}, '', url.toString());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                const message =
                    authError.message?.toLowerCase().includes('email not confirmed')
                        ? 'Email not confirmed. Please verify your email before logging in.'
                        : authError.message || 'Invalid credentials';
                toast.error(message);
                setError(message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Fetch profile
                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError || !profile || !profile.admin_type || profile.is_active === false) {
                    const errorMsg = "This account does not have admin access. Please contact your system administrator.";
                    toast.error(errorMsg);
                    setError(errorMsg);
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                // Update last_login_at
                await supabase
                    .from('user_profiles')
                    .update({ last_login_at: new Date().toISOString() })
                    .eq('id', data.user.id);

                toast.success("Welcome, Admin");
                router.refresh();
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error("An unexpected error occurred");
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-4 text-gray-100 font-sans dark admin">
            <Card className="w-full max-w-[400px] border-gray-800 bg-[#0e213b] shadow-2xl">
                <CardHeader className="space-y-4 items-center pb-6">
                    <div className="flex items-center gap-3 bg-cyan-500/10 pl-2 pr-5 py-2 rounded-full border border-cyan-500/20 justify-center">
                        <div className="bg-cyan-500/20 p-2 rounded-full">
                            <Wind className="h-5 w-5 text-cyan-500" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white font-outfit">VAYU</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-[0.2em]">
                            Admin Portal
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white font-outfit text-center">Log In</CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                        Municipality & Environmental Authority Access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {infoMessage && (
                            <div className={cn(
                                "flex items-center gap-3 p-3 rounded-lg text-xs font-semibold mb-4 animate-in fade-in slide-in-from-top-2 duration-300",
                                infoType === 'success'
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            )}>
                                {infoType === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                                <span>{infoMessage}</span>
                            </div>
                        )}
                        {error && (
                            <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-900/50 py-2">
                                <AlertDescription className="text-xs">{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@municipality.gov"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 h-11 transition-all text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 h-11 pr-10 transition-all text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-[#0A1628] font-bold h-11 mt-6 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <div className="p-6 pt-0 flex flex-col items-center space-y-4">
                    <p className="text-xs text-gray-500 text-center">
                        Don't have an administrator account? <br />
                        <Link href="/register" className="text-cyan-500 hover:text-cyan-400 font-semibold mt-1 inline-block">
                            → Register with your invite code
                        </Link>
                    </p>
                    <div className="w-full h-px bg-gray-800/50" />
                    <p className="text-xs text-gray-500 text-center">
                        Are you a citizen? <br />
                        <Link href="/" className="text-cyan-400/60 hover:text-cyan-400 font-medium mt-1 inline-block transition-colors">
                            → Browse VAYU without logging in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            </div>
        }>
            <LoginComponent />
        </Suspense>
    );
}
