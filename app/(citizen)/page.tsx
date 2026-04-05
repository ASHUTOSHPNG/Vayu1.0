'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Wind, 
    MapPin, 
    Shield, 
    Brain, 
    Building2, 
    Users, 
    Eye, 
    Zap, 
    Leaf,
    Activity,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Globe,
    Gauge,
    MessageSquare,
    Sun,
    Cloud
} from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

function AnimatedParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            type: 'smog' | 'clean' | 'wind';
            drift: number;
            rotation: number;
            rotationSpeed: number;
        }> = [];
        
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 0.8 - 0.2,
                size: Math.random() * 80 + 20,
                opacity: Math.random() * 0.12 + 0.03,
                type: Math.random() > 0.4 ? 'smog' : Math.random() > 0.5 ? 'clean' : 'wind',
                drift: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02
            });
        }
        
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.random() * 1 + 0.5,
                vy: 0,
                size: Math.random() * 4 + 2,
                opacity: Math.random() * 0.3 + 0.1,
                type: 'wind',
                drift: Math.random() * Math.PI * 2,
                rotation: 0,
                rotationSpeed: 0
            });
        }
        
        let animationId: number;
        let time = 0;
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.01;
            
            particles.forEach((p, i) => {
                p.x += p.vx + Math.sin(time + p.drift) * 0.3;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                
                if (p.y < -100) {
                    p.y = canvas.height + 100;
                    p.x = Math.random() * canvas.width;
                    p.type = Math.random() > 0.4 ? 'smog' : Math.random() > 0.5 ? 'clean' : 'wind';
                }
                if (p.x > canvas.width + 100) p.x = -100;
                if (p.x < -100) p.x = canvas.width + 100;
                
                if (p.type === 'smog') {
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, `rgba(100, 95, 85, ${p.opacity})`);
                    gradient.addColorStop(0.5, `rgba(70, 65, 60, ${p.opacity * 0.5})`);
                    gradient.addColorStop(1, 'rgba(50, 45, 40, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'clean') {
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, `rgba(200, 240, 255, ${p.opacity * 1.5})`);
                    gradient.addColorStop(0.5, `rgba(150, 220, 255, ${p.opacity * 0.8})`);
                    gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'wind') {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.lineWidth = p.size * 0.3;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.size * 3, p.y);
                    ctx.stroke();
                }
            });
            
            animationId = requestAnimationFrame(animate);
        };
        
        animate();
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function LandingPage() {
    return (
        <div className="flex flex-col gap-0">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 px-4 py-24 sm:px-6 lg:px-8 min-h-[90vh] flex items-center">
                {/* Animated Pollution/Clean Air Background */}
                <AnimatedParticles />
                
                {/* Clean air transformation glow */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-teal-900/30 via-teal-800/20 to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-teal-500/10 to-transparent rounded-full" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIjxnPjxwYXRoIGQ9Ik0yMCAyMGMtNi42MjcgMC0xMi01LjM3My0xMi0xMnM1LjM3My0xMiAxMi0xMiAxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMnptMCAMjBjLTQuNDE0MC0wLTgtMy41ODYtOC04czMuNTg2LTggOC04IDggMy41ODYgOCA4LTMuNTg2IDggOCA4eiIgZmlsbD0iIzQwZmYzMCIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
                </div>
                
                {/* Clean sky hint at top */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-teal-950/40 to-transparent" />

                <div className="container relative z-10 mx-auto max-w-6xl">
                    <motion.div 
                        className="text-center"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            Real-time Air Quality Intelligence
                        </motion.div>

                        <motion.h1 
                            variants={fadeInUp}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6"
                        >
                            Breathe Cleaner{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400">
                                Air Today
                            </span>
                        </motion.h1>

                        <motion.p 
                            variants={fadeInUp}
                            className="mx-auto max-w-2xl text-xl text-zinc-300 leading-relaxed mb-10"
                        >
                            VAYU transforms complex environmental data into clear, actionable insights. 
                            See the pollution in your area and take control of the air you breathe.
                        </motion.p>

                        <motion.div 
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link 
                                href="/search" 
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5"
                            >
                                <MapPin className="w-5 h-5" />
                                Check Your Air
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                href="#features" 
                                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-600 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                            >
                                See How It Works
                            </Link>
                        </motion.div>

                        <motion.div 
                            variants={fadeInUp}
                            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-zinc-400"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                <span className="text-sm">Hyper-local Accuracy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                <span className="text-sm">AI-Powered Insights</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                <span className="text-sm">Real-time Data</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-zinc-500 flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-zinc-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Problem Section */}
            <section id="problem" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto max-w-6xl">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium mb-4 border border-red-500/30">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            The Problem
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
                            Air Quality Data is Broken
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                            Current air quality information suffers from three critical gaps that prevent people from making informed decisions.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Gauge,
                                title: "Hard to Understand",
                                description: "Most people only see a number like AQI 180, but they don't know what it means for their family today. Is it safe to go outside? Should children avoid sports?",
                                color: "red"
                            },
                            {
                                icon: MapPin,
                                title: "Not Local Enough",
                                description: "Air quality changes from neighborhood to neighborhood. One city-level average cannot represent what's happening in each ward or colony.",
                                color: "orange"
                            },
                            {
                                icon: MessageSquare,
                                title: "Not Actionable",
                                description: "Even when bad air is detected, there's often no direct guidance on what to do next. People need practical recommendations, not just numbers.",
                                color: "amber"
                            }
                        ].map((problem, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                                    problem.color === 'red' ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-400' :
                                    problem.color === 'orange' ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 text-orange-400' :
                                    'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400'
                                } border border-white/10`}>
                                    <problem.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{problem.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="solution" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto max-w-6xl">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-sm font-medium mb-4 border border-teal-500/30">
                            <span className="w-2 h-2 rounded-full bg-teal-400" />
                            The Solution
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
                            VAYU Closes the Gaps
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                            We turn raw environmental signals into understandable, local, and actionable intelligence for everyone.
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {[
                            {
                                step: "01",
                                title: "Multi-Source Data Collection",
                                description: "We gather data from trusted public and satellite sources—OpenAQ, NASA FIRMS, weather services—and combine them with local context. No single source dependency, always cross-checked.",
                                icon: Globe
                            },
                            {
                                step: "02", 
                                title: "Local Context Translation",
                                description: "Raw numbers become location-aware insights. City and ward mapping, pollutant-specific values, wind and humidity context, and nearby fire risk—all personalized to your location.",
                                icon: MapPin
                            },
                            {
                                step: "03",
                                title: "Source Attribution",
                                description: "Our intelligent system estimates likely pollution contributors—traffic, construction dust, biomass burning, industrial activity—so you know why air quality changed.",
                                icon: Brain
                            },
                            {
                                step: "04",
                                title: "Actionable Recommendations",
                                description: "When severe conditions are detected, we generate clear guidance: immediate actions, medium-term suggestions, and public advisory language. We don&apos;t just detect problems—we help you respond.",
                                icon: Shield
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-teal-500/20 transition-all duration-300`}
                            >
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <span className="text-sm font-bold text-teal-400 tracking-wider">{item.step}</span>
                                    <h3 className="text-2xl font-bold text-white mt-1 mb-3">{item.title}</h3>
                                    <p className="text-zinc-300 leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto max-w-6xl">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-300 text-sm font-medium mb-4 border border-zinc-700/50">
                            <span className="w-2 h-2 rounded-full bg-teal-400" />
                            Features
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
                            Built for Everyone
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                            One platform, two powerful experiences—tailored for citizens and city administrators.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Citizen Features */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-teal-500/20 transition-all duration-300 group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-500" />
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                        <Users className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">For Citizens</h3>
                                        <p className="text-zinc-400 text-sm">Daily air quality for everyone</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { icon: MapPin, title: "Hyper-Local AQI", desc: "Get air quality for your exact neighborhood, not just city average" },
                                        { icon: Gauge, title: "Pollutant Breakdown", desc: "Detailed readings for PM2.5, PM10, NO2, O3, CO, SO2" },
                                        { icon: Shield, title: "Health Guidance", desc: "Plain-language advisories: is it safe to go outside?" },
                                        { icon: Leaf, title: "Fire Context", desc: "Know when nearby fires might be affecting your air" },
                                        { icon: Activity, title: "Forecast View", desc: "Plan your day with predicted air quality trends" },
                                        { icon: Wind, title: "GPS + Search", desc: "Auto-detect location or search any city instantly" }
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-teal-500/20 transition-all duration-300 group/card">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover/card:bg-teal-500/20 transition-colors">
                                                <feature.icon className="w-5 h-5 text-teal-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white group-hover/card:text-teal-300 transition-colors">{feature.title}</h4>
                                                <p className="text-sm text-zinc-400">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link 
                                    href="/search" 
                                    className="mt-8 inline-flex items-center gap-2 text-teal-400 font-semibold hover:gap-3 transition-all group/link"
                                >
                                    Try it now <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Admin Features */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-500/20 transition-all duration-300 group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                        <Building2 className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">For Administrators</h3>
                                        <p className="text-zinc-400 text-sm">City-level monitoring & response</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { icon: Eye, title: "City & Ward Dashboards", desc: "Monitor conditions across the entire city and drill down to wards" },
                                        { icon: Zap, title: "Anomaly Detection", desc: "Automatically highlight unusual pollution spikes" },
                                        { icon: Brain, title: "Source Attribution", desc: "Identify likely causes: traffic, dust, biomass, industry" },
                                        { icon: Shield, title: "AI Recommendations", desc: "Get intelligent response suggestions powered by AI" },
                                        { icon: Users, title: "Role-Based Access", desc: "City admin vs central admin with appropriate data scope" },
                                        { icon: Globe, title: "Fire Integration", desc: "NASA FIRMS satellite data for regional fire monitoring" }
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/20 transition-all duration-300 group/card">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover/card:bg-cyan-500/20 transition-colors">
                                                <feature.icon className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white group-hover/card:text-cyan-300 transition-colors">{feature.title}</h4>
                                                <p className="text-sm text-zinc-400">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link 
                                    href="/dashboard" 
                                    className="mt-8 inline-flex items-center gap-2 text-cyan-400 font-semibold hover:gap-3 transition-all group/link"
                                >
                                    Access Dashboard <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Tech Stack / Data Sources */}
            <section id="sources" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto max-w-6xl">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-300 text-sm font-medium mb-4 border border-zinc-700/50">
                            <span className="w-2 h-2 rounded-full bg-zinc-400" />
                            Trusted Data Sources
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
                            Powered by Industry Leaders
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                            We combine multiple authoritative data sources to ensure the most accurate, reliable air quality information.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "OpenAQ", desc: "Global air quality data" },
                            { name: "NASA FIRMS", desc: "Fire hotspot detection" },
                            { name: "Sentinel Hub", desc: "Satellite imagery" },
                            { name: "OpenStreetMap", desc: "Geocoding services" },
                            { name: "Supabase", desc: "Real-time database" },
                            { name: "Next.js", desc: "Frontend framework" },
                            { name: "Gemini AI", desc: "Intelligence layer" },
                            { name: "Mapbox", desc: "Visualization maps" }
                        ].map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1 transition-all text-center group"
                            >
                                <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors">{tech.name}</h4>
                                <p className="text-sm text-zinc-400 mt-1">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
                </div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 backdrop-blur-sm">
                            <Wind className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-6">
                            Ready to Breathe Smarter?
                        </h2>
                        <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of citizens and city administrators who trust VAYU for real-time air quality intelligence.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/search" 
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-800 font-bold rounded-xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 duration-300"
                            >
                                <Wind className="w-5 h-5" />
                                Check Your Air Quality
                            </Link>
                            <Link 
                                href="/about" 
                                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-700/30 text-white font-semibold rounded-xl hover:bg-teal-700/50 border border-teal-400/30 backdrop-blur-sm transition-all hover:-translate-y-1 duration-300"
                            >
                                Learn More
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA for Admins */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-teal-500/20 transition-all duration-300"
                    >
                        <Building2 className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">
                            For City Administrators
                        </h3>
                        <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                            Monitor your city's air quality, detect anomalies, and generate AI-powered response recommendations.
                        </p>
                        <Link 
                            href="/dashboard" 
                            className="inline-flex items-center gap-2 text-teal-400 font-bold hover:text-teal-300 hover:gap-3 transition-all group"
                        >
                            Access Admin Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}