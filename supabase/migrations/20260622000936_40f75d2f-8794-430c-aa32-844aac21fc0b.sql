
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS monthly_income numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS long_term_goals jsonb,
  ADD COLUMN IF NOT EXISTS monthly_review_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS kind text;

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS monthly_contribution numeric NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code text NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  interest_rate numeric NOT NULL DEFAULT 0,
  min_payment numeric NOT NULL DEFAULT 0,
  strategy text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO anon, authenticated;
GRANT ALL ON public.debts TO service_role;

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open" ON public.debts FOR ALL USING (true) WITH CHECK (true);
