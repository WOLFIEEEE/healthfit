alter table if exists public.users
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists role text not null default 'member',
  add column if not exists current_plan_key text not null default 'starter',
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists wellness_consent_accepted boolean not null default false,
  add column if not exists disclaimer_accepted boolean not null default false,
  add column if not exists last_active_at timestamptz;

alter table if exists public.subscriptions
  alter column user_id drop not null;

alter table if exists public.payments
  add column if not exists user_id text references public.users(supabase_user_id) on delete set null;

create table if not exists public.member_profiles (
  user_id text primary key references public.users(supabase_user_id) on delete cascade,
  timezone text not null default 'UTC',
  age integer,
  experience_level text,
  activity_level text,
  goal_summary text,
  current_weight_kg real,
  target_weight_kg real,
  height_cm real,
  available_equipment jsonb not null default '[]'::jsonb,
  dietary_preferences jsonb not null default '[]'::jsonb,
  workout_days jsonb not null default '[]'::jsonb,
  meals_per_day integer,
  session_length_min integer,
  hydration_target_ml integer,
  calorie_target integer,
  protein_target_grams integer,
  carbs_target_grams integer,
  fat_target_grams integer,
  injuries_and_limitations text,
  onboarding_notes text,
  last_check_in_at timestamptz,
  profile_photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  target_value real,
  current_value real,
  unit text,
  target_date timestamptz,
  status text not null default 'active',
  priority integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  type text not null default 'onboarding',
  mobility_score integer,
  readiness_score integer,
  sleep_average_hours real,
  stress_score integer,
  energy_score integer,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_programs (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  focus text not null,
  summary text not null,
  status text not null default 'active',
  ai_generated boolean not null default false,
  ai_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_days (
  id text primary key,
  program_id text not null references public.weekly_programs(id) on delete cascade,
  day_of_week integer not null,
  title text not null,
  workout_focus text,
  meal_focus text,
  habit_focus text,
  duration_min integer,
  exercises jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_library (
  id text primary key,
  slug text not null,
  name text not null,
  category text not null,
  equipment text,
  difficulty text,
  instructions jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_logs (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  program_day_id text references public.program_days(id) on delete set null,
  workout_name text not null,
  duration_min integer not null,
  completed boolean not null default false,
  effort_score integer,
  recovery_score integer,
  calories_burned integer,
  notes text,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_logs (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  meal_type text not null,
  title text not null,
  calories integer not null,
  protein_grams integer not null default 0,
  carbs_grams integer not null default 0,
  fat_grams integer not null default 0,
  water_ml integer not null default 0,
  notes text,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_templates (
  id text primary key,
  user_id text references public.users(supabase_user_id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  metric_type text not null default 'boolean',
  target_value real,
  target_frequency text not null default 'daily',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  habit_template_id text not null references public.habit_templates(id) on delete cascade,
  logged_for_date date not null,
  status text not null default 'done',
  value real,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists habit_logs_user_habit_date_idx
  on public.habit_logs(user_id, habit_template_id, logged_for_date);

create table if not exists public.check_ins (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  period_type text not null default 'daily',
  mood_score integer,
  energy_score integer,
  stress_score integer,
  adherence_score integer,
  sleep_hours real,
  wins text,
  blockers text,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_metrics (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  metric_type text not null,
  value real not null,
  unit text not null,
  note text,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_conversations (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  title text not null,
  safety_status text not null default 'clear',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_messages (
  id text primary key,
  conversation_id text not null references public.coach_conversations(id) on delete cascade,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  role text not null,
  content text not null,
  safety_flags jsonb not null default '[]'::jsonb,
  model text,
  token_count integer,
  prompt_snapshot jsonb not null default '{}'::jsonb,
  structured_output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  channel text not null default 'in_app',
  type text not null,
  title text not null,
  body text not null,
  status text not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id text primary key,
  user_id text not null references public.users(supabase_user_id) on delete cascade,
  plan_key text not null,
  source text not null default 'system',
  is_active boolean not null default true,
  ai_daily_message_limit integer not null default 5,
  features jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id text primary key,
  actor_user_id text references public.users(supabase_user_id) on delete set null,
  subject_user_id text references public.users(supabase_user_id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null,
  audience text not null default 'members',
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.member_profiles enable row level security;
alter table public.goals enable row level security;
alter table public.assessments enable row level security;
alter table public.weekly_programs enable row level security;
alter table public.program_days enable row level security;
alter table public.exercise_library enable row level security;
alter table public.workout_logs enable row level security;
alter table public.meal_logs enable row level security;
alter table public.habit_templates enable row level security;
alter table public.habit_logs enable row level security;
alter table public.check_ins enable row level security;
alter table public.progress_metrics enable row level security;
alter table public.coach_conversations enable row level security;
alter table public.coach_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

drop policy if exists users_self_access on public.users;
create policy users_self_access on public.users
  for all using (auth.uid()::text = supabase_user_id)
  with check (auth.uid()::text = supabase_user_id);

drop policy if exists member_profiles_self_access on public.member_profiles;
create policy member_profiles_self_access on public.member_profiles
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists goals_self_access on public.goals;
create policy goals_self_access on public.goals
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists assessments_self_access on public.assessments;
create policy assessments_self_access on public.assessments
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists weekly_programs_self_access on public.weekly_programs;
create policy weekly_programs_self_access on public.weekly_programs
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists program_days_self_select on public.program_days;
create policy program_days_self_select on public.program_days
  for select using (
    exists (
      select 1
      from public.weekly_programs
      where public.weekly_programs.id = public.program_days.program_id
        and public.weekly_programs.user_id = auth.uid()::text
    )
  );

drop policy if exists exercise_library_authenticated_select on public.exercise_library;
create policy exercise_library_authenticated_select on public.exercise_library
  for select using (auth.role() = 'authenticated');

drop policy if exists workout_logs_self_access on public.workout_logs;
create policy workout_logs_self_access on public.workout_logs
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists meal_logs_self_access on public.meal_logs;
create policy meal_logs_self_access on public.meal_logs
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists habit_templates_self_access on public.habit_templates;
create policy habit_templates_self_access on public.habit_templates
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists habit_logs_self_access on public.habit_logs;
create policy habit_logs_self_access on public.habit_logs
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists check_ins_self_access on public.check_ins;
create policy check_ins_self_access on public.check_ins
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists progress_metrics_self_access on public.progress_metrics;
create policy progress_metrics_self_access on public.progress_metrics
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists coach_conversations_self_access on public.coach_conversations;
create policy coach_conversations_self_access on public.coach_conversations
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists coach_messages_self_access on public.coach_messages;
create policy coach_messages_self_access on public.coach_messages
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists notifications_self_access on public.notifications;
create policy notifications_self_access on public.notifications
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists entitlements_self_access on public.entitlements;
create policy entitlements_self_access on public.entitlements
  for select using (auth.uid()::text = user_id);

drop policy if exists subscriptions_self_access on public.subscriptions;
create policy subscriptions_self_access on public.subscriptions
  for select using (auth.uid()::text = user_id);

drop policy if exists payments_self_access on public.payments;
create policy payments_self_access on public.payments
  for select using (auth.uid()::text = user_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists avatars_select_own on storage.objects;
create policy avatars_select_own on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists progress_photos_select_own on storage.objects;
create policy progress_photos_select_own on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists progress_photos_insert_own on storage.objects;
create policy progress_photos_insert_own on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
