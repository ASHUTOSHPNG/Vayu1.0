// PATH: Vayu1.0/app/api/policy/generate/route.ts
// Uses Google Gemini to generate policy recommendations based on AQI anomaly data
// POST /api/policy/generate

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function getSeverity(aqi: number): "low" | "medium" | "high" | "critical" {
  if (aqi <= 200) return "low";
  if (aqi <= 300) return "medium";
  if (aqi <= 400) return "high";
  return "critical";
}

function guessActionType(aqi: number, pollutant?: string): string {
  if (aqi > 400) return "emergency_shutdown";
  if (aqi > 300) {
    if (pollutant === "pm25" || pollutant === "pm10") return "vehicle_restriction";
    if (pollutant === "no2") return "industry_restriction";
    return "public_advisory";
  }
  if (aqi > 200) return "school_closure";
  return "public_advisory";
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { city, state, ward, aqi, pollutant, anomaly_id, extra_context } = body;

  if (!city || aqi === undefined) {
    return NextResponse.json(
      { success: false, error: "city and aqi are required" },
      { status: 400 }
    );
  }

  const prompt = `You are an air quality policy expert for the Indian government.
Based on the following real-time AQI data, generate a concrete actionable policy recommendation.

Location: ${city}${state ? `, ${state}` : ""}${ward ? ` — Ward: ${ward}` : ""}
Current AQI: ${aqi} (${aqi > 400 ? "Severe" : aqi > 300 ? "Very Poor" : aqi > 200 ? "Poor" : aqi > 100 ? "Moderate" : "Satisfactory"})
Primary Pollutant: ${pollutant ?? "PM2.5"}
${extra_context ? `Additional Context: ${extra_context}` : ""}

Respond ONLY with a valid JSON object, no markdown, no explanation, no backticks:
{
  "title": "Short action title (max 10 words)",
  "description": "Detailed recommendation explaining what action to take, who is responsible, timeline, and expected impact. Be specific to Indian context and CPCB guidelines. (3-5 sentences)",
  "action_type": "one of: vehicle_restriction, industry_restriction, school_closure, construction_ban, public_advisory, emergency_shutdown, green_initiative",
  "confidence_score": 0.0
}`;

  let aiTitle       = `AQI Alert: Immediate Action Required in ${city}`;
  let aiDescription = `Current AQI of ${aqi} in ${city} has reached ${aqi > 400 ? "Severe" : "Very Poor"} levels. Authorities should immediately implement emergency protocols including restricting vehicle movement, halting construction activity, and issuing public health advisories. Citizens should avoid outdoor activities and wear N95 masks.`;
  let aiActionType  = guessActionType(aqi, pollutant);
  let aiConfidence  = 0.7;

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    });

    const geminiJson = await geminiRes.json();
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);

    aiTitle       = parsed.title            ?? aiTitle;
    aiDescription = parsed.description      ?? aiDescription;
    aiActionType  = parsed.action_type      ?? aiActionType;
    aiConfidence  = parsed.confidence_score ?? 0.85;

  } catch {
    // fallback values already set above
  }

  const { data, error } = await supabase
    .from("policy_actions")
    .insert({
      city,
      state,
      ward,
      aqi_at_trigger:   aqi,
      pollutant:        pollutant ?? "pm25",
      anomaly_id:       anomaly_id ?? null,
      title:            aiTitle,
      description:      aiDescription,
      action_type:      aiActionType,
      severity:         getSeverity(aqi),
      trigger:          "genai_anomaly",
      status:           "pending",
      ai_model:         "gemini-1.5-flash",
      confidence_score: aiConfidence,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Policy recommendation generated and saved",
    data,
  }, { status: 201 });
}