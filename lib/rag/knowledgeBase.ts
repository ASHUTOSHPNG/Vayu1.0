export type KnowledgeCategory =
    | 'WHO_GUIDELINE'
    | 'MITIGATION_TRAFFIC'
    | 'MITIGATION_CONSTRUCTION'
    | 'MITIGATION_BIOMASS'
    | 'MITIGATION_INDUSTRIAL'
    | 'EMERGENCY_PROTOCOL'
    | 'HEALTH_ADVISORY';

export interface KnowledgeDocument {
    id: string;
    category: KnowledgeCategory;
    title: string;
    content: string;
    tags: string[];
}

export const knowledgeBase: KnowledgeDocument[] = [
    // WHO Guidelines
    {
        id: 'who-001',
        category: 'WHO_GUIDELINE',
        title: 'WHO PM2.5 and PM10 Annual Guidelines',
        content: 'The World Health Organization (WHO) 2021 guidelines state that annual average concentrations of PM2.5 should not exceed 5 µg/m³, and 24-hour average exposures should not exceed 15 µg/m³. For PM10, the annual average should not exceed 15 µg/m³, and the 24-hour average should not exceed 45 µg/m³.',
        tags: ['who', 'guideline', 'pm25', 'pm10', 'annual', 'daily', 'limit', 'threshold'],
    },
    {
        id: 'who-002',
        category: 'WHO_GUIDELINE',
        title: 'WHO NO2, O3, and SO2 Guidelines',
        content: 'WHO 2021 guidelines recommend that annual nitrogen dioxide (NO2) levels should not exceed 10 µg/m³, and 24-hour levels should remain below 25 µg/m³. Peak season Ozone (O3) should be < 60 µg/m³. 24-hour Sulfur Dioxide (SO2) limits are set to 40 µg/m³.',
        tags: ['who', 'guideline', 'no2', 'o3', 'so2', 'limit', 'threshold', 'nitrogen', 'ozone', 'sulfur'],
    },

    // Traffic Mitigation
    {
        id: 'mit-traf-001',
        category: 'MITIGATION_TRAFFIC',
        title: 'Odd-Even Vehicle Rationing Scheme',
        content: 'Implement an odd-even license plate rationing system during peak pollution episodes. Vehicles with registration numbers ending in odd digits are allowed on specific days, and even digits on alternate days. This can acutely drop traffic-related NO2 and CO emissions by up to 15%.',
        tags: ['traffic', 'mitigation', 'no2', 'co', 'cars', 'vehicles', 'rationing', 'odd-even'],
    },
    {
        id: 'mit-traf-002',
        category: 'MITIGATION_TRAFFIC',
        title: 'Congestion Pricing and Park-and-Ride',
        content: 'Enforce congestion toll pricing in city centers to discourage private vehicle usage. Couple this with subsidized "Park-and-Ride" facilities at transit hubs on the city outskirts to promote public transportation usage over heavy city driving.',
        tags: ['traffic', 'mitigation', 'congestion', 'pricing', 'tolls', 'public transit', 'parking'],
    },
    {
        id: 'mit-traf-003',
        category: 'MITIGATION_TRAFFIC',
        title: 'Traffic Signal Synchronization',
        content: 'Synchronize traffic lights across primary arterial roads to reduce start-stop driving patterns. Idling and accelerations account for massive spikes in localized NO2 and PM. Green wave synchronization reduces total trip time and emissions.',
        tags: ['traffic', 'mitigation', 'no2', 'signals', 'idling', 'optimization', 'flow'],
    },

    // Construction Mitigation
    {
        id: 'mit-con-001',
        category: 'MITIGATION_CONSTRUCTION',
        title: 'Mandatory Dust Suppression via Water Sprinkling',
        content: 'Construction sites must deploy anti-smog guns and conduct regular water sprinkling (using treated wastewater where possible) on unpaved surfaces and debris piles. This directly reduces fugitive PM10 dust clouds.',
        tags: ['construction', 'dust', 'pm10', 'water', 'sprinkling', 'suppression', 'mitigation'],
    },
    {
        id: 'mit-con-002',
        category: 'MITIGATION_CONSTRUCTION',
        title: 'Site Enclosures and Green Netting',
        content: 'Mandate comprehensive perimeter shielding utilizing green shade netting (minimum 10 meters high) around all active excavation and building sites to contain wind-blown dust particles.',
        tags: ['construction', 'dust', 'pm10', 'wind', 'netting', 'enclosure', 'mitigation'],
    },
    {
        id: 'mit-con-003',
        category: 'MITIGATION_CONSTRUCTION',
        title: 'Wheel Wash Stations at Site Exits',
        content: 'Require the installation and use of vehicle wheel-washing facilities at all exits of heavy construction sites. This prevents transport trucks from tracking mud and dust onto public paved roads where it is resuspended by traffic.',
        tags: ['construction', 'dust', 'pm10', 'trucks', 'washing', 'roads', 'mitigation'],
    },
    {
        id: 'mit-con-004',
        category: 'MITIGATION_CONSTRUCTION',
        title: 'Halt Excavation During High Winds',
        content: 'Immediately suspend all deep excavation, demolition, and dry aggregate mixing activities when local sustained wind speeds exceed 20 km/h or during existing "Very Unhealthy" AQI episodes.',
        tags: ['construction', 'dust', 'pm10', 'wind', 'weather', 'halt', 'mitigation'],
    },

    // Biomass Mitigation
    {
        id: 'mit-bio-001',
        category: 'MITIGATION_BIOMASS',
        title: 'Subsidized Stubble Management Machinery',
        content: 'Provide financial subsidies to farming cooperatives for in-situ crop residue management machinery like the "Happy Seeder" or Super SMS (Straw Management System) to eliminate the need for agricultural stubble burning.',
        tags: ['biomass', 'burning', 'pm25', 'agriculture', 'stubble', 'machinery', 'subsidy'],
    },
    {
        id: 'mit-bio-002',
        category: 'MITIGATION_BIOMASS',
        title: 'Bio-decomposer Spraying Programs',
        content: 'Distribute and apply microbial bio-decomposer solutions across harvested fields. These solutions accelerate the decomposition of paddy stubble into fertilizer, reducing the incentive to burn crop waste during October-November.',
        tags: ['biomass', 'burning', 'pm25', 'agriculture', 'stubble', 'decomposer', 'microbial'],
    },

    // Industrial Mitigation
    {
        id: 'mit-ind-001',
        category: 'MITIGATION_INDUSTRIAL',
        title: 'Mandatory Real-Time Stack Monitoring (OCEMS)',
        content: 'Require all heavy industries (thermal plants, brick kilns, steel production) to install Online Continuous Emission Monitoring Systems (OCEMS) directly linking real-time SO2, NO2, and PM output data to the central pollution control board.',
        tags: ['industrial', 'so2', 'no2', 'pm', 'stack', 'monitoring', 'emissions', 'ocems'],
    },
    {
        id: 'mit-ind-002',
        category: 'MITIGATION_INDUSTRIAL',
        title: 'Fuel Restrictions in Industrial Zones',
        content: 'Ban the use of unapproved, high-sulfur fuels such as petcoke and furnace oil within critical city limits. Mandate a transition to Piped Natural Gas (PNG) or cleaner electric alternatives for all localized industrial operations.',
        tags: ['industrial', 'so2', 'fuel', 'petcoke', 'png', 'gas', 'ban', 'mitigation'],
    },

    // Emergency Protocol
    {
        id: 'emg-pro-001',
        category: 'EMERGENCY_PROTOCOL',
        title: 'Graded Response Action Plan (GRAP) Implementation',
        content: 'When AQI crosses into "Severe" (>400) or "Hazardous", initialize GRAP Stage IV: Halting all non-essential commercial construction, shutting down physical classes in schools, pivoting government/private offices to 50% work-from-home, and banning diesel trucks from entering city limits.',
        tags: ['emergency', 'protocol', 'grap', 'severe', 'hazardous', 'schools', 'trucks', 'wfh', 'shutdown'],
    },

    // Health Advisory
    {
        id: 'hlt-adv-001',
        category: 'HEALTH_ADVISORY',
        title: 'Vulnerable Population and Mask Guidelines',
        content: 'During "Very Unhealthy" or worse AQI days, infants, the elderly, and those with Asthma or COPD must remain indoors. If outdoor travel is unavoidable, NIOSH-approved N95 or N99 particulate respirators must be worn. Standard surgical or cloth masks offer virtually zero protection against PM2.5.',
        tags: ['health', 'advisory', 'pm25', 'masks', 'n95', 'asthma', 'copd', 'elderly', 'children', 'indoors'],
    },
    {
        id: 'mit-bio-003',
        category: 'MITIGATION_BIOMASS',
        title: 'Response Protocol for Satellite-Confirmed Fire Events',
        content: 'When NASA FIRMS satellite data confirms active upwind fires: 1. IMMEDIATE (0–6 hours): Issue health advisory for affected wards. Activate GRAP Stage II/III protocols if AQI > 200. Alert district administration with precise fire coordinates for ground verification. 2. SHORT-TERM (6–48 hours): Coordinate with State Pollution Control Board to issue notices under Section 19 of the Air Act 1981 to responsible parties. If fire is on agricultural land, engage with district agriculture officer for stubble management alternatives (bio-decomposer, Happy Seeder). 3. COMMUNICATION: Share fire location data (lat/lon from FIRMS) with State Fire Services and Revenue Department for ground action. 4. MONITORING: Increase AQI monitoring frequency to every 5 minutes. Track smoke plume movement using wind forecast data.',
        tags: ['biomass_burning', 'fire_satellite_confirmed', 'emergency'],
    },
    {
        id: 'mit-bio-004',
        category: 'MITIGATION_BIOMASS',
        title: 'Crop Residue Burning — Regulatory Framework India',
        content: 'Legal framework: Burning of agricultural residue is prohibited under NGT Order (2015), amended Air Quality Management Commission (AQMC) directions for NCR and adjoining areas. Penalties: Rs. 2,500 (< 2 acres), Rs. 5,000 (2–5 acres), Rs. 15,000 (> 5 acres). Alternatives: Bio-decomposer spray (subsidized by state govts), Paddy Straw Management Scheme, in-situ incorporation via rotavator. Contact: AQMC helpline 14422 for NCR region.',
        tags: ['biomass_burning', 'crop_burning', 'north_india', 'seasonal'],
    },
];
