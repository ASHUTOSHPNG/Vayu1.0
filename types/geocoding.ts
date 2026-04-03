// Base interface with common location fields
export interface LocationBase {
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

// Location info from reverse geocoding with optional metadata
export interface LocationInfo extends LocationBase {
  source?: "database" | "reverse-geocode" | "search" | "ip-fallback";
  id?: string;
}

// Search suggestions with consistent structure
export interface LocationSuggestion extends LocationBase {
  // Inherits all LocationBase fields
}
