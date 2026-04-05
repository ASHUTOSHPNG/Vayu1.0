import { knowledgeBase, KnowledgeDocument, KnowledgeCategory } from './knowledgeBase';

/**
 * Tokenizes a string into a set of lowercased, alphanumeric word stems.
 * Very basic simplistic normalization for MVP keyword matching.
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/gi, '') // Remove punctuation
        .split(/\s+/) // Split on whitespace
        .filter((word) => word.length > 2); // Filter out tiny stop words
}

/**
 * Retrieves the most relevant knowledge documents based on a query and a source context.
 * Uses a rudimentary TF-IDF-like calculation prioritizing tag hits and keyword overlaps.
 * 
 * @param query The natural language string to search against (e.g., "high pm10 near road")
 * @param sourceType An optional contextual hint mapping to the ML source signature (e.g. "TRAFFIC")
 * @param maxDocs The maximum number of documents to return
 */
export function retrieveRelevantDocs(
    query: string,
    sourceType?: string,
    maxDocs: number = 5
): KnowledgeDocument[] {
    const queryTokens = new Set(tokenize(query));

    // Map ML signature source types directly to specific Knowledge Categories to boost related policies
    let contextualCategory: KnowledgeCategory | null = null;
    if (sourceType === 'TRAFFIC') contextualCategory = 'MITIGATION_TRAFFIC';
    if (sourceType === 'CONSTRUCTION_DUST') contextualCategory = 'MITIGATION_CONSTRUCTION';
    if (sourceType === 'BIOMASS_BURNING') contextualCategory = 'MITIGATION_BIOMASS';
    if (sourceType === 'INDUSTRIAL') contextualCategory = 'MITIGATION_INDUSTRIAL';

    const scoredDocs = knowledgeBase.map((doc) => {
        let score = 0;

        const titleTokens = tokenize(doc.title);
        const contentTokens = tokenize(doc.content);

        // 1. Tag matching represents the highest density signal
        doc.tags.forEach((tag) => {
            if (queryTokens.has(tag.toLowerCase())) {
                score += 3; // High weight for direct tag matches
            }
        });

        // 2. Keyword matching in title
        titleTokens.forEach((token) => {
            if (queryTokens.has(token)) score += 2;
        });

        // 3. Keyword matching in content (TF)
        contentTokens.forEach((token) => {
            if (queryTokens.has(token)) score += 1;
        });

        // 4. Source Type contextual boosting
        // If the system knows what type of pollution this is, massively boost those specific mitigations
        if (contextualCategory && doc.category === contextualCategory) {
            score += 10;
        }

        // Always boost health advisories and emergency protocols slightly if the query suggests danger
        if (queryTokens.has('emergency') || queryTokens.has('danger') || queryTokens.has('high')) {
            if (doc.category === 'EMERGENCY_PROTOCOL') score += 5;
            if (doc.category === 'HEALTH_ADVISORY') score += 5;
        }

        return { doc, score };
    });

    // Sort descending by score, and filter out zero-scores (unless contextually boosted)
    const sorted = scoredDocs
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score);

    return sorted.slice(0, maxDocs).map((res) => res.doc);
}
