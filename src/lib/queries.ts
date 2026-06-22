import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUser(code: string | null) {
  return useQuery({
    queryKey: ["user", code],
    queryFn: async () => {
      if (!code) return null;
      const { data } = await supabase.from("users").select("*").eq("code", code).single();
      return data;
    },
    enabled: !!code,
  });
}

export function useExpenses(code: string | null) {
  return useQuery({
    queryKey: ["expenses", code],
    queryFn: async () => {
      if (!code) return [];
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_code", code)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!code,
  });
}

export function useBudget(code: string | null) {
  return useQuery({
    queryKey: ["budget", code],
    queryFn: async () => {
      if (!code) return [];
      const { data } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_code", code)
        .order("created_at");
      return data ?? [];
    },
    enabled: !!code,
  });
}

export function useGoals(code: string | null) {
  return useQuery({
    queryKey: ["goals", code],
    queryFn: async () => {
      if (!code) return [];
      const { data } = await supabase
        .from("goals")
        .select("*, goal_contributions(amount, date)")
        .eq("user_code", code)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!code,
  });
}

export function useHabits(code: string | null) {
  return useQuery({
    queryKey: ["habits", code],
    queryFn: async () => {
      if (!code) return [];
      const { data: habits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_code", code)
        .order("created_at");
      const today = new Date().toISOString().slice(0, 10);
      const { data: completions } = await supabase
        .from("habit_completions")
        .select("habit_id")
        .eq("user_code", code)
        .eq("date", today);
      const completed = new Set((completions ?? []).map((c) => c.habit_id));
      return (habits ?? []).map((h) => ({ ...h, completedToday: completed.has(h.id) }));
    },
    enabled: !!code,
  });
}

export function useLessonProgress(code: string | null) {
  return useQuery({
    queryKey: ["lesson_progress", code],
    queryFn: async () => {
      if (!code) return new Set<string>();
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_code", code);
      return new Set((data ?? []).map((d) => d.lesson_id));
    },
    enabled: !!code,
  });
}

export function useBadges(code: string | null) {
  return useQuery({
    queryKey: ["badges", code],
    queryFn: async () => {
      if (!code) return new Set<string>();
      const { data } = await supabase.from("badges").select("badge_key").eq("user_code", code);
      return new Set((data ?? []).map((b) => b.badge_key));
    },
    enabled: !!code,
  });
}

export function useDebts(code: string | null) {
  return useQuery({
    queryKey: ["debts", code],
    queryFn: async () => {
      if (!code) return [];
      const { data } = await supabase
        .from("debts")
        .select("*")
        .eq("user_code", code)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!code,
  });
}
