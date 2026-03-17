export interface LocationInfo {
    display_name: string;
    city?: string;
    state?: string;
    country?: string;
    ward?: string;
    suburb?: string;
    postcode?: string;
    lat: number;
    lon: number;
}

export interface LocationSuggestion {
    display_name: string;
    city?: string;
    state?: string;
    lat: number;
    lon: number;
}
