"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wind, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<{
        admin_type: string;
        city_name: string | null;
        city_id: string | null;
    } | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const validateForm = () => {
        if (!fullName || !email || !password || !confirmPassword || !inviteCode) {
            setError("All fields are required");
            return false;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        return true;
    };

    const getPasswordStrength = () => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setLoading(true);

        try {
            // 1. Validate Invite Code if not already validated
            if (!inviteData) {
                const res = await fetch('/api/auth/validate-invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
                });

                if (!res.ok) {
                    setError("Invalid or expired invite code. Please contact your administrator.");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setInviteData(data);
                toast.success("Invite code validated!");
                setLoading(false);
                return;
            }

            // 2. SignUp with Supabase
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (signUpData.user) {
                // 3. Complete registration via our API
                const completeRes = await fetch('/api/auth/complete-registration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: signUpData.user.id,
                        full_name: fullName,
                        invite_code: inviteCode.trim().toUpperCase()
                    }),
                });
                if (!completeRes.ok) {
                    setError("Account created but profile linking failed. Please contact your administrator.");
                    setLoading(false);
                return;
                }

                const completeData = await completeRes.json();

                if (!completeData.email_confirmed) {
                    toast.success("Account created! Check your email to confirm before logging in.");
                    router.push('/login?message=confirm_email');
                    } else {
    toast.success("Admin account created successfully!");
    router.push('/dashboard');
                }   
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError("An unexpected error occurred during registration");
            setLoading(false);
        }
    };

    const strength = getPasswordStrength();

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
                    <CardTitle className="text-2xl font-bold tracking-tight text-white font-outfit text-center">Register</CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                        Use your invite code to create your administrator account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-900/50 py-2">
                                <AlertDescription className="text-xs">{error}</AlertDescription>
                            </Alert>
                        )}

                        {inviteData && (
                            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-400">✓ Invite valid</p>
                                    <p className="text-xs text-green-500/80 leading-relaxed mt-1">
                                        You will be registered as: <br />
                                        <span className="font-bold text-green-300">
                                            {inviteData.admin_type === 'central_admin'
                                                ? 'Central Admin'
                                                : `City Admin for ${inviteData.city_name || 'Assigned City'}`}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Full Name</Label>
                            <Input
                                id="fullName"
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                autoComplete="name"
                                disabled={!!inviteData || loading}
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 h-11 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@municipality.gov"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled={!!inviteData || loading}
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 h-11 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="8+ characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={!!inviteData || loading}
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 h-11 text-white"
                            />
                            {password && !inviteData && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-[10px] items-center">
                                        <span className="text-gray-500 font-bold uppercase tracking-widest">Strength</span>
                                        <span className={
                                            strength <= 25 ? "text-red-400" :
                                                strength <= 50 ? "text-orange-400" :
                                                    strength <= 75 ? "text-yellow-400" : "text-green-400"
                                        }>
                                            {strength <= 25 ? "Weak" :
                                                strength <= 50 ? "Fair" :
                                                    strength <= 75 ? "Good" : "Strong"}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${strength <= 25 ? "bg-red-500" :
                                                strength <= 50 ? "bg-orange-500" :
                                                    strength <= 75 ? "bg-yellow-500" : "bg-green-500"
                                                }`}
                                            style={{ width: `${strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={!!inviteData || loading}
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 h-11 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="inviteCode" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Invite Code</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={14} className="text-gray-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-950 border-gray-800 text-xs text-gray-300 max-w-[200px] p-2">
                                            Your invite code was provided by your system administrator or the VAYU central team
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                id="inviteCode"
                                type="text"
                                placeholder="ENTER CODE"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.trim().toUpperCase())}
                                required
                                disabled={!!inviteData || loading}
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 h-11 uppercase tracking-widest font-mono text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            className={`w-full font-bold h-11 mt-6 transition-all shadow-lg active:scale-[0.98] ${inviteData
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-green-950/20"
                                : "bg-cyan-500 hover:bg-cyan-600 text-[#0A1628] shadow-cyan-950/20"
                                }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                inviteData ? 'Confirm & Create Account' : 'Create Admin Account'
                            )}
                        </Button>

                        {inviteData && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-xs text-gray-500 hover:text-gray-300 mt-2"
                                onClick={() => setInviteData(null)}
                                disabled={loading}
                            >
                                Edit Details
                            </Button>
                        )}
                    </form>
                </CardContent>
                <div className="p-6 pt-0 flex flex-col items-center space-y-4">
                    <p className="text-xs text-gray-500 text-center">
                        Already have an account? <br />
                        <Link href="/login" className="text-cyan-500 hover:text-cyan-400 font-semibold mt-1 inline-block">
                            → Log in to your administrator portal
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
