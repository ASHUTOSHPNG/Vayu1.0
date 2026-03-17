export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            locations: {
                Row: {
                    id: string
                    name: string
                    city: string
                    state: string | null
                    country: string
                    latitude: number
                    longitude: number
                    ward_id: string | null
                    type: Database['public']['Enums']['location_type'] | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    city: string
                    state?: string | null
                    country?: string
                    latitude: number
                    longitude: number
                    ward_id?: string | null
                    type?: Database['public']['Enums']['location_type'] | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    city?: string
                    state?: string | null
                    country?: string
                    latitude?: number
                    longitude?: number
                    ward_id?: string | null
                    type?: Database['public']['Enums']['location_type'] | null
                    created_at?: string | null
                }
                Relationships: []
            }
            aqi_readings: {
                Row: {
                    id: string
                    location_id: string | null
                    source: Database['public']['Enums']['source_type'] | null
                    aqi_value: number
                    pm25: number | null
                    pm10: number | null
                    no2: number | null
                    so2: number | null
                    co: number | null
                    o3: number | null
                    temperature: number | null
                    humidity: number | null
                    wind_speed: number | null
                    wind_direction: number | null
                    fire_risk_data: Json | null
                    recorded_at: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    location_id?: string | null
                    source?: Database['public']['Enums']['source_type'] | null
                    aqi_value: number
                    pm25?: number | null
                    pm10?: number | null
                    no2?: number | null
                    so2?: number | null
                    co?: number | null
                    o3?: number | null
                    temperature?: number | null
                    humidity?: number | null
                    wind_speed?: number | null
                    wind_direction?: number | null
                    fire_risk_data?: Json | null
                    recorded_at: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    location_id?: string | null
                    source?: Database['public']['Enums']['source_type'] | null
                    aqi_value?: number
                    pm25?: number | null
                    pm10?: number | null
                    no2?: number | null
                    so2?: number | null
                    co?: number | null
                    o3?: number | null
                    temperature?: number | null
                    humidity?: number | null
                    wind_speed?: number | null
                    wind_direction?: number | null
                    fire_risk_data?: Json | null
                    recorded_at?: string
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "aqi_readings_location_id_fkey"
                        columns: ["location_id"]
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            pollution_sources: {
                Row: {
                    id: string
                    location_id: string | null
                    source_type: Database['public']['Enums']['pollution_source_type'] | null
                    confidence_score: number | null
                    fire_risk_data: Json | null
                    detected_at: string
                    raw_features: Json | null
                }
                Insert: {
                    id?: string
                    location_id?: string | null
                    source_type?: Database['public']['Enums']['pollution_source_type'] | null
                    confidence_score?: number | null
                    fire_risk_data?: Json | null
                    detected_at: string
                    raw_features?: Json | null
                }
                Update: {
                    id?: string
                    location_id?: string | null
                    source_type?: Database['public']['Enums']['pollution_source_type'] | null
                    confidence_score?: number | null
                    detected_at?: string
                    raw_features?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pollution_sources_location_id_fkey"
                        columns: ["location_id"]
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            policy_recommendations: {
                Row: {
                    id: string
                    location_id: string | null
                    trigger_source: string | null
                    severity: Database['public']['Enums']['severity_level'] | null
                    anomaly_summary: string | null
                    recommendation_text: string
                    fire_risk_data: Json | null
                    status: Database['public']['Enums']['recommendation_status'] | null
                    generated_by: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    location_id?: string | null
                    trigger_source?: string | null
                    severity?: Database['public']['Enums']['severity_level'] | null
                    anomaly_summary?: string | null
                    recommendation_text: string
                    fire_risk_data?: Json | null
                    status?: Database['public']['Enums']['recommendation_status'] | null
                    generated_by?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    location_id?: string | null
                    trigger_source?: string | null
                    severity?: Database['public']['Enums']['severity_level'] | null
                    anomaly_summary?: string | null
                    recommendation_text?: string
                    status?: Database['public']['Enums']['recommendation_status'] | null
                    generated_by?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "policy_recommendations_location_id_fkey"
                        columns: ["location_id"]
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_profiles: {
                Row: {
                    id: string
                    role: Database['public']['Enums']['user_role'] | null
                    preferred_location_id: string | null
                    notification_enabled: boolean | null
                    admin_type: 'city_admin' | 'central_admin' | null
                    assigned_city_id: string | null
                    assigned_city_name: string | null
                    is_active: boolean
                    last_login_at: string | null
                    notification_settings: Json | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    role?: Database['public']['Enums']['user_role'] | null
                    preferred_location_id?: string | null
                    notification_enabled?: boolean | null
                    admin_type?: 'city_admin' | 'central_admin' | null
                    assigned_city_id?: string | null
                    assigned_city_name?: string | null
                    is_active?: boolean
                    last_login_at?: string | null
                    notification_settings?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    role?: Database['public']['Enums']['user_role'] | null
                    preferred_location_id?: string | null
                    notification_enabled?: boolean | null
                    admin_type?: 'city_admin' | 'central_admin' | null
                    assigned_city_id?: string | null
                    assigned_city_name?: string | null
                    is_active?: boolean
                    last_login_at?: string | null
                    notification_settings?: Json | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_profiles_preferred_location_id_fkey"
                        columns: ["preferred_location_id"]
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_profiles_assigned_city_id_fkey"
                        columns: ["assigned_city_id"]
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            admin_invitations: {
                Row: {
                    id: string
                    invite_code: string
                    admin_type: 'city_admin' | 'central_admin'
                    assigned_city_id: string | null
                    assigned_city_name: string | null
                    used_by: string | null
                    used_at: string | null
                    expires_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    invite_code: string
                    admin_type: 'city_admin' | 'central_admin'
                    assigned_city_id?: string | null
                    assigned_city_name?: string | null
                    used_by?: string | null
                    used_at?: string | null
                    expires_at: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    invite_code?: string
                    admin_type?: 'city_admin' | 'central_admin'
                    assigned_city_id?: string | null
                    assigned_city_name?: string | null
                    used_by?: string | null
                    used_at?: string | null
                    expires_at?: string
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "admin_invitations_assigned_city_id_fkey"
                        columns: ["assigned_city_id"]
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "admin_invitations_used_by_fkey"
                        columns: ["used_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            push_subscriptions: {
                Row: {
                    id: string
                    endpoint: string
                    p256dh: string
                    auth: string
                    threshold_aqi: number
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    endpoint: string
                    p256dh: string
                    auth: string
                    threshold_aqi?: number
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    endpoint?: string
                    p256dh?: string
                    auth?: string
                    threshold_aqi?: number
                    created_at?: string | null
                }
                Relationships: []
            }
            weather_cache: {
                Row: {
                    key: string
                    data: Json
                    updated_at: string
                }
                Insert: {
                    key: string
                    data: Json
                    updated_at?: string
                }
                Update: {
                    key?: string
                    data?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            cron_logs: {
                Row: {
                    id: string
                    job_name: string
                    status: string
                    records_processed: number | null
                    ran_at: string
                    error_message: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    job_name: string
                    status: string
                    records_processed?: number | null
                    ran_at: string
                    error_message?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    job_name?: string
                    status?: string
                    records_processed?: number | null
                    ran_at?: string
                    error_message?: string | null
                    metadata?: Json | null
                }
                Relationships: []
            }
            fire_snapshots: {
                Row: {
                    id: string
                    region_name: string
                    bbox: Json
                    hotspot_count: number
                    high_confidence_count: number
                    max_frp: number | null
                    avg_frp: number | null
                    snapshot_date: string
                    last_updated: string
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    region_name: string
                    bbox: Json
                    hotspot_count?: number
                    high_confidence_count?: number
                    max_frp?: number | null
                    avg_frp?: number | null
                    snapshot_date?: string
                    last_updated?: string
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    region_name?: string
                    bbox?: Json
                    hotspot_count?: number
                    high_confidence_count?: number
                    max_frp?: number | null
                    avg_frp?: number | null
                    snapshot_date?: string
                    last_updated?: string
                    metadata?: Json | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            location_type: 'ward' | 'city' | 'landmark' | 'custom'
            source_type: 'satellite' | 'meteorological' | 'iot' | 'interpolated'
            pollution_source_type: 'traffic' | 'construction' | 'biomass_burning' | 'industrial' | 'unknown'
            severity_level: 'low' | 'moderate' | 'high' | 'critical'
            recommendation_status: 'pending' | 'acknowledged' | 'actioned' | 'dismissed'
            user_role: 'admin' | 'citizen'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
