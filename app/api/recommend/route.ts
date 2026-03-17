import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { retrieveRelevantDocs } from '@/lib/rag/retrieval';
import { Database } from '@/types/database';
import { FireRiskAssessment } from '@/lib/api-clients/firms';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        responseMimeType: "application/json",
    }
});



// Using a fallback mock if no API key is set for robust development
const MOCK_LLM_RESPONSE = {
    severity: "high",
    headline: "Elevated PM10 indicating acute construction dust anomaly.",
    rootCauseAnalysis: "Analysis suggests unmitigated construction activity in the vicinity. PM10 levels have spiked out of proportion to PM2.5, matching typical mechanical dust dispersion patterns under low wind conditions.",
    immediateActions: [
        "Dispatch inspection team to major construction sites in the ward to verify dust suppression measures.",
        "Mandate immediate halts on excavation and dry-aggregate mixing.",
        "Deploy anti-smog guns and mechanical sweepers to major arterial roads near the anomaly."
    ],
    mediumTermActions: [
        "Audit all construction permits in the sector for green-netting compliance.",
        "Install localized low-cost PM sensors near major upcoming development projects for tighter monitoring."
    ],
    citizenAdvisory: "Residents, especially those with asthma, should keep windows closed and avoid strenuous outdoor activities. Wear N95 masks if outdoor travel is necessary.",
    monitoringNote: "Monitor PM10 levels for the next 6-12 hours to verify if the anomaly dissipates post mitigation enforcement.",
    regulatoryReferences: ["GRAP Stage II Construction Dust Directives", "CPCB National Ambient Air Quality Standards"]
};

export async function POST(request: Request) {
    try {
        const {
            location_id,
            locationName,
            anomalyData,
            detectedSources,
            weatherData,
            fireRiskAssessment // ← NEW optional field
        }: {
            location_id: string;
            locationName: string;
            anomalyData: any;
            detectedSources: any[];
            weatherData: any;
            fireRiskAssessment?: FireRiskAssessment;
        } = await request.json();

        if (!location_id || !locationName || !anomalyData) {
            return NextResponse.json(
                { error: 'Missing required fields: location_id, locationName, anomalyData' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // 1. Rate Limiting Check: 1 call per location per 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        const { data: recentRecs, error: fetchError } = await supabase
            .from('policy_recommendations')
            .select('id, created_at')
            .eq('location_id', location_id)
            .gte('created_at', twoHoursAgo)
            .limit(1);

        if (fetchError) {
            console.error('Supabase fetch error:', fetchError);
            return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
        }

        if (recentRecs && recentRecs.length > 0) {
            return NextResponse.json({
                error: 'Rate limit exceeded',
                message: 'A policy recommendation was already generated for this location in the last 2 hours. Please rely on existing mitigations.',
                coolingDown: true
            }, { status: 429 });
        }

        // 2. RAG Retrieval
        // Build a broad query based on the anomaly string and sources
        const primarySource = detectedSources && detectedSources.length > 0 ? detectedSources[0].sourceType : 'unknown';
        const primaryConfidence = detectedSources && detectedSources.length > 0 ? detectedSources[0].confidence : 0;

        // Convert source types to the RAG format (basic matching, can be fine-tuned)
        let ragContextType = '';
        if (primarySource.toLowerCase().includes('traffic')) ragContextType = 'TRAFFIC';
        if (primarySource.toLowerCase().includes('construction')) ragContextType = 'CONSTRUCTION_DUST';
        if (primarySource.toLowerCase().includes('biomass')) ragContextType = 'BIOMASS_BURNING';
        if (primarySource.toLowerCase().includes('industrial')) ragContextType = 'INDUSTRIAL';

        const ragQuery = `${anomalyData.summary || ''} ${primarySource}`;

        // 2a. Update RAG retrieval for fire-specific policies
        const tags = [];
        if (detectedSources?.some((s: any) => s.sourceType === 'biomass_burning') && fireRiskAssessment?.hasUpwindFire) {
            tags.push('fire_satellite_confirmed');
        }

        const retrievedDocs = retrieveRelevantDocs(
            ragQuery + (tags.length > 0 ? ` ${tags.join(' ')}` : ''),
            ragContextType,
            4
        );
        const knowledgeContext = retrievedDocs.map((doc, idx) =>
            `${idx + 1}. [${doc.category}] ${doc.title}: ${doc.content}`
        ).join('\n\n');

        // 3. Build Google Prompts
        const systemPrompt = `You are an expert environmental policy advisor for urban air quality management in India. You have deep knowledge of CPCB norms, GRAP, the Air (Prevention and Control of Pollution) Act 1981, and WHO air quality guidelines. You must provide structured, actionable, time-bound policy recommendations for city administrators.`;

        const userPrompt = `CURRENT ANOMALY ALERT:
- Location: ${locationName}
- Current AQI: ${anomalyData.aqi || 'Unknown'} 
- Anomaly Score: ${anomalyData.anomalyScore || 'Unknown'}/10 (Z-score vs 7-day baseline)
- Duration: Elevated for ${anomalyData.hours || 1} hours
- Primary Detected Source: ${primarySource} (Confidence: ${primaryConfidence}%)

METEOROLOGICAL CONDITIONS:
- Wind Speed: ${weatherData?.wind_speed || 'Unknown'} km/h
- Wind Direction: ${weatherData?.wind_direction || 'Unknown'}°
- Humidity: ${weatherData?.humidity || 'Unknown'}%
- Dispersion Factor: ${weatherData?.dispersion_factor || '1.0'}/1.0 (1.0 = ideal dispersion)

${fireRiskAssessment && fireRiskAssessment.hasUpwindFire
                ? `
SATELLITE FIRE INTELLIGENCE (NASA FIRMS — VIIRS/MODIS):
- Fire Risk Level: ${fireRiskAssessment.riskLevel.toUpperCase()}
- Smoke Impact Score: ${fireRiskAssessment.smokeImpactScore.toFixed(1)}/10
- Active Upwind Fires: ${fireRiskAssessment.upwindFireCount}
- Nearest Fire: ${fireRiskAssessment.nearestFireDistanceKm?.toFixed(0)}km away
- Nearest Fire Intensity: ${fireRiskAssessment.nearestFireFRP?.toFixed(0)}MW (Fire Radiative Power)
- Summary: ${fireRiskAssessment.riskSummary}
- Data Source: NASA FIRMS VIIRS 375m NRT — confirmed active fire detections
`
                : fireRiskAssessment
                    ? `
SATELLITE FIRE INTELLIGENCE (NASA FIRMS):
- No active fires detected within 500km radius.
- Biomass burning source unlikely based on satellite data.
`
                    : `
SATELLITE FIRE INTELLIGENCE: NASA FIRMS data not available for this query.
`}

RELEVANT POLICY KNOWLEDGE BASE:
${knowledgeContext}

Generate a structured JSON response with:
{
  "severity": "low|moderate|high|critical",
  "headline": "one-sentence summary of the situation",
  "rootCauseAnalysis": "2-3 sentences explaining likely cause chain",
  "immediateActions": [array of 3-5 specific actions with responsible authority and timeline],
  "mediumTermActions": [array of 2-3 policy recommendations with timeline > 48h],
  "citizenAdvisory": "plain-language advice for general public (max 60 words)",
  "monitoringNote": "what to watch for in next 24 hours",
  "regulatoryReferences": [relevant laws/norms cited],
  "fireCoordinates": [
    { "lat": number, "lon": number, "frpMW": number, "distanceKm": number }
  ] | null
}

Instruction for fireCoordinates: "If satellite fire data is provided and hasUpwindFire is true, populate fireCoordinates with the top 3 fires by FRP from the FIRMS data. These will be plotted on the admin dashboard map. If no fire data is available, set to null."

Respond ONLY with the JSON object. No preamble or explanation outside the JSON.`;

        let recommendationPayload;

        if (!process.env.GOOGLE_API_KEY) {
            console.warn("GOOGLE_API_KEY is not set. Falling back to rule-based mock response.");

            // Very rudimentary generic fallback logic incorporating RAG where possible
            recommendationPayload = {
                ...MOCK_LLM_RESPONSE,
                headline: `Action required for ${primarySource} emissions at ${locationName}.`,
                regulatoryReferences: retrievedDocs.length > 0 ? [retrievedDocs[0].title] : MOCK_LLM_RESPONSE.regulatoryReferences
            };
        } else {
            // 4. Call Google Gemini 2.0 API
            const result = await model.generateContent([
                { text: systemPrompt },
                { text: userPrompt },
            ]);

            const responseText = result.response.text();

            try {
                // Gemini with forced JSON response will return valid JSON
                const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
                recommendationPayload = JSON.parse(cleanedText);
            } catch (_parseError) {
                console.error("Failed to parse Gemini JSON response:", responseText);
                return NextResponse.json({ error: 'Failed to process AI response format' }, { status: 500 });
            }
        }

        // Map severity to enum
        const validSeverities = ['low', 'moderate', 'high', 'critical'];
        const dbSeverity = validSeverities.includes(recommendationPayload.severity?.toLowerCase())
            ? recommendationPayload.severity.toLowerCase()
            : 'moderate';

        // 5. Save to Supabase
        const { data: insertedRec, error: insertError } = await supabase
            .from('policy_recommendations')
            .insert({
                location_id,
                trigger_source: primarySource,
                severity: dbSeverity as Database['public']['Enums']['severity_level'],
                anomaly_summary: anomalyData.summary || recommendationPayload.headline,
                recommendation_text: JSON.stringify(recommendationPayload), // Storing the full JSON structure in text field
                status: 'pending',
                generated_by: 'ai_engine',
                fire_risk_data: fireRiskAssessment as any // Persist FIRMS data (cast to any to satisfy Json type)
            })

            .select()
            .single();

        if (insertError) {
            console.error('Failed to save recommendation to Supabase:', insertError);
            // We still return the recommendation to the user even if DB save fails, purely for UX resilience
        }

        // 6. Return response
        return NextResponse.json({
            success: true,
            data: recommendationPayload,
            recordId: insertedRec?.id
        });

    } catch (error: Error | any) {
        console.error('Recommendation Engine Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
