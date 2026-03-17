import { Database } from './database';

export interface UserProfile {
    id: string;
    role: 'admin' | 'citizen' | null;
    preferred_location_id: string | null;
    notification_enabled: boolean | null;
    admin_type: 'city_admin' | 'central_admin' | null;
    assigned_city_id: string | null;
    assigned_city_name: string | null;
    is_active: boolean;
    last_login_at: string | null;
    notification_settings?: {
        anomaly_threshold: number;
        email_alerts: boolean;
        daily_summary: boolean;
    };
}

export type AdminInvitation = Database['public']['Tables']['admin_invitations']['Row'];
export type PolicyRecommendation = Database['public']['Tables']['policy_recommendations']['Row'];
