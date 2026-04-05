import { AdminContext } from '@/types/admin';

/**
 * Applies city-level filtering to Supabase queries.
 * For city admins, always filters by their assigned city.
 * For central admins, filters by the selected city if one is chosen.
 * 
 * NOTE: The caller MUST ensure that 'locations' is included in their .select() 
 * for the join filtering to work, e.g. .select('*, locations!inner(city)')
 */
export function applyCityFilter(
    query: any,
    adminContext: AdminContext,
    selectedCityId?: string | null,
    isWardTable: boolean = false
) {
    const filterKey = isWardTable ? 'city' : 'ward.city';

    if (adminContext.type === 'city_admin') {
        const cityName = adminContext.cityFilter.name;
        // City admins are locked to their assigned city name
        return query.eq(filterKey, cityName);
    }

    if (adminContext.type === 'central_admin' && selectedCityId) {
        // For central admins, we filter by the selected city name
        return query.eq(filterKey, selectedCityId);
    }

    // Central admin with "All Cities" selected - return as is (no filter)
    return query;
}
