
-- Finz MVP schema. No auth: identity is a 6-char code stored client-side and
-- passed as filter in every query. RLS allows anon full access; security
-- model is "the code is the secret".

CREATE TABLE public.users (
  code TEXT PRIMARY KEY,
  total_xp INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  max_streak INT NOT NULL DEFAULT 0,
  current_rank INT NOT NULL DEFAULT 1,
  last_activity_date DATE,
  onboarding_answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.expenses(user_code, date DESC);

CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.budget_categories(user_code);

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  deadline DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.goals(user_code);

CREATE TABLE public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.goal_contributions(goal_id);

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.habits(user_code);

CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(habit_id, date)
);
CREATE INDEX ON public.habit_completions(user_code, date);

CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_code, lesson_id)
);

CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT NOT NULL REFERENCES public.users(code) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_code, badge_key)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_contributions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_completions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO anon, authenticated;
GRANT ALL ON public.users, public.expenses, public.budget_categories, public.goals, public.goal_contributions, public.habits, public.habit_completions, public.lesson_progress, public.badges TO service_role;

-- RLS (permissive: code-as-secret model)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.budget_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.goal_contributions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.habit_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.lesson_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open" ON public.badges FOR ALL USING (true) WITH CHECK (true);
