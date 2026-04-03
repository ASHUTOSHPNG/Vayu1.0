import { UserProfile } from "./index";

export type AdminContext =
    | { type: 'central_admin'; cityFilter: null }
    | { type: 'city_admin'; cityFilter: { id: string; name: string } };

export function getAdminContext(profile: UserProfile): AdminContext | null {
    if (profile.admin_type === 'central_admin' || profile.admin_type === 'super_admin') {
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
    return null;
}

export interface PolicyRecommendation {
    id: string;
    city: string;
    state: string;
    ward: string;
    aqi_at_trigger: number;
    pollutant: string;
    anomaly_id: string;
    title: string;
    description: string;
    action_type: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    trigger: string;
    status: 'pending' | 'approved' | 'rejected';
    assigned_to: string | null;
    assigned_at: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    resolved_at: string | null;
    resolution_notes: string | null;
    ai_model: string;
    confidence_score: number;
    created_at: string;
    updated_at: string;
}