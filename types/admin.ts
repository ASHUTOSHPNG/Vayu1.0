import { UserProfile } from "./index";

export type AdminContext =
    | { type: 'central_admin'; cityFilter: null }
    | { type: 'city_admin'; cityFilter: { id: string; name: string } };

export function getAdminContext(profile: UserProfile): AdminContext | null {
    if (profile.admin_type === 'central_admin' || profile.admin_type === 'super_admin')  {
        return { type: 'central_admin', cityFilter: null };
    }
    if (profile.admin_type === 'city_admin' && (profile.assigned_city_id || profile.assigned_city_name)) {
        return {
            type: 'city_admin',
            cityFilter: {
                id: profile.assigned_city_id || 'manual',
                name: profile.assigned_city_name || 'Unknown City'
            }
        };
    }

    return null; // not an admin
}

export interface PolicyContent {
    headline: string;
    rootCauseAnalysis: string;
    immediateActions: string[];
    mediumTermActions: string[];
    citizenAdvisory: string;
    monitoringNote: string;
    regulatoryReferences: string[];
    fireCoordinates?: Array<{
        lat: number;
        lon: number;
        frpMW: number;
        distanceKm: number;
        bearingDeg?: number;
    }>;
}

export interface PolicyRecommendation {
    id: string;
    location_id: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    anomaly_summary: string;
    recommendation_text: string | PolicyContent;
    status: 'pending' | 'actioned' | 'dismissed';
    created_at: string;
    fire_coordinates?: Array<{
        lat: number;
        lon: number;
        frpMW: number;
        distanceKm: number;
        bearingDeg?: number;
    }> | null;
    locations?: {
        name: string;
        city: string;
    };
}
