import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About VAYU | How It Works, Data Sources & Team",
    description: "Learn how VAYU monitors air quality across Indian cities using satellite data, meteorological APIs, and AI-powered source detection to generate actionable policy recommendations.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
