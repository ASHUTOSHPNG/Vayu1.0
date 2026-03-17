'use client';

import React from 'react';
import Link from 'next/link';

import {
    Wind,
    Satellite,
    BarChart2,
    Brain,
    FileText,
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Database,
    Cloud,
    CheckCircle2,
    Info,
    Flame
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CountUp from 'react-countup';


const StatPill = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => (
    <div className="flex flex-col items-center px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm transition-all hover:shadow-md hover:scale-105 hover:bg-white/15">
        <div className="text-3xl font-bold text-teal-300">
            <CountUp end={value} duration={2.5} enableScrollSpy scrollSpyOnce />
            {suffix}
        </div>
        <div className="text-sm font-medium text-teal-400/80 uppercase tracking-wider">{label}</div>
    </div>
);

const StepCard = ({ number, title, description, icon: Icon }: { number: string; title: string; description: string; icon: any }) => (
    <div className="relative flex flex-col items-center text-center px-6 py-8 md:py-0">
        <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl shadow-teal-500/20 mb-6 transition-transform hover:scale-110">
            <Icon className="h-8 w-8" />
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold border-2 border-white">
                {number}
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
);

const DataSourceCard = ({ title, description, url, icon: Icon, badge }: { title: string; description: string; url: string; icon: any; badge?: string }) => (
    <div className="flex flex-col p-6 bg-white/5 rounded-2xl border border-white/10 shadow-sm transition-all hover:shadow-xl hover:border-teal-500/30 group">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            {badge && (
                <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30">
                    {badge}
                </Badge>
            )}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 flex-grow">{description}</p>
        <a
            href={`https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
            {url} <Info className="ml-1 h-3 w-3" />
        </a>
    </div>
);

const TechChip = ({ label }: { label: string }) => (
    <span className="px-4 py-2 bg-white/10 text-zinc-300 rounded-full text-sm font-medium border border-white/20 hover:border-teal-500/50 hover:bg-teal-500/20 hover:text-teal-300 transition-all cursor-default">
        {label}
    </span>
);

export default function AboutPage() {
    return (
        <div className="flex flex-col overflow-hidden">
            {/* SECTION 1: HERO - Dark Theme */}
            <section className="relative w-full py-24 lg:py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-teal-900/30 via-teal-800/20 to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
                    <div className="mb-6 inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-sm font-semibold text-teal-300 animate-in fade-in slide-in-from-bottom-4">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Trusted Air Quality Intelligence
                    </div>
                    <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
                        VAYU: Intelligent Air Quality for India
                    </h1>
                    <p className="max-w-2xl text-lg text-zinc-300 mb-12">
                        VAYU is an open civic-tech platform that monitors air pollution in real time, identifies pollution sources using AI, and empowers city administrators with actionable policy recommendations — ward by ward.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <StatPill value={10} suffix="+" label="Cities Monitored" />
                        <StatPill value={100} suffix="%" label="Real-Time Updates" />
                        <StatPill value={50} suffix="+" label="AI-Powered Insights" />
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -z-10 translate-x-1/4 -translate-y-1/4 opacity-10">
                    <Wind className="w-96 h-96 text-teal-500" />
                </div>
            </section>

            {/* SECTION 2: THE PROBLEM - Dark Theme */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-block px-3 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">The Context</div>
                            <h2 className="text-3xl font-bold text-white md:text-4xl">India&apos;s Air Quality Crisis</h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed">
                                <p>
                                    Air pollution is one of India&apos;s most pressing public health challenges. While national monitoring networks exist, they often lack the density required for hyper-local awareness. Pollution levels can vary significantly from one street corner to the next, yet policies are often based on city-wide averages.
                                </p>
                                <p>
                                    There is a critical gap between high-level reference monitors and actual neighborhood-level exposure. Without precise data on where pollution is coming from and how it moves across a city, both citizens and administrators are left in the dark.
                                </p>
                                <p>
                                    Citizens unknowingly commute through toxic hotspots, while city officials struggle to justify localized industrial or traffic restrictions without clear evidence. This lack of actionable data prevents the implementation of effective, ward-level interventions.
                                </p>
                                <p>
                                    VAYU was born to bridge this data gap. By combining multiple data streams—from the ground, the sky, and the weather—we create a comprehensive, real-time map of urban air quality that enables data-driven governance.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-sm p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                <h4 className="text-center font-bold text-white mb-8 uppercase tracking-widest text-sm">AQI Color Scale</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: "Good", range: "0 - 50", color: "#10B981" },
                                        { label: "Moderate", range: "51 - 100", color: "#F59E0B" },
                                        { label: "Unhealthy for Sensitive Groups", range: "101 - 150", color: "#F97316" },
                                        { label: "Unhealthy", range: "151 - 200", color: "#EF4444" },
                                        { label: "Very Unhealthy", range: "201 - 300", color: "#8B5CF6" },
                                        { label: "Hazardous", range: "301 - 500+", color: "#7F1D1D" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded-lg shadow-sm" style={{ backgroundColor: item.color }} />
                                            <div className="flex-1 flex justify-between items-center pr-2">
                                                <span className="text-sm font-bold text-zinc-300">{item.label}</span>
                                                <span className="text-xs font-medium text-zinc-500">{item.range}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-8 text-center text-xs text-zinc-500 italic">
                                    The US EPA AQI scale used by VAYU
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: HOW IT WORKS - Dark Theme */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 border-y border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white md:text-4xl mb-4">How it Works</h2>
                        <p className="max-w-2xl mx-auto text-zinc-400">
                            Our end-to-end intelligence pipeline transforms raw atmospheric data into actionable civic policy.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting line (Desktop) */}
                        <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-dashed-line border-t-2 border-dashed border-teal-500/30 -z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <StepCard
                                number="1"
                                title="Data Collection"
                                icon={Satellite}
                                description="VAYU ingests real-time data from meteorological APIs and multiple satellite constellations — including Sentinel-5P for gaseous pollutants and NASA FIRMS for thermal fire detection."
                            />
                            <StepCard
                                number="2"
                                title="AQI Computation"
                                icon={BarChart2}
                                description="Raw pollutant concentrations are converted to AQI scores using the US EPA formula. A spatial interpolation algorithm (Inverse Distance Weighting) estimates AQI in areas between monitoring stations."
                            />
                            <StepCard
                                number="3"
                                title="AI Source Detection"
                                icon={Brain}
                                description="A machine learning classifier analyzes chemical fingerprints and temporal patterns to identify the likely source of pollution — traffic, construction dust, biomass burning, or industrial emissions."
                            />
                            <StepCard
                                number="4"
                                title="Policy Recommendations"
                                icon={FileText}
                                description="When anomalies are detected, a Retrieval-Augmented Generation (RAG) system powered by Google Gemini synthesizes forecasts and source data to generate structured, actionable recommendations for administrators."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: DATA SOURCES & TRANSPARENCY - Dark Theme */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white md:text-4xl mb-4">Our Data Sources</h2>
                        <p className="max-w-2xl mx-auto text-zinc-400">
                            We aggregate data from a diverse network of ground stations, satellites, and meteorological services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                        <DataSourceCard
                            title="OpenAQ Network"
                            icon={Globe}
                            description="A global, open-source air quality data platform aggregating measurements from government monitoring stations. Used for ground-truth pollutant concentrations (PM2.5, PM10, NO₂, SO₂, O₃, CO)."
                            url="openaq.org"
                        />
                        <DataSourceCard
                            title="OpenWeatherMap / Open-Meteo"
                            icon={Cloud}
                            description="Meteorological data including wind speed, wind direction, temperature, humidity, and boundary layer height. Critical for dispersion modeling and 72-hour AQI forecasting."
                            url="openweathermap.org"
                        />
                        <DataSourceCard
                            title="Copernicus Sentinel-5P"
                            icon={Satellite}
                            description="ESA's Earth observation satellite providing high-resolution NO₂ tropospheric column data and aerosol optical depth. Used to estimate AQI in areas without ground stations."
                            url="sentinel.esa.int"
                        />
                        <DataSourceCard
                            title="NASA FIRMS"
                            icon={Flame}
                            description="NASA's Fire Information for Resource Management System. Provides near real-time thermal hotspots from MODIS and VIIRS satellites to track biomass burning."
                            url="firms.modaps.eosdis.nasa.gov"
                            badge="Critical"
                        />
                        <DataSourceCard
                            title="IoT Sensor Network"
                            icon={Database}
                            description="A planned dense grid of calibrated low-cost sensors across city wards for hyper-local, ground-level measurements. Integration in progress."
                            url="roadmap.vayu.in"
                            badge="Roadmap"
                        />
                    </div>

                    <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="bg-white/10 px-6 py-4 border-b border-white/10 flex items-center gap-2">
                            <Info className="h-4 w-4 text-teal-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data Refresh Rate</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 border-b border-white/10 font-bold text-zinc-300">
                                    <tr>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4">Update Frequency</th>
                                        <th className="px-6 py-4">Coverage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 text-zinc-400">
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-white">OpenAQ</td>
                                        <td className="px-6 py-4">Every 15 minutes</td>
                                        <td className="px-6 py-4">Available stations</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-white">Meteorological</td>
                                        <td className="px-6 py-4">Every 15 minutes</td>
                                        <td className="px-6 py-4">All locations</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-white">Satellite (Sentinel-5P)</td>
                                        <td className="px-6 py-4">Daily</td>
                                        <td className="px-6 py-4">India-wide</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-white">NASA FIRMS (Thermal)</td>
                                        <td className="px-6 py-4">Every 3 hours</td>
                                        <td className="px-6 py-4">Global/National</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-white">Interpolated estimates</td>
                                        <td className="px-6 py-4">Every 15 minutes</td>
                                        <td className="px-6 py-4">Gap-filled</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 mb-6 text-center">
                            <Button asChild variant="outline" className="border-teal-500/50 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 font-bold px-8">
                                <Link href="/data-sources">
                                    Explore Detailed Methodology <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: FOR ADMINISTRATORS - Dark Theme */}
            <section className="py-24 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 text-white overflow-hidden relative">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl font-bold md:text-4xl mb-6">Designed for City Administrators</h2>
                    <p className="max-w-3xl mx-auto text-teal-50 text-lg leading-relaxed mb-10">
                        VAYU provides a secure, role-based dashboard for municipal administrators and pollution control officials. City-level admins see ward-by-ward data for their jurisdiction. For example, Ghaziabad administrators can monitor Indirapuram, Kaushambi, and Vaishali separately. Central administrators can monitor all cities across India. No manual data collection required — the platform delivers automated anomaly detection and AI-generated policy briefs directly to your dashboard.
                    </p>
                    <Button asChild size="lg" className="bg-white text-teal-800 hover:bg-teal-50 font-bold px-8 shadow-xl">
                        <a href="mailto:admin@vayu.in?subject=Admin Access Request">
                            Request Admin Access <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                    </Button>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 opacity-20 transform -rotate-12">
                    <div className="w-96 h-96 border-[40px] border-white rounded-full" />
                </div>
                <div className="absolute top-0 right-0 opacity-10">
                    <Wind className="w-80 h-80" />
                </div>
            </section>

            {/* SECTION 6: TECHNOLOGY STACK - Dark Theme */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 border-b border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-12">Built with Modern, Open Technologies</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            "Next.js", "TypeScript", "Supabase", "Mapbox GL JS",
                            "Apache Kafka (roadmap)", "Google Gemini", "Sentinel Hub",
                            "OpenAQ", "Recharts", "Tailwind CSS", "Vercel", "PostgreSQL"
                        ].map((tech) => (
                            <TechChip key={tech} label={tech} />
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 7: FAQ - Dark Theme */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white md:text-4xl mb-4">Frequently Asked Questions</h2>
                        <p className="text-zinc-400">
                            Everything you need to know about our methodology and data.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                Is VAYU data accurate?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                VAYU aggregates data from established sources like the OpenAQ network and ESA&apos;s Sentinel-5P satellite. In areas with active ground monitoring stations, accuracy is high. In interpolated zones (areas between stations), data is an AI-based estimate and should be treated as indicative rather than reference-grade.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                How is AQI calculated?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                VAYU uses the US EPA AQI formula, which computes a sub-index for each pollutant (PM2.5, PM10, NO₂, SO₂, CO, O₃) and reports the highest sub-index as the final AQI score. This is the same methodology used by CPCB India.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                Do I need to create an account to use VAYU?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                No. The citizen portal is fully public. You can check AQI for any location in India without logging in. Accounts are only required for city administrators accessing the management dashboard.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                How often is the data updated?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                AQI readings are refreshed every 15 minutes from ground station networks and meteorological APIs. Satellite-derived data updates once per day.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                My location&apos;s AQI seems incorrect. What should I do?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                If your area does not have an active ground monitoring station, VAYU uses spatial interpolation and satellite estimates, which can have higher uncertainty. You can submit a data issue by emailing <a href="mailto:feedback@vayu.in" className="text-teal-400 hover:underline">feedback@vayu.in</a>.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                Will IoT sensors be added?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                Yes. IoT ground-sensor integration is on our roadmap and will provide hyper-local, ward-level accuracy. The current platform is designed to incorporate IoT data seamlessly once deployed.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-7" className="border-white/10 px-4 transition-all hover:bg-white/5">
                            <AccordionTrigger className="text-left font-bold text-white hover:text-teal-400 no-underline py-6">
                                How does VAYU track crop burning?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-300 leading-relaxed pb-6">
                                We integrate with the NASA FIRMS (Fire Information for Resource Management System) satellite feed to detect thermal anomalies in real-time. By cross-referencing these fire hotspots with wind patterns, we can accurately determine when a pollution spike in a city like Ghaziabad is caused by stubble burning hundreds of kilometers away.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* Final CTA - Dark Theme */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-8">Ready to check your local air?</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold px-8">
                            <Link href="/search">Search Locations</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-teal-500/50 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 font-bold px-8">
                            <Link href="/health-guide">Health Guide</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
