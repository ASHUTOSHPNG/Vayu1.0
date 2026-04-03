// PATH: Vayu1.0/supabase/functions/generate-policies/index.ts
// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GROQ_API_KEY         = Deno.env.get('GROQ_API_KEY')!;
const AQI_THRESHOLD        = parseInt(Deno.env.get('AQI_THRESHOLD') ?? '300');
const GROQ_MODEL           = 'llama-3.1-8b-instant';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface AQIReading {
  id: string;
  aqi_value: number;
  pm25: number | null;
  pm10: number | null;
  recorded_at: string;
  ward_id: string;
  wards: {
    id: string;
    name: string;
    city: string;
    state: string | null;
  };
}

interface GeneratedPolicy {
  title: string;
  description: string;
  action_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
}

async function callGroq(reading: AQIReading): Promise<GeneratedPolicy | null> {
  const prompt = `You are an environmental policy expert for India's air quality management system (VAYU).

A critical air quality reading has been detected:
- Location: ${reading.wards.name}, ${reading.wards.city}, ${reading.wards.state ?? 'India'}
- AQI Value: ${reading.aqi_value} (Threshold: ${AQI_THRESHOLD})
- PM2.5: ${reading.pm25 ?? 'N/A'} µg/m³
- PM10: ${reading.pm10 ?? 'N/A'} µg/m³
- Recorded at: ${new Date(reading.recorded_at).toLocaleString('en-IN')}

Generate a specific, actionable environmental policy intervention for this situation.

Respond ONLY with a JSON object (no markdown, no explanation):
{
  "title": "short policy title under 80 chars",
  "description": "2-3 sentence description of the intervention, why it's needed, and expected impact",
  "action_type": "one of: vehicle_restriction, industrial_shutdown, construction_ban, biomass_ban, odd_even_scheme, public_advisory, emergency_response",
  "severity": "one of: low, medium, high, critical",
  "confidence_score": 0.0 to 1.0 float indicating AI confidence
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 512,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';

    // Strip markdown fences if present
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed: GeneratedPolicy = JSON.parse(clean);

    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.severity) {
      console.error('Invalid response structure:', parsed);
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('Groq call failed:', err);
    return null;
  }
}

async function isDuplicate(wardId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('policy_actions')
    .select('id', { count: 'exact', head: true })
    .eq('trigger', 'genai_anomaly')
    .eq('anomaly_id', wardId)
    .gte('created_at', since);

  return (count ?? 0) > 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  console.log(`[generate-policies] Starting run at ${new Date().toISOString()}`);

  // 1. Fetch high-AQI readings joined with ward info
  const { data: readings, error: readingsError } = await supabase
    .from('aqi_readings')
    .select(`
      id, aqi_value, pm25, pm10, recorded_at, ward_id,
      wards ( id, name, city, state )
    `)
    .gte('aqi_value', AQI_THRESHOLD)
    .order('aqi_value', { ascending: false })
    .limit(20);

  if (readingsError) {
    console.error('Failed to fetch AQI readings:', readingsError);
    return new Response(JSON.stringify({ error: readingsError.message }), { status: 500 });
  }

  if (!readings || readings.length === 0) {
    console.log('No high-AQI readings found. Exiting.');
    return new Response(JSON.stringify({ message: 'No anomalies detected', created: 0 }), { status: 200 });
  }

  console.log(`Found ${readings.length} high-AQI readings above ${AQI_THRESHOLD}`);

  // Deduplicate by city — only process worst reading per city
  const cityMap = new Map<string, AQIReading>();
  for (const r of readings as AQIReading[]) {
    const city = r.wards?.city;
    if (!city) continue;
    if (!cityMap.has(city) || r.aqi_value > cityMap.get(city)!.aqi_value) {
      cityMap.set(city, r);
    }
  }

  const uniqueReadings = Array.from(cityMap.values());
  console.log(`Processing ${uniqueReadings.length} unique cities`);

  let created = 0;
  let skipped = 0;
  const results: string[] = [];

  for (const reading of uniqueReadings) {
    const wardId = reading.wards?.id ?? reading.ward_id;

    // 2. Skip if policy already created for this ward in last 24hrs
    const duplicate = await isDuplicate(wardId);
    if (duplicate) {
      console.log(`Skipping ${reading.wards?.city} — policy already created in last 24h`);
      skipped++;
      continue;
    }

    // 3. Call Groq
    const policy = await callGroq(reading);
    if (!policy) {
      console.error(`Groq failed for ${reading.wards?.city}`);
      results.push(`FAILED: ${reading.wards?.city}`);
      continue;
    }

    // 4. Insert into policy_actions
    const { error: insertError } = await supabase
      .from('policy_actions')
      .insert({
        city:             reading.wards?.city ?? 'Unknown',
        state:            reading.wards?.state ?? null,
        ward:             reading.wards?.name ?? null,
        aqi_at_trigger:   reading.aqi_value,
        pollutant:        reading.pm25 && reading.pm25 > (reading.pm10 ?? 0) ? 'PM2.5' : 'PM10',
        anomaly_id:       wardId,
        title:            policy.title,
        description:      policy.description,
        action_type:      policy.action_type,
        severity:         policy.severity,
        trigger:          'genai_anomaly',
        status:           'pending',
        ai_model:         GROQ_MODEL,
        confidence_score: policy.confidence_score,
      });

    if (insertError) {
      console.error(`Insert failed for ${reading.wards?.city}:`, insertError);
      results.push(`INSERT_FAILED: ${reading.wards?.city}`);
      continue;
    }

    console.log(`✓ Policy created for ${reading.wards?.city} — AQI ${reading.aqi_value} — ${policy.severity} severity`);
    results.push(`CREATED: ${reading.wards?.city} (AQI ${reading.aqi_value})`);
    created++;

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }
   const summary = { created, skipped, total: uniqueReadings.length, results };
  console.log('[generate-policies] Done:', summary);

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});