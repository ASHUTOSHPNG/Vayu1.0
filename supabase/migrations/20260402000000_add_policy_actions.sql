-- ─── ENUM TYPES ───────────────────────────────────────────

create type policy_status as enum (
  'pending',
  'approved',
  'in_progress',
  'resolved',
  'rejected'
);

create type policy_trigger as enum (
  'genai_anomaly',
  'manual'
);

create type policy_severity as enum (
  'low',
  'medium',
  'high',
  'critical'
);

-- ─── POLICY ACTIONS TABLE ─────────────────────────────────

create table if not exists policy_actions (
  id               uuid primary key default gen_random_uuid(),

  city             text not null,
  state            text,
  ward             text,

  aqi_at_trigger   integer,
  pollutant        text,
  anomaly_id       uuid,

  title            text not null,
  description      text not null,
  action_type      text,
  severity         policy_severity not null default 'medium',

  trigger          policy_trigger not null default 'genai_anomaly',
  status           policy_status not null default 'pending',

  assigned_to      uuid references auth.users(id) on delete set null,
  assigned_at      timestamptz,

  reviewed_by      uuid references auth.users(id) on delete set null,
  reviewed_at      timestamptz,
  rejection_reason text,

  resolved_at      timestamptz,
  resolution_notes text,

  ai_model         text,
  ai_prompt_hash   text,
  confidence_score numeric(4,3),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── POLICY ACTION LOGS ───────────────────────────────────

create table if not exists policy_action_logs (
  id              uuid primary key default gen_random_uuid(),
  policy_id       uuid not null references policy_actions(id) on delete cascade,
  changed_by      uuid references auth.users(id) on delete set null,
  old_status      policy_status,
  new_status      policy_status not null,
  note            text,
  created_at      timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────

create index idx_policy_actions_city     on policy_actions(city);
create index idx_policy_actions_status   on policy_actions(status);
create index idx_policy_actions_severity on policy_actions(severity);
create index idx_policy_actions_trigger  on policy_actions(trigger);
create index idx_policy_actions_created  on policy_actions(created_at desc);
create index idx_policy_logs_policy_id   on policy_action_logs(policy_id);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────

create or replace function update_policy_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_policy_updated_at
  before update on policy_actions
  for each row execute function update_policy_updated_at();

-- ─── AUTO LOG ON STATUS CHANGE ────────────────────────────

create or replace function log_policy_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into policy_action_logs (policy_id, old_status, new_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_policy_status_log
  after update on policy_actions
  for each row execute function log_policy_status_change();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────

alter table policy_actions     enable row level security;
alter table policy_action_logs enable row level security;

-- Admins full access — using auth.jwt() metadata instead of user_roles table
create policy "admins_all_policy_actions"
  on policy_actions for all
  using (
    (auth.jwt() ->> 'role') in ('admin', 'super_admin')
    or auth.role() = 'service_role'
  );

-- Assigned officials can view their own
create policy "officials_view_assigned"
  on policy_actions for select
  using (assigned_to = auth.uid());

-- Assigned officials can update their own
create policy "officials_update_assigned"
  on policy_actions for update
  using (assigned_to = auth.uid())
  with check (assigned_to = auth.uid());

-- Admins can view logs
create policy "admins_view_logs"
  on policy_action_logs for select
  using (
    (auth.jwt() ->> 'role') in ('admin', 'super_admin')
    or auth.role() = 'service_role'
  );