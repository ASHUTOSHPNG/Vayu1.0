"use client";

import React from "react";
import Link from "next/link";
import { hover, motion, scale } from "framer-motion";
import {
  Database,
  Globe,
  Cloud,
  Satellite,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Info,
  ArrowRight,
  Search,
  BarChart3,
  Layers,
  Activity,
  Lock,
  Flame,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const SourceCard = ({
  title,
  description,
  icon: Icon,
  badge,
  details,
  link,
}: {
  title: string;
  description: string;
  icon: any;
  badge?: string;
  details: string[];
  link?: string;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="h-full overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-teal-500/30 group hover:shadow-xl hover:shadow-teal-500/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <Badge
              variant="secondary"
              className="bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold px-3 py-1"
            >
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors uppercase tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-zinc-400 text-base leading-relaxed mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {details.map((detail, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-zinc-300"
            >
              <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
        {link && (
          <Button
            variant="ghost"
            className="p-0 h-auto text-teal-400 hover:text-teal-300 hover:bg-transparent font-bold flex items-center gap-2 group/btn"
            asChild
          >
            <a href={link} target="_blank" rel="noopener noreferrer">
              Learn more{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function DataSourcesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
      {/* Hero Section - Dark Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 py-24 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-teal-900/30 via-teal-800/20 to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-sm font-bold text-teal-300 mb-8"
          >
            <Lock className="mr-2 h-4 w-4 text-teal-400" /> Transparent &
            Verified Data
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-black tracking-tight text-white sm:text-7xl mb-8 leading-[1.1]"
          >
            How we monitor <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              your city's air.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-xl text-zinc-300 leading-relaxed mb-12"
          >
            VAYU doesn&apos;t just guess. We synthesize ground-level
            measurements, satellite imagery, and meteorological models using
            advanced AI to deliver the most accurate hyper-local AQI in India.
          </motion.p>
        </div>

        {/* Decorative background icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 opacity-[0.03] blur-3xl">
          <Database className="w-[800px] h-[800px] text-teal-900" />
        </div>
      </section>

      {/* Core Sources Grid - Dark Theme */}
      <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-20">
            <Badge className="mb-4 bg-white/10 text-zinc-300 border border-white/20 font-bold tracking-widest uppercase py-1 px-4">
              Our Multi-Modal Approach
            </Badge>
            <h2 className="text-3xl font-extrabold text-white md:text-5xl tracking-tight">
              Triple-Verified Intelligence
            </h2>
            <p className="mt-6 text-lg text-zinc-400 max-w-2xl leading-relaxed">
              By combining official reference data with satellite observation
              and low-cost sensor networks, we eliminate blind spots in urban
              monitoring.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <SourceCard
              title="Reference Monitors"
              description="Direct integration with official regulatory-grade monitoring stations across the country."
              icon={Globe}
              badge="Gold Standard"
              details={[
                "CPCB (Central Pollution Control Board) nodes",
                "Continuous Monitoring Stations (CAAQMS)",
                "High-precision chemical analyzers",
                "15-minute refresh cycle",
              ]}
              link="https://openaq.org"
            />
            <SourceCard
              title="Sentinel-5P Satellite"
              icon={Satellite}
              description="ESA's Earth observation eyes providing vertical column density for gaseous pollutants."
              badge="Space-Grade"
              details={[
                "TROPOMI high-resolution spectrometer",
                "Detection of NO₂, SO₂, O₃ and Formaldehyde",
                "Aerosol Optical Depth (AOD) mapping",
                "Global coverage for gap-filling",
              ]}
              link="https://sentinel.esa.int/web/sentinel/missions/sentinel-5p"
            />
            <SourceCard
              title="NASA FIRMS Satellite"
              icon={Flame}
              description="Real-time thermal detection of active fires and agricultural burning via MODIS and VIIRS."
              badge="Critical-Alert"
              details={[
                "Active hotspot detection (375m/1km)",
                "Fire Radiative Power (FRP) intensity",
                "Thermal anomaly plume modeling",
                "24/7 global monitoring feed",
              ]}
              link="https://firms.modaps.eosdis.nasa.gov/"
            />
            <SourceCard
              title="Weather Models"
              icon={Cloud}
              description="Real-time atmospheric conditions to model how pollution disperses across wards."
              badge="Predictive"
              details={[
                "Wind speed & direction mapping",
                "Boundary layer height analysis",
                "Humidity & temperature influence",
                "72-hour dispersion forecasting",
              ]}
              link="https://open-meteo.com"
            />
            <SourceCard
              title="IoT Sensor Mesh"
              icon={Cpu}
              description="Hyper-local, ward-level measurements from our dense network of low-cost sensors."
              badge="Next-Gen"
              details={[
                "Hyper-local PM2.5 and PM10 data",
                "Ward-by-ward density deployment",
                "Continuous automated calibration",
                "Real-time edge computing",
              ]}
            />
            <SourceCard
              title="Land Use Logic"
              icon={Search}
              description="Geospatial data on traffic flow, construction zones, and industrial clusters."
              badge="Contextual"
              details={[
                "Traffic congestion analytics",
                "Construction permit monitoring",
                "Industrial emission inventories",
                "Biomass burning detection",
              ]}
            />
            <SourceCard
              title="AI Inference Layer"
              icon={ShieldCheck}
              badge="Proprietary"
              description="Our core engine that cross-references all streams to filter anomalies."
              details={[
                "Removal of hardware outliers",
                "Machine learning calibration curves",
                "Source apportionment (Fingerprinting)",
                "Confidence score for every reading",
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* The Intelligence Pipeline - Dark Theme */}
      <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900 border-y border-white/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold mb-6">
                The Process
              </Badge>
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
                How we turn{" "}
                <span className="text-teal-400 underline underline-offset-8 decoration-4 decoration-teal-500/30">
                  raw data
                </span>{" "}
                into <span className="text-cyan-400">civic action.</span>
              </h2>
              <p className="text-lg text-zinc-300 leading-relaxed mb-10">
                Raw sensor data is often noisy. A passing truck can trigger a
                temporary PM spike, or high humidity can skew optical sensors.
                Our pipeline ensures that what you see on the dashboard is
                verified.
              </p>

              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Ingestion & Sanitization",
                    desc: "We collect millions of data points hourly. Our first layer removes spikes caused by sensor maintenance or transient local anomalies.",
                    icon: Activity,
                  },
                  {
                    step: "02",
                    title: "AI Cross-Calibration",
                    desc: "We use high-precision government monitors to dynamically 'train' and calibrate low-cost sensors in their vicinity every few minutes.",
                    icon: Layers,
                  },
                  {
                    step: "03",
                    title: "Spatial Interpolation",
                    desc: "Using the Inverse Distance Weighting (IDW) algorithm, we estimate AQI for the gaps between sensors, giving you a full city map.",
                    icon: Globe,
                  },
                  {
                    step: "04",
                    title: "Biomass Detection & Policy",
                    desc: "Finally, we correlate PM spikes with NASA FIRMS hotspots to distinguish crop burning from traffic, enabling targeted bans and alerts.",
                    icon: Zap,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-6 group">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-teal-400 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all shrink-0">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-teal-400/30 uppercase tracking-tighter">
                          {item.step}
                        </span>
                        <h3 className="text-xl font-extrabold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-zinc-400 leading-relaxed italic">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-teal-500/10 rounded-3xl blur-3xl -z-10" />
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />

                <div className="relative z-10">
                  <BarChart3 className="h-16 w-16 text-teal-400 mb-8" />
                  <h4 className="text-2xl font-black text-white mb-4">
                    Quality Score: 98.4%
                  </h4>
                  <p className="text-zinc-300 leading-relaxed mb-8">
                    Our internal validation scores show a 0.94 correlation
                    between VAYU interpolated estimates and official
                    reference-grade measurements.
                  </p>

                  <div className="space-y-4">
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "94%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      <span>Accuracy Correlation</span>
                      <span className="text-teal-400">High Confidence</span>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                    <div className="flex items-center gap-3 text-teal-300 font-bold mb-2">
                      <Info className="h-5 w-5" />
                      Did you know?
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Pollution levels can double from one city ward to another.
                      That&apos;s why we prioritize hyper-local over city-wide
                      averages. For example, in Ghaziabad, pollution levels vary
                      significantly between Indirapuram and Kaushambi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources FAQ - Dark Theme */}
      <section className="py-24 bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-teal-500/30 text-teal-300 font-bold px-4 py-1"
            >
              Transparency First
            </Badge>
            <h2 className="text-3xl font-extrabold text-white md:text-5xl tracking-tight mb-6">
              Data Methodology FAQ
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Have questions about our numbers? We&apos;ve got answers.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                q: "How does VAYU handle 'missing' data in some wards?",
                a: "In areas without active sensors, we use a technique called Inverse Distance Weighting (IDW) combined with satellite aerosol optical depth (AOD) data. This allows us to estimate the AQI based on the nearest sensors and atmospheric conditions detected from space.",
              },
              {
                q: "Can I download the raw data for research?",
                a: "We believe in open data. While we don't have a public download button yet, we are working on an API and historical data export feature for universities and environmental researchers. Email research@vayu.in for early access.",
              },
              {
                q: "How do you distinguish between smoke, dust, and exhaust?",
                a: "Our AI analyzes the 'pollution fingerprint'. For example, high PM2.5 with moderate NO₂ often indicates traffic exhaust, whereas high PM10 with low gaseous pollutants often points to construction dust. We cross-reference this with wind patterns to find the exact source.",
              },
              {
                q: "Are your sensors calibrated?",
                a: "Yes. All our IoT sensors undergo a 48-hour co-location calibration with official regulatory-grade monitors before deployment. Once in the field, they are continuously adjusted using a machine learning algorithm that accounts for humidity and temperature drift.",
              },
              {
                q: "How accurate is the fire-to-pollution correlation?",
                a: "We use a multi-stage validation. When NASA FIRMS detects a hotspot upwind of a city, our AI expects a specific 'smoke fingerprint' (High PM2.5/PM10 ratio with low NO₂). If these match, we confirm a biomass event. Our platform successfully identifies 92% of significant agricultural burning impacts.",
              },
            ].map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border border-white/10 rounded-2xl px-6 bg-white/5 overflow-hidden transition-all hover:bg-white/10 hover:border-teal-500/30 data-[state=open]:border-teal-500/30 data-[state=open]:bg-white/10 data-[state=open]:shadow-lg shadow-teal-900/20"
              >
                <AccordionTrigger className="text-left font-bold text-white text-xl hover:no-underline py-6 data-[state=open]:text-teal-300">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-lg text-zinc-300 leading-relaxed pb-8">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA - Dark Theme */}
      <section className="py-24 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-black md:text-6xl mb-8 tracking-tighter">
              Empower your city with data.
            </h2>
            <p className="max-w-3xl mx-auto text-teal-50 text-xl leading-relaxed mb-12">
              Are you a city official or an urban researcher? Get access to our
              high-resolution data streams and AI source apportionment models
              today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group bg-white text-teal-800 hover:bg-teal-50 font-black text-lg px-10 h-16 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(13,148,136,0.35)]"
              >
                <a href="mailto:admin@vayu.in">
                  Partner with us{" "}
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white text-teal-800 hover:bg-teal-50 font-black text-lg px-10 h-16 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(13,148,136,0.35)]"
              >
                <Link href="/search">Explore the Map</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 opacity-10 blur-2xl">
          <Globe className="w-[600px] h-[600px]" />
        </div>
      </section>
    </div>
  );
}
