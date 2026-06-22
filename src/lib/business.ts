import { supabase } from "@/integrations/supabase/client";
import { ALL_LESSONS, getLessonsByLevel } from "@/data/lessons";

export const RANK_NAMES: Record<number, string> = {
  1: "Explorador financiero",
  2: "Controlador de gastos",
  3: "Ahorrador en construcción",
  4: "Libre de deudas (en progreso)",
  5: "Inversionista en formación",
  6: "Maestro de tu dinero",
};

export const BADGE_DEFS: { key: string; name: string; description: string }[] = [
  { key: "first_step", name: "Primer paso", description: "Registraste tu primer gasto" },
  { key: "expense_detective", name: "Detective de gastos", description: "Identificaste un gasto hormiga" },
  { key: "living_goal", name: "Meta viva", description: "Creaste tu primera meta" },
  { key: "streak_7", name: "Racha de 7", description: "7 días consecutivos activo" },
  { key: "streak_30", name: "Racha de 30", description: "30 días consecutivos activo" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function awardXp(userCode: string, amount: number): Promise<void> {
  if (amount === 0) return;
  const { data: user } = await supabase
    .from("users")
    .select("total_xp")
    .eq("code", userCode)
    .single();
  if (!user) return;
  await supabase
    .from("users")
    .update({ total_xp: user.total_xp + amount })
    .eq("code", userCode);
}

export async function tickStreak(userCode: string): Promise<{ streak: number; isNewDay: boolean }> {
  const { data: user } = await supabase
    .from("users")
    .select("current_streak, max_streak, last_activity_date")
    .eq("code", userCode)
    .single();
  if (!user) return { streak: 0, isNewDay: false };

  const today = todayISO();
  if (user.last_activity_date === today) {
    return { streak: user.current_streak, isNewDay: false };
  }

  let newStreak = 1;
  if (user.last_activity_date) {
    const last = new Date(user.last_activity_date + "T00:00:00");
    const now = new Date(today + "T00:00:00");
    const diff = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) newStreak = user.current_streak + 1;
    else if (diff <= 0) newStreak = user.current_streak;
    else newStreak = 1;
  }
  const newMax = Math.max(user.max_streak, newStreak);
  await supabase
    .from("users")
    .update({ current_streak: newStreak, max_streak: newMax, last_activity_date: today })
    .eq("code", userCode);
  return { streak: newStreak, isNewDay: true };
}

export async function checkBadges(userCode: string): Promise<string[]> {
  const newly: string[] = [];
  const { data: existing } = await supabase
    .from("badges")
    .select("badge_key")
    .eq("user_code", userCode);
  const owned = new Set((existing ?? []).map((b) => b.badge_key));

  const give = async (key: string) => {
    if (owned.has(key)) return;
    const { error } = await supabase
      .from("badges")
      .insert({ user_code: userCode, badge_key: key });
    if (!error) newly.push(key);
  };

  const { count: expenseCount } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("user_code", userCode);
  if ((expenseCount ?? 0) >= 1) await give("first_step");

  const { data: lesson1 } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("user_code", userCode)
    .eq("lesson_id", "L1-M1-1")
    .maybeSingle();
  if (lesson1) await give("expense_detective");

  const { count: goalCount } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_code", userCode);
  if ((goalCount ?? 0) >= 1) await give("living_goal");

  const { data: user } = await supabase
    .from("users")
    .select("current_streak")
    .eq("code", userCode)
    .single();
  if ((user?.current_streak ?? 0) >= 7) await give("streak_7");
  if ((user?.current_streak ?? 0) >= 30) await give("streak_30");

  return newly;
}

export async function recordAction(userCode: string, xp: number): Promise<void> {
  await awardXp(userCode, xp);
  await tickStreak(userCode);
  await checkBadges(userCode);
}

export async function completeLesson(
  userCode: string,
  lessonId: string,
  xp: number
): Promise<{ moduleBonus: boolean; levelBonus: boolean; newRank: number | null }> {
  await supabase
    .from("lesson_progress")
    .upsert({ user_code: userCode, lesson_id: lessonId }, { onConflict: "user_code,lesson_id" });
  await awardXp(userCode, xp);
  await tickStreak(userCode);

  const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
  let moduleBonus = false;
  let levelBonus = false;
  let newRank: number | null = null;

  if (lesson) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_code", userCode);
    const done = new Set((progress ?? []).map((p) => p.lesson_id));

    const moduleLessons = ALL_LESSONS.filter(
      (l) => l.level === lesson.level && l.module === lesson.module
    );
    if (moduleLessons.every((l) => done.has(l.id))) {
      await awardXp(userCode, 30);
      moduleBonus = true;
    }

    const levelLessons = getLessonsByLevel(lesson.level);
    if (levelLessons.every((l) => done.has(l.id))) {
      await awardXp(userCode, 100);
      const { data: user } = await supabase
        .from("users")
        .select("current_rank")
        .eq("code", userCode)
        .single();
      const targetRank = Math.min(lesson.level + 1, 6);
      const upgraded = Math.max(user?.current_rank ?? 1, targetRank);
      if (upgraded !== user?.current_rank) {
        await supabase.from("users").update({ current_rank: upgraded }).eq("code", userCode);
        newRank = upgraded;
      }
      levelBonus = true;
    }
  }

  await checkBadges(userCode);
  return { moduleBonus, levelBonus, newRank };
}

/**
 * A lesson is unlocked when:
 * - it's the first lesson of level 1, OR
 * - the previous lesson in the same level is completed, OR
 * - it's the first lesson of a level whose previous level is fully completed.
 */
export function isLessonUnlocked(lessonId: string, completedIds: Set<string>): boolean {
  const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return false;

  const levelLessons = getLessonsByLevel(lesson.level);
  const idxInLevel = levelLessons.findIndex((l) => l.id === lessonId);

  if (idxInLevel > 0) {
    const prev = levelLessons[idxInLevel - 1];
    return completedIds.has(prev.id);
  }

  // First lesson of a level
  if (lesson.level === 1) return true;
  const prevLevel = getLessonsByLevel(lesson.level - 1);
  return prevLevel.length > 0 && prevLevel.every((l) => completedIds.has(l.id));
}

export function isLevelUnlocked(level: number, completedIds: Set<string>): boolean {
  if (level === 1) return true;
  const prev = getLessonsByLevel(level - 1);
  return prev.length > 0 && prev.every((l) => completedIds.has(l.id));
}

export function isLevelComplete(level: number, completedIds: Set<string>): boolean {
  const lessons = getLessonsByLevel(level);
  return lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
}
