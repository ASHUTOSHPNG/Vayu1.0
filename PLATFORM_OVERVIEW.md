# AirSense Platform Overview

## Read This First (Non-Technical Overview)

This section is written for people who are not from a technical background. It explains:
- what problem AirSense is solving,
- what we are offering to the public and to city teams,
- and how the platform solves the problem in everyday terms.

If you are a technical reader, you can continue to the architecture sections below.

## The Problem We Are Solving

Air pollution data usually has three big gaps:

1. Information is hard to understand.
- Most people only see a number (for example AQI 180), but they do not know what it means for their family today.
- People need simple answers: Is it safe to go outside? Should children avoid sports? Is a mask needed?

2. Information is not local enough.
- Air quality changes from neighborhood to neighborhood.
- One city-level average cannot represent what is happening in each ward.
- Citizens and municipal teams need hyper-local visibility.

3. Information is not actionable.
- Even when bad air is detected, there is often no direct guidance on what to do next.
- City teams need help identifying likely causes (traffic, dust, biomass burning, industry) and need practical response recommendations.

AirSense is designed to close these gaps by turning raw environmental signals into understandable, local, and actionable intelligence.

## What We Are Offering

AirSense offers two connected products in one platform.

### A. Citizen Experience

For everyday users, we offer:
- Local AQI visibility with location detection and search.
- Easy-to-read pollutant cards (PM2.5, PM10, NO2, and others).
- Health guidance in plain language based on current conditions.
- Fire/smoke context where relevant, so people understand when external smoke events may be affecting their area.
- A clean, mobile-friendly interface designed for quick decisions.

In short: we help people understand "What is the air like where I am right now, and what should I do?"

### B. City and Central Administration Experience

For administrative and policy teams, we offer:
- A monitoring dashboard for city-level and ward-level conditions.
- Alert views for severe readings and anomaly situations.
- Source attribution support (likely source categories behind spikes).
- AI-assisted recommendation generation for response planning.
- Role-based access so city admins and central admins see the right data scope.

In short: we help institutions answer "Where is the problem, what is likely causing it, and what should we do first?"

## How We Solve the Problem (Plain-Language Flow)

AirSense works like a multi-layer decision support system.

### Step 1: Collect environmental signals

The platform gathers data from trusted public and satellite-oriented sources (for AQI, weather, geocoding, and fire activity), then combines these with database-stored city and ward context.

What this means in simple terms:
- we do not rely on a single source,
- we cross-check and combine data to improve reliability,
- and we keep historical records so trends and anomalies can be identified.

### Step 2: Convert data into local context

Raw numbers are translated into location-aware context:
- city and ward mapping,
- pollutant-specific values,
- environmental conditions like wind direction and humidity,
- and risk context (for example nearby upwind fires).

This is important because one "bad AQI" number is not enough. People need local interpretation.

### Step 3: Identify possible cause patterns

The platform applies source-detection logic to estimate likely contributors such as:
- traffic,
- construction dust,
- biomass burning,
- industrial activity,
- or unknown/mixed patterns.

This helps turn "what happened" into "why it may be happening."

### Step 4: Generate recommendations

When severe or unusual conditions are detected, the system can generate recommendation outputs for administration teams.

These recommendations are meant to provide:
- immediate actions,
- medium-term actions,
- public advisory language,
- and monitoring suggestions.

So, instead of only detecting a problem, AirSense helps teams respond.

### Step 5: Deliver understandable experiences

The platform presents the information differently for each audience:
- citizens see clear and simple guidance,
- administrators see deeper monitoring and action views.

This dual-design approach ensures that both public safety communication and operational decision-making are supported.

## What Makes AirSense Valuable

1. It is decision-focused, not data-dump focused.
- Many tools stop at "showing readings."
- AirSense focuses on "understanding + response."

2. It supports both people and institutions.
- A single platform serves citizen awareness and government action.

3. It combines multiple perspectives.
- Air quality signals, weather context, fire context, trend logic, and response guidance are brought together.

4. It is built for local reality.
- Ward-level and city-level views support real municipal workflows.

5. It scales from day-to-day checks to incident conditions.
- Citizens can quickly check air quality at any time.
- Admin teams can investigate spikes and plan interventions.

## Real-World Usage Scenarios

### Scenario 1: Citizen morning check

A user opens AirSense before leaving home.
- AirSense detects location and fetches current AQI.
- The user sees pollutant levels and a health advisory.
- If smoke risk is elevated, the user sees extra caution context.

Outcome: fast, clear personal decision support.

### Scenario 2: City AQI spike

A ward experiences unusual AQI increase.
- The dashboard highlights the ward and anomaly score.
- Source detection suggests likely contributors.
- Recommendation output suggests immediate and short-term actions.

Outcome: faster administrative prioritization and response.

### Scenario 3: Regional fire influence

Satellite fire hotspots indicate potential upwind smoke impact.
- Fire risk is associated with affected areas.
- Admin teams can correlate AQI and smoke context.
- Citizens receive clearer explanation of likely cause.

Outcome: better situational awareness during complex events.

## Trust, Responsibility, and Limits

AirSense is a decision-support platform, not a medical device and not an enforcement authority.

Important interpretation principles:
- Values and classifications support awareness and planning.
- Recommendations are guidance outputs that should be reviewed by responsible authorities.
- In rapidly changing conditions, users should combine platform insights with official local advisories.

## How to Read the Rest of This Document

The sections below explain the implementation and architecture in detail:
- frontend structure,
- API routes,
- service integrations,
- data model,
- realtime and operations.

Use the rest of the document if you need to understand exactly how the platform is built and run.

## 1. Executive Summary

AirSense is a full-stack air quality intelligence platform that serves two primary audiences:
- Citizens who need hyper-local AQI visibility and practical health guidance.
- Administrators (city and central) who need monitoring, anomaly detection, source attribution, and policy response workflows.

The platform is built on Next.js App Router, Supabase (Postgres + Auth + Realtime), satellite and public environmental APIs, and a layered internal service architecture for caching, source detection, and policy recommendation generation.

## 2. What the Platform Offers

### 2.1 Citizen-Facing Capabilities

Primary experience entry points:
- `app/(citizen)/page.tsx`
- `app/(citizen)/search/page.tsx`
- `app/(citizen)/health-guide/page.tsx`
- `app/(citizen)/about/page.tsx`
- `app/(citizen)/data-sources/page.tsx`

Core features delivered:
- Real-time AQI lookup by current location (GPS-first) with search fallback.
- Reverse/forward geocoding for city/ward context.
- AQI gauge visualization and pollutant-level breakdown cards.
- Context-aware health advisory messaging.
- Fire/smoke risk context using satellite fire hotspots (FIRMS).
- Forecast row UI (currently generated placeholder values in the citizen page).
- Push-notification subscription scaffold through service worker registration.

How this is implemented:
- Location and geocoding flow: `components/citizen/LocationPermissionModal.tsx`, `components/citizen/LocationSearch.tsx`, `app/api/geocode/route.ts`, `lib/api-clients/geocoding.ts`.
- AQI retrieval: `app/api/aqi/route.ts` with auto-source selection.
- Data display: `components/citizen/AQIGauge.tsx`, `components/citizen/PollutantCard.tsx`, `components/citizen/HealthAdvisory.tsx`, `components/citizen/ForecastRow.tsx`.
- Fire context: `app/api/firms/route.ts`, `lib/api-clients/firms.ts`.
- Push subscription: `lib/push-notification.ts`, service worker at `public/sw.js`.

### 2.2 Administrator-Facing Capabilities

Primary experience entry points:
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/alerts/page.tsx`
- `app/(dashboard)/ward-analysis/page.tsx`
- `app/(dashboard)/policy-hub/page.tsx`
- `app/(dashboard)/source-detection/page.tsx`

Core features delivered:
- Role-aware dashboard context for city-admin and central-admin users.
- City-wide and national AQI monitoring visualizations.
- Ward-level views and prioritization workflows.
- Anomaly score visibility and operational alerting views.
- Pollution source attribution views over recent detection windows.
- AI-assisted policy recommendation generation.
- Admin invite validation and registration workflow.

How this is implemented:
- Role/context handling: `lib/admin/useAdminContext.ts`, `store/adminStore.ts`, `lib/admin/queryHelpers.ts`.
- Auth flows: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/api/auth/validate-invite/route.ts`, `app/api/auth/complete-registration/route.ts`.
- Dashboard components: `components/dashboard/*` and map components under `components/maps/*`.
- Source detection page data model: `pollution_sources` queries from `app/(dashboard)/source-detection/page.tsx`.
- Alerts page data model: `aqi_readings` + `fire_snapshots` from `app/(dashboard)/alerts/page.tsx`.
- Policy recommendations: `app/api/recommend/route.ts`, `lib/rag/retrieval.ts`, `lib/rag/knowledgeBase.ts`.

## 3. Architecture at a Glance

```
+--------------------+      +------------------------------+
| Frontend (Next.js) | ---> | App Router APIs (route.ts)   |
| Citizen + Admin UI |      | AQI, geocode, weather, etc.  |
+--------------------+      +--------------+---------------+
                                           |
                                           v
                           +-------------------------------+
                           | Internal Service Layer         |
                           | - API clients                 |
                           | - Source detection logic      |
                           | - RAG retrieval               |
                           | - Caching / rate limiting     |
                           +---------------+---------------+
                                           |
                 +-------------------------+--------------------------+
                 v                                                    v
      +-------------------------+                        +----------------------------+
      | Supabase (Postgres)     |                        | External Integrations      |
      | Auth, RLS, Realtime     |                        | OpenAQ, FIRMS, weather,    |
      | Core tables + migrations|                        | Nominatim, Gemini          |
      +-------------------------+                        +----------------------------+
```

## 4. Frontend Architecture

### 4.1 Routing and Layout Model

App Router route groups:
- Public/citizen routes under `app/(citizen)`.
- Auth routes under `app/(auth)`.
- Protected admin routes under `app/(dashboard)`.

Shared app shell:
- Global layout and metadata: `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`.
- Global styles: `app/globals.css`.

### 4.2 UI Composition

Component domains:
- Citizen-specific UI in `components/citizen/*`.
- Admin-specific UI in `components/dashboard/*` and `components/admin/*`.
- Map-focused UI in `components/maps/*`.
- Shared primitives in `components/shared/*` and `components/ui/*`.

State and data flow:
- Local app state with Zustand (`store/aqiStore.ts`, `store/adminStore.ts`).
- Server data fetching and caching in client views using TanStack Query.
- Supabase Realtime hooks for live updates (`lib/realtime/useAQISubscription.ts`, `lib/realtime/usePolicySubscription.tsx`).

### 4.3 Access and Session Protection

Middleware protections in `middleware.ts`:
- `/dashboard/*` requires authenticated user and valid admin profile.
- `/api/cron/*` requires Bearer secret.
- `/login` and `/register` redirect authenticated users to dashboard.

Session checks:
- Additional client-side session guard logic in `lib/admin/useSessionGuard.ts`.

## 5. API Layer (Next.js Route Handlers)

### 5.1 Endpoints and Responsibilities

- `app/api/aqi/route.ts`
  - Returns AQI at coordinates.
  - Supports source mode `auto | openaq | satellite`.
  - Uses OpenAQ first and satellite fallback.
  - Adds in-memory cache and IP rate-limit check.
  - Enriches response with fire risk data when relevant.

- `app/api/geocode/route.ts`
  - Forward/reverse geocoding through Nominatim wrappers.

- `app/api/weather/route.ts`
  - Weather and dispersion context used by enrichment workflows.

- `app/api/source-detection/route.ts`
  - Pollution source classification and anomaly scoring pipeline.

- `app/api/recommend/route.ts`
  - RAG-assisted, LLM-based policy recommendation generation.
  - Persists recommendation output to `policy_recommendations`.
  - Applies per-location cooldown logic (2-hour window).

- `app/api/firms/route.ts`
  - NASA FIRMS hotspot retrieval and local risk assessment helpers.

- `app/api/interpolate/route.ts`
  - Spatial interpolation support path.

- `app/api/auth/validate-invite/route.ts`
  - Invite code validation gate for admin onboarding.

- `app/api/auth/complete-registration/route.ts`
  - Invite-backed registration completion and profile setup.

- `app/api/cron/refresh-data/route.ts`
  - Main ingestion/orchestration job endpoint.
  - Authorizes central admin or cron secret.
  - Prefetches regional fire data, processes locations, stores outputs.

- `app/api/cron/push-alerts/route.ts`
  - Protected cron endpoint scaffold for push pipeline.
  - Currently returns placeholder status.

### 5.2 API Behavior Patterns

Common architectural patterns:
- Graceful degradation and fallback outputs to preserve UX continuity.
- Explicit `try/catch` error management and JSON error payloads.
- Lightweight custom IP rate limiting (`lib/api/rateLimit.ts`).
- In-memory and LRU-based caching to reduce upstream API pressure.

## 6. Service and Integration Architecture

### 6.1 Internal Service Modules

Service layer structure in `lib/`:
- API clients:
  - `lib/api-clients/satellite.ts`
  - `lib/api-clients/firms.ts`
  - `lib/api-clients/meteorological.ts`
  - `lib/api-clients/geocoding.ts`
- ML/heuristics modules:
  - `lib/ml/sourceDetection.ts`
  - `lib/ml/spatialInterpolation.ts`
- Retrieval-augmented generation:
  - `lib/rag/knowledgeBase.ts`
  - `lib/rag/retrieval.ts`
- Cache utilities:
  - `lib/cache.ts`
- Utility helpers:
  - `lib/aqi-utils.ts`, `lib/utils/aqi.ts`, `lib/utils/aqi-scale.ts`

### 6.2 External Integrations

- OpenAQ: station-based environmental observations.
- Sentinel/Satellite feed handling through satellite client utilities.
- NASA FIRMS: fire hotspot ingestion and smoke-risk context.
- OpenStreetMap Nominatim: geocoding and reverse geocoding.
- Meteorological API integration for wind/dispersion context.
- Google Generative AI (Gemini) for policy recommendation generation.
- Supabase Auth/DB/Realtime for identity, storage, and live updates.

## 7. Data Architecture (Supabase + Postgres)

### 7.1 Core Tables and Data Domains

Key domain tables from migrations:
- `locations`: geographic entities (city/ward/landmark/custom).
- `aqi_readings`: AQI and pollutant measurements with timestamps.
- `pollution_sources`: source classification outputs and confidence.
- `policy_recommendations`: generated recommendation records.
- `user_profiles`: user role/profile metadata.
- `admin_invitations`: invite-code-based admin onboarding.
- `fire_snapshots`: periodic regional fire summaries.
- `weather_cache`: weather context caching table.
- `cron_logs`: operational run logs.
- `push_subscriptions`: browser push subscription endpoints.

Type definitions are reflected in:
- `types/database.ts`
- `types/aqi.ts`
- `types/admin.ts`
- `types/weather.ts`
- `types/geocoding.ts`

### 7.2 Migration Evolution

Migration progression under `supabase/migrations/`:
- Initial schema and enums.
- Cron/cache support tables.
- Admin role and invitation flow support.
- Fire risk and snapshot support.
- Realtime enablement for AQI-related streaming.
- Push subscription support.
- Anomaly score addition for AQI readings.

### 7.3 Security Model

Security design includes:
- Supabase Auth for identity and session.
- Row-level security policies on domain tables.
- Admin role checks at middleware and query-helper layers.
- Cron endpoint secret validation (`CRON_SECRET`).
- Per-endpoint rate limiting for selected public APIs.

## 8. Realtime and Notification Architecture

### 8.1 Realtime

Realtime channel logic:
- AQI subscription hook: `lib/realtime/useAQISubscription.ts`.
- Singleton-style global channel handling to avoid duplicate subscriptions.
- Retries and reconnect behavior for channel failures.
- Store synchronization into `useAQIStore`.

### 8.2 Push Notification Pipeline

Current implemented pieces:
- Client registration and subscription persistence in `lib/push-notification.ts`.
- Browser service worker registration via `public/sw.js`.
- Cron route for push dispatch exists but currently placeholder (`app/api/cron/push-alerts/route.ts`).

## 9. End-to-End Data Pipeline

### 9.1 Ingestion and Enrichment

Main orchestration occurs in `app/api/cron/refresh-data/route.ts`:
- Validates authorization (cron secret or central admin).
- Prefetches regional fire hotspots.
- Iterates over location inventory.
- Pulls weather context and AQI values.
- Computes adjusted AQI/dispersion context.
- Upserts readings into `aqi_readings`.
- Runs source detection and anomaly update path.
- Triggers recommendation generation on anomaly thresholds.
- Logs job status in `cron_logs`.

### 9.2 Citizen Query Path

Typical citizen request path:
1. Browser obtains GPS or fallback location.
2. Geocode API resolves contextual address/city info.
3. AQI API returns latest source-based AQI with pollutant data.
4. Optional fire risk details are fetched and rendered.
5. UI displays advisory and pollutant cards.

### 9.3 Admin Intelligence Path

Typical admin intelligence path:
1. Dashboard query fetches scoped readings (city-aware filtering).
2. Alerts and ward views prioritize high AQI/anomaly items.
3. Source-detection views summarize dominant source contributions.
4. Recommendation API produces policy actions and persists response.

## 10. Operational Tooling

Scripts in `scripts/` support:
- City-wise data seeding for multiple cities.
- Admin invitation seeding (`npm run seed:admin`).
- Data/realtime validation checks.
- Fresh-data generation for development/testing.

Deployment and environment:
- Vercel deployment configuration in `vercel.json`.
- Next.js runtime configuration in `next.config.ts`.
- Supabase project config in `supabase/config.toml`.

## 11. Architecture Strengths

Notable strengths:
- Clear persona separation (citizen vs admin) with route-group architecture.
- Rich integration stack combining environmental, meteorological, and geospatial signals.
- Strong DB-backed operational model (cron logs, snapshots, invitation flow).
- Practical resilience patterns: caching, fallback responses, and retry logic.
- Tight coupling of anomaly/source intelligence to operational recommendations.

## 12. Current Gaps and Observed Maturity Notes

Observed implementation reality based on code:
- `app/api/cron/push-alerts/route.ts` is currently scaffolded/placeholder.
- Citizen forecast UI currently uses generated placeholder values in page logic.
- README stack claims differ from current code in at least one case:
  - README mentions Next.js 15; `package.json` currently uses Next.js 16.1.6.
- Middleware currently requires bearer secret for cron routes; central-admin fallback authorization exists in the cron refresh route handler but middleware gate still applies first.

## 13. Complete Route Inventory

### 13.1 App Pages

- `app/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(citizen)/layout.tsx`
- `app/(citizen)/page.tsx`
- `app/(citizen)/about/layout.tsx`
- `app/(citizen)/about/page.tsx`
- `app/(citizen)/data-sources/page.tsx`
- `app/(citizen)/health-guide/page.tsx`
- `app/(citizen)/search/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/dashboard/settings/page.tsx`
- `app/(dashboard)/alerts/page.tsx`
- `app/(dashboard)/policy-hub/page.tsx`
- `app/(dashboard)/source-detection/page.tsx`
- `app/(dashboard)/ward-analysis/page.tsx`
- `app/test/page.tsx`

### 13.2 API Routes

- `app/api/aqi/route.ts`
- `app/api/geocode/route.ts`
- `app/api/weather/route.ts`
- `app/api/source-detection/route.ts`
- `app/api/recommend/route.ts`
- `app/api/firms/route.ts`
- `app/api/interpolate/route.ts`
- `app/api/auth/validate-invite/route.ts`
- `app/api/auth/complete-registration/route.ts`
- `app/api/cron/refresh-data/route.ts`
- `app/api/cron/push-alerts/route.ts`

## 14. Summary

AirSense is architected as a layered, data-centric platform combining citizen utility and administrative decision support. It fuses direct measurements, satellite context, weather signals, rule-based source attribution, and AI-generated policy response into a cohesive operational product. The current codebase is already broad and production-oriented in structure, with clear pathways to complete remaining feature scaffolds (notably push-alert dispatch logic and fuller consistency between docs and implementation).

## 15. Non-Technical Glossary

- AQI (Air Quality Index): A single score that indicates how clean or polluted the air is.
- PM2.5 / PM10: Tiny particles in air; smaller particles can travel deeper into lungs.
- Anomaly: A reading that looks unusually high or different compared to normal patterns.
- Source Detection: Estimating likely causes of pollution (for example traffic or dust).
- Fire Risk Context: Information showing if nearby fires may be contributing to smoke and poor air quality.
- Geocoding: Converting location names to map coordinates, or coordinates to location names.
- Realtime Updates: New readings appearing in the app soon after they are recorded.
- Recommendation Engine: System that proposes possible response actions for administrators.
- Role-Based Access: Different users see different data and controls based on permissions.
- Cron Job: A scheduled background task that runs automatically at fixed intervals.

## 16. Quick FAQ for First-Time Readers

1. Is AirSense only for technical users?
- No. The citizen experience is designed for everyday users with clear language and simple decisions.

2. Why does AirSense use multiple data sources?
- Because no single source is complete in every location and every condition. Combining sources improves reliability and coverage.

3. Can AirSense explain why pollution increased?
- It provides likely cause categories using pattern-based logic and supporting context, helping users and admins interpret spikes.

4. Does AirSense help with action planning?
- Yes. Admin workflows include alerting, source context, and recommendation outputs to support operational decisions.

5. Is this a replacement for official advisories?
- No. It is a decision-support system that should complement official government and health guidance.

6. What is the biggest benefit of AirSense?
- It transforms complex environmental data into understandable and actionable guidance for both citizens and administration teams.

## 17. Technical Architecture Approach (Detailed)

This section explains how the platform is engineered from a systems perspective and why these choices were made.

### 17.1 Architecture Principles

AirSense follows a practical set of architecture principles:
- Reliability over novelty: stable data ingestion and clear fallbacks are prioritized.
- Explainability over black-box behavior: source detection and recommendation context are stored and traceable.
- Persona-driven design: citizen workflows and admin workflows are intentionally separate.
- Progressive intelligence: simple rules, contextual data, and AI outputs are layered, not mixed blindly.
- Operational visibility: cron logs, snapshots, and structured tables make the system monitorable.

### 17.2 Layered Technical Design

The platform is organized into six operational layers.

Layer 1: Experience Layer
- Citizen interfaces for location-based AQI awareness and health guidance.
- Admin interfaces for monitoring, anomaly handling, and policy workflows.

Layer 2: API Orchestration Layer
- Route handlers provide controlled access to data and intelligence endpoints.
- API layer normalizes payloads for frontend consumption.

Layer 3: Intelligence Layer
- Source attribution logic and anomaly processing.
- RAG-backed recommendation generation for policy output.

Layer 4: Integration Layer
- External providers for AQI/weather/fire/geocoding.
- Abstraction modules to avoid provider lock-in in business logic.

Layer 5: Data Layer
- Supabase Postgres with typed tables and migration-based evolution.
- Realtime event channel for near-live UI updates.

Layer 6: Operations Layer
- Scheduled jobs for refresh and enrichment.
- Seeding scripts and verification scripts for deployment lifecycle.

### 17.3 Data Fusion Strategy

AirSense combines multiple environmental signals and treats them as complementary rather than equivalent.

How fusion is handled:
- Primary AQI path favors direct observation routes.
- Satellite and fire signals enrich interpretation when direct readings are sparse or uncertain.
- Weather vectors are used to improve contextual causality (for example wind-based smoke plausibility).
- Location intelligence aligns readings to city and ward analysis views.

Why this matters:
- Single-source systems often fail under sparse coverage.
- Fusion improves continuity, risk context quality, and explanatory depth.

### 17.4 Decision Pipeline Design

AirSense uses a staged decision pipeline:
- Detect: ingest and cache observations.
- Interpret: classify source likelihood and anomaly context.
- Recommend: generate actionable response outputs.
- Deliver: present audience-specific messages and dashboards.

This staged approach ensures that recommendations are generated from structured context instead of isolated raw values.

### 17.5 Security and Governance Approach

Security architecture combines platform-level and data-level controls:
- Authentication through managed identity sessions.
- Authorization through role-scoped routes and query filters.
- Data protection through row-level policies and endpoint checks.
- Scheduler protection through secret-protected cron endpoints.

Governance stance:
- Administrative actions are constrained by role and city scope.
- Recommendation outputs are persisted for traceability and review.
- Operational logs support post-incident analysis.

### 17.6 Scalability Approach

AirSense is designed to scale in incremental stages.

Current scale-friendly characteristics:
- Caching on high-traffic endpoints.
- Async and batched processing in refresh routines.
- Route-level separations that allow isolated optimization.
- Reusable client modules for integrations and intelligence.

Scale-up path:
- Region partitioning for ingestion workloads.
- Queue-based execution for heavy enrichment tasks.
- Materialized views for high-frequency dashboard aggregates.
- Dedicated worker tier for recommendation generation bursts.

## 18. Feasibility Assessment (Technical + Operational)

This section evaluates whether the platform can be implemented and operated effectively in real conditions.

### 18.1 Technical Feasibility

Feasibility status: High.

Reasons:
- The system uses widely adopted technologies with strong ecosystem support.
- Core capabilities are already implemented end-to-end in the repository.
- The architecture avoids hard coupling to a single provider in most flows.

Feasibility by capability:
- AQI lookup and context rendering: already viable and operational.
- Ward/city monitoring workflows: already viable with role filtering.
- Source detection and anomaly support: viable with iterative calibration.
- Recommendation generation: viable with fallback logic and cooldown safeguards.
- Push pipeline: partially feasible now; final dispatch logic completion needed.

### 18.2 Data Feasibility

Feasibility status: Medium-to-High, dependent on source consistency.

Strengths:
- Multi-source architecture reduces single-point data dependency.
- Cached and persisted records support trend continuity.

Constraints:
- External provider outages and quota policies can affect freshness.
- Spatial density of direct observations varies by location.

Mitigation strategy:
- Layered fallback paths and response annotations.
- Data quality checks in cron and monitoring scripts.
- Historical baselines to reduce overreaction to isolated spikes.

### 18.3 Operational Feasibility

Feasibility status: High for pilot and phased production.

Why:
- Operational scripts are present for setup and data checks.
- Scheduled jobs and logging provide basic run-control.
- Role model supports controlled admin onboarding.

Operational needs for broader rollout:
- Runbook for incident handling and source outage response.
- Alert thresholds tuned per region and season.
- Release checklist for migration compatibility and cron integrity.

### 18.4 Organizational Feasibility

Feasibility status: High if governance ownership is clear.

Required ownership model:
- Product/communications owner for citizen messaging standards.
- Environmental analytics owner for threshold/source rule calibration.
- Platform operations owner for uptime, ingestion cadence, and QA.

Without clear ownership, even technically sound systems lose policy impact.

## 19. Viability Assessment (Product + Delivery + Long-Term)

Viability answers: can this platform sustain value over time for users and institutions?

### 19.1 Problem-Solution Viability

Viability status: Strong.

Fit indicators:
- Citizens need localized, understandable air quality guidance daily.
- Municipal teams need actionable interpretation, not only dashboards.
- AirSense directly addresses both needs in one system.

### 19.2 Delivery Viability

Viability status: Strong with phased hardening.

Delivery enablers:
- Existing modular code structure supports incremental releases.
- Route-based APIs simplify scope isolation for teams.
- Migration-based DB management supports controlled schema evolution.

Required hardening focus:
- Complete push alert dispatch flow.
- Expand automated test coverage for critical routes.
- Add stronger observability (latency, failure-rate, and freshness metrics).

### 19.3 Economic and Program Viability

Viability status: Favorable for city-scale and multi-city scale.

Cost-efficiency drivers:
- Uses managed platform services reducing infrastructure overhead.
- Caching and cooldown controls help limit external API and AI cost spikes.
- Shared platform across citizen and admin use-cases improves ROI per feature.

Program viability conditions:
- Clear KPI framework.
- City onboarding playbook.
- Regular calibration cycles for source and recommendation quality.

### 19.4 Sustainability Viability

Long-term sustainability is supported by:
- Extensible schema and modular integration clients.
- Replaceable recommendation provider design.
- Scripted seeding/validation process for new city onboarding.

Long-term risks to manage:
- Dependency changes in external providers.
- Alert fatigue if thresholds are not tuned.
- Stakeholder trust erosion if explanations are not transparent.

## 20. Detailed Impact and Benefits

This section describes expected impact by stakeholder and by outcome category.

### 20.1 Citizen Impact

Practical day-to-day benefits:
- Faster personal decisions on outdoor activity.
- Better protection for sensitive groups (children, elderly, respiratory conditions).
- Improved understanding of pollutant context, not just a single AQI number.

Behavioral impact:
- Encourages risk-aware routines (timing, masking, exposure reduction).
- Reduces confusion during smoke or sudden pollution events.

Communication impact:
- Converts technical readings into understandable advisories.
- Builds trust through consistent, location-specific guidance.

### 20.2 Administrative Impact

Operational benefits:
- Better prioritization of wards and incidents.
- Faster triage when anomalies appear.
- More structured and consistent response planning.

Policy and governance benefits:
- Action recommendations can standardize first-response playbooks.
- Stored recommendation records support review and accountability.
- City-level and central-level role separation supports governance clarity.

Cross-team coordination benefits:
- Shared data context across monitoring and policy teams.
- Easier briefing and escalation when events span multiple wards or cities.

### 20.3 Environmental and Public Health Impact

Expected impact vectors:
- Early visibility of harmful conditions improves preventive behavior.
- Better source context can improve intervention targeting.
- Repeated use can improve public literacy around air quality risks.

Public-health relevance:
- Even modest improvements in exposure-avoidance behavior can reduce acute risk events.
- Better advisory timing can reduce high-risk outdoor exposure windows.

### 20.4 Institutional and Strategic Impact

Strategic benefits for city systems:
- Moves from reactive to informed-response workflows.
- Creates a data foundation for longer-term policy planning.
- Enables comparable performance views across jurisdictions.

Programmatic benefits:
- Supports phased digital public-health modernization.
- Can integrate with broader smart-city command workflows over time.

### 20.5 Measurement Framework (Recommended KPIs)

To validate real impact, track KPIs in five groups.

Citizen outcomes:
- Daily active users and repeat engagement rate.
- Advisory interaction rate (views/click-through).
- Location resolution success rate.

Operational outcomes:
- Time-to-detect and time-to-triage for anomalies.
- Recommendation generation turnaround time.
- High-risk event acknowledgment/closure time.

Data quality outcomes:
- Data freshness by source and by city.
- Fallback usage rate and cause distribution.
- Coverage depth by ward/city.

Reliability outcomes:
- API success rate and p95 latency.
- Cron job success rate and retry incidence.
- Realtime channel health metrics.

Governance outcomes:
- Role compliance incidents.
- Invite-to-active-admin conversion quality.
- Recommendation acceptance and implementation tracking.

## 21. Risk Register and Mitigation Strategy

Key risks and mitigations in detail:

Risk 1: Upstream data instability.
- Mitigation: multi-source fallback, source health tracking, freshness indicators.

Risk 2: Over- or under-alerting.
- Mitigation: threshold tuning by locality/season and periodic calibration reviews.

Risk 3: Recommendation quality variance.
- Mitigation: structured output schema, cooldown policy, and human review process.

Risk 4: Trust gap with non-technical users.
- Mitigation: plain-language advisory style, source transparency, and confidence communication.

Risk 5: Operational drift across cities.
- Mitigation: standardized onboarding checklist, runbooks, and periodic quality audits.

## 22. Phased Implementation and Expansion Path

Recommended phased plan for broader deployment:

Phase 1: Stabilize and baseline.
- Finalize push dispatch logic.
- Implement observability dashboard.
- Lock baseline KPI definitions.

Phase 2: Quality hardening.
- Add automated regression tests for critical APIs.
- Introduce data quality scorecards.
- Improve anomaly/source calibration with city-specific tuning.

Phase 3: Program scale.
- Expand city onboarding playbook.
- Add SLA-oriented operational processes.
- Introduce advanced forecast and intervention effectiveness tracking.

Phase 4: Policy intelligence maturity.
- Add recommendation outcome feedback loop.
- Build intervention impact modeling.
- Support cross-city benchmarking and trend attribution.

## 23. Final Strategic Conclusion

AirSense is not only a dashboard system; it is a practical decision platform that connects environmental sensing, contextual interpretation, and response planning.

Why it is feasible:
- The technical foundation is implemented with production-oriented patterns.

Why it is viable:
- The platform addresses persistent user and institutional pain points with a clear value model.

Why it has impact potential:
- It improves how quickly and clearly people and city teams can understand risk and act on it.

With focused hardening in observability, push dispatch completion, and KPI-driven governance, AirSense can evolve from a strong implementation base into a high-trust, high-impact public air-quality intelligence platform.
