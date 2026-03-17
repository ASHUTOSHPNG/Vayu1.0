'use client';

import React from 'react';
import { LocalHealthAdvisory } from '@/components/citizen/LocalHealthAdvisory';
import { RiskAssessmentWidget } from '@/components/citizen/RiskAssessmentWidget';
import { PollutantEncyclopedia } from '@/components/citizen/PollutantEncyclopedia';
import { AQIScaleExplainer } from '@/components/citizen/AQIScaleExplainer';
import { MaskGuide } from '@/components/citizen/MaskGuide';
import { IAQTips } from '@/components/citizen/IAQTips';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, ShieldCheck, BookOpen, HelpCircle, Wind } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HealthGuidePage() {
    return (
        <div className="flex flex-col gap-0">
            {/* Header Section - Dark Theme */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 px-4 py-24 sm:px-6 lg:px-8 min-h-[70vh] flex items-center">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-teal-900/30 via-teal-800/20 to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-teal-500/10 to-transparent rounded-full" />
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center space-y-6">
                        <Badge className="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-bold flex items-center gap-2 mx-auto w-fit">
                            <Heart className="h-4 w-4 fill-teal-400" /> Public Health Resource
                        </Badge>
                        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                            Your Health Guide to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400">Pure Air</span>
                        </h1>
                        <p className="text-zinc-300 max-w-2xl mx-auto text-lg leading-relaxed">
                            Air quality impacts everyone differently. Learn how to protect yourself and your family with science-backed health strategies.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="max-w-6xl mx-auto space-y-4">
                    <LocalHealthAdvisory />
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="max-w-6xl mx-auto space-y-4">
                    <RiskAssessmentWidget />
                </div>
            </section>

            {/* AQI Scale Explainer - Dark Theme */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-black text-white">Measuring Impact</h2>
                        <p className="text-zinc-400 max-w-xl">Deep dive into what each AQI number really means for your daily life and planned activities.</p>
                    </div>
                    <AQIScaleExplainer />
                </div>
            </section>

            {/* Pollutant Encyclopedia - Dark Theme */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 border-t border-white/10">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shadow-lg">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-black text-white">Pollutant Encyclopedia</h2>
                        <p className="text-zinc-400 max-w-xl">Knowledge is the first line of defense. Understand the sources and specific health risks of major pollutants.</p>
                    </div>
                    <PollutantEncyclopedia />
                </div>
            </section>

            {/* Mask Guide - Dark Theme */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="max-w-6xl mx-auto space-y-4">
                    <MaskGuide />
                </div>
            </section>

            {/* IAQ Tips - Dark Theme */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="max-w-6xl mx-auto space-y-12 bg-white/5 border border-white/10 backdrop-blur-sm p-12 rounded-[3rem]">
                    <div className="text-center space-y-4 mb-8">
                        <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30">Indoor Safety</Badge>
                        <h2 className="text-4xl font-black text-white">Breathe Easy at Home</h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">Indoor air can be 5x more polluted than outdoor air. Use these strategies to create a safe sanctuary.</p>
                    </div>
                    <IAQTips />
                </div>
            </section>

            {/* FAQ Section - Dark Theme */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800 text-white flex items-center justify-center">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-black text-white">Science & Technology</h2>
                        <p className="text-zinc-400 max-w-xl">How VAYU uses next-generation technology to safeguard your health.</p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-white/10">
                                <AccordionTrigger className="text-left font-bold text-lg text-white hover:text-teal-400 transition-colors">
                                    How does VAYU detect wildfires and crop burning?
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-300 leading-relaxed text-base pt-2">
                                    We integrate directly with NASA&apos;s MODIS and VIIRS satellite instruments. Every 3 hours, our system scans for thermal hotspots within a 300km radius of your location. If upwind fires are detected, we automatically flag the predominant pollution source as &quot;Biomass Burning&quot; and escalate health alerts. This allows you to prepare for smoke plumes before they arrive.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-white/10">
                                <AccordionTrigger className="text-left font-bold text-lg text-white hover:text-teal-400 transition-colors">
                                    What is the difference between sensor AQI and satellite AQI?
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-300 leading-relaxed text-base pt-2">
                                    Sensor AQI comes from physical hardware on the ground (like VAYU nodes) measuring PM2.5 in real-time. Satellite AQI is a modeled prediction that covers areas where physical sensors aren&apos;t present. VAYU combines both to provide the most accurate possible data for your exact GPS coordinates.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Final CTA - Dark Theme */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="space-y-8">
                        <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-teal-100 opacity-50" />
                        <h2 className="text-4xl font-black text-white">Stay Informed. Stay Protected.</h2>
                        <p className="text-teal-50 max-w-lg mx-auto text-lg">
                            Enable real-time alerts to get notified when air quality drops in your area.
                        </p>
                        <div className="pt-4">
                            <Link href="/search" className="inline-flex items-center gap-2 bg-white text-teal-800 font-black px-10 py-5 rounded-3xl hover:bg-teal-50 transition-all text-xl shadow-xl hover:shadow-2xl hover:scale-105 duration-200">
                                <Wind className="w-6 h-6" />
                                Check Air Quality in Ghaziabad
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
