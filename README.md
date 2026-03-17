# 🌬️ AirSense

AirSense is a modern, high-performance Air Quality Index (AQI) monitoring platform designed to provide real-time, actionable insights to both citizens and city administrators. 

Built with **Next.js 15**, **Supabase**, and **Tailwind CSS**, AirSense delivers a premium, data-driven experience with beautiful visualizations and a responsive interface.

## 🚀 Key Features

### 👤 For Citizens
- **Real-time AQI Tracking**: Interactive maps and dashboards showing current air quality data.
- **GPS-First Experience**: Seamlessly find AQI data for your current location with automatic geocoding.
- **Smart Search**: Quickly find air quality information for any city or area.
- **Personalized Health Guides**: Hyper-local health advisories based on current AQI conditions and location.
- **Historical Analysis**: View trends and patterns over time with interactive charts.

### 🛠️ For Administrators
- **Role-Based Access Control**: Secure portals for Super Admins and City Admins.
- **City-Specific Dashboards**: Tailored views for city administrators to monitor local metrics.
- **NASA FIRMS Integration**: Real-time fire and biomass burning detection to correlate with pollution spikes.
- **Sentinel Hub Integration**: Satellite imagery for environmental monitoring.
- **Data Management**: Tools for manual data refresh and system monitoring.
- **Invite System**: Secure onboarding for new administrators via unique invite codes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Satellite Data**: [Sentinel Hub](https://www.sentinel-hub.com/) & [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Mapbox GL JS](https://www.mapbox.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏗️ Project Structure

```text
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication flows (Login/Register)
│   ├── (citizen)/        # Citizen portal pages
│   ├── (dashboard)/      # Admin dashboard pages
│   └── api/              # Backend API routes
├── components/           # Reusable UI components
│   ├── citizen/          # Citizen-specific components
│   ├── dashboard/        # Admin-specific components
│   ├── maps/             # Mapbox integrations
│   ├── shared/           # Common UI elements
│   └── ui/               # Base shadcn/ui components
├── lib/                  # Utility functions and shared logic
├── store/                # Zustand client-state stores
├── types/                # TypeScript definitions
├── scripts/              # Data seeding and maintenance scripts
└── supabase/             # Database migrations and configuration
```

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase project
- A Mapbox API key
- (Optional) NASA FIRMS API key for fire data

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
