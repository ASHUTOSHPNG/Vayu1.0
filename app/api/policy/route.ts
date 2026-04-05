// PATH: Vayu1.0/app/api/policy/route.ts
// CRUD for policy actions
// GET    /api/policy               — list all policies
// GET    /api/policy?city=Delhi    — filter by city
// GET    /api/policy?status=pending
// POST   /api/policy               — create manual policy
// PATCH  /api/policy               — update status

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── Types (matching actual schema) ────────────────────────────────────────────

type PolicyStatus   = "pending" | "approved" | "in_progress" | "resolved" | "rejected";
type PolicySeverity = "low" | "medium" | "high" | "critical";
type PolicyTrigger  = "genai_anomaly" | "manual";

interface PolicyAction {
  id:                string;
  city:              string;
  state?:            string | null;
  ward?:             string | null;
  aqi_at_trigger?:   number | null;
  pollutant?:        string | null;
  anomaly_id?:       string | null;
  title:             string;
  description:       string;
  action_type?:      string | null;
  severity:          PolicySeverity;
  trigger:           PolicyTrigger;
  status:            PolicyStatus;
  assigned_to?:      string | null;    // uuid → auth.users(id)
  assigned_at?:      string | null;
  reviewed_by?:      string | null;    // uuid → auth.users(id)
  reviewed_at?:      string | null;
  rejection_reason?: string | null;
  resolved_at?:      string | null;
  resolution_notes?: string | null;
  ai_model?:         string | null;
  ai_prompt_hash?:   string | null;
  confidence_score?: number | null;
  created_at:        string;
  updated_at:        string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_STATUSES:   PolicyStatus[]   = ["pending", "approved", "in_progress", "resolved", "rejected"];
const VALID_SEVERITIES: PolicySeverity[] = ["low", "medium", "high", "critical"];
const VALID_TRIGGERS:   PolicyTrigger[]  = ["genai_anomaly", "manual"];
const MAX_LIMIT = 500;
const MIN_LIMIT = 1;

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const city     = searchParams.get("city");
  const status   = searchParams.get("status") as PolicyStatus | null;
  const severity = searchParams.get("severity") as PolicySeverity | null;
  const trigger  = searchParams.get("trigger") as PolicyTrigger | null;

  const rawLimit = parseInt(searchParams.get("limit") ?? "50");
  const limit    = isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, MIN_LIMIT), MAX_LIMIT);

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    return NextResponse.json(
      { success: false, error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(", ")}` },
      { status: 400 }
    );
  }
  if (trigger && !VALID_TRIGGERS.includes(trigger)) {
    return NextResponse.json(
      { success: false, error: `Invalid trigger. Must be one of: ${VALID_TRIGGERS.join(", ")}` },
      { status: 400 }
    );
  }

  let query = supabase
    .from("policy_actions")
    .select(`
      *,
      policy_action_logs (
        id, old_status, new_status, note, created_at
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (city)     query = query.ilike("city", `%${city}%`);
  if (status)   query = query.eq("status", status);
  if (severity) query = query.eq("severity", severity);
  if (trigger)  query = query.eq("trigger", trigger);

  const { data, error } = await query;

  if (error) {
    console.error("[GET /api/policy] Supabase error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const policies = (data ?? []) as PolicyAction[];

  const counts = {
    total:       policies.length,
    pending:     policies.filter(p => p.status === "pending").length,
    approved:    policies.filter(p => p.status === "approved").length,
    in_progress: policies.filter(p => p.status === "in_progress").length,
    resolved:    policies.filter(p => p.status === "resolved").length,
    rejected:    policies.filter(p => p.status === "rejected").length,
    critical:    policies.filter(p => p.severity === "critical").length,
  };

  return NextResponse.json({ success: true, counts, data: policies });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    city, state, ward,
    aqi_at_trigger, pollutant, anomaly_id,
    title, description, action_type,
    severity = "medium",
    ai_model, ai_prompt_hash, confidence_score,
  } = body as Partial<PolicyAction>;

  if (!city || !title || !description) {
    return NextResponse.json(
      { success: false, error: "city, title, and description are required" },
      { status: 400 }
    );
  }

  if (!VALID_SEVERITIES.includes(severity as PolicySeverity)) {
    return NextResponse.json(
      { success: false, error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("policy_actions")
    .insert({
      city,
      state:            state            ?? null,
      ward:             ward             ?? null,
      aqi_at_trigger:   aqi_at_trigger   ?? null,
      pollutant:        pollutant        ?? null,
      anomaly_id:       anomaly_id       ?? null,
      title,
      description,
      action_type:      action_type      ?? null,
      severity,
      trigger:          "manual" as PolicyTrigger,
      status:           "pending" as PolicyStatus,
      ai_model:         ai_model         ?? null,
      ai_prompt_hash:   ai_prompt_hash   ?? null,
      confidence_score: confidence_score ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/policy] Supabase error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, status, assigned_to, reviewed_by, rejection_reason, resolution_notes } =
    body as Partial<PolicyAction & { id: string }>;

  if (!id || typeof id !== "string" || id.trim() === "") {
    return NextResponse.json(
      { success: false, error: "A valid id is required" },
      { status: 400 }
    );
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  // Fetch existing record to avoid overwriting timestamps on repeat status updates
  const { data: existing, error: fetchError } = await supabase
    .from("policy_actions")
    .select("reviewed_at, assigned_at, resolved_at, status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    console.error("[PATCH /api/policy] Record not found:", fetchError);
    return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 });
  }

  const updates: Partial<PolicyAction> = {};

  if (status)           updates.status           = status;
  if (assigned_to)      updates.assigned_to      = assigned_to;
  if (reviewed_by)      updates.reviewed_by      = reviewed_by;
  if (rejection_reason) updates.rejection_reason = rejection_reason;
  if (resolution_notes) updates.resolution_notes = resolution_notes;

  // Only stamp timestamps on first transition into that status
  if (status === "approved"    && !existing.reviewed_at) updates.reviewed_at = new Date().toISOString();
  if (status === "rejected"    && !existing.reviewed_at) updates.reviewed_at = new Date().toISOString();
  if (status === "in_progress" && !existing.assigned_at) updates.assigned_at = new Date().toISOString();
  if (status === "resolved"    && !existing.resolved_at) updates.resolved_at = new Date().toISOString();

  // Note: status change logging is handled automatically by trg_policy_status_log DB trigger

  const { data, error } = await supabase
    .from("policy_actions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/policy] Supabase error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}