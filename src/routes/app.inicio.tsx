import { createFileRoute, Link } from "@tanstack/react-router";
import { useUserCode } from "@/lib/user-store";
import { useUser, useExpenses, useBudget, useGoals, useLessonProgress } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { StreakChip } from "@/components/StreakChip";
import { Button } from "@/components/ui/button";
import { ALL_LESSONS } from "@/data/lessons";
import { RANK_NAMES } from "@/lib/business";
import { ArrowRight, Target, Wallet, BookOpen } from "lucide-react";

export const Route = createFileRoute("/app/inicio")({ component: Inicio });

function thisMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function Inicio() {
  const code = useUserCode();
  const { data: user } = useUser(code);
  const { data: expenses = [] } = useExpenses(code);
  const { data: budget = [] } = useBudget(code);
  const { data: goals = [] } = useGoals(code);
  const { data: progress = new Set<string>() } = useLessonProgress(code);

  const monthExpenses = expenses.filter((e) => thisMonth(e.date));
  const totalSpent = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalLimit = budget.reduce((s, b) => s + Number(b.monthly_limit), 0);
  const budgetPct = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  const activeGoal = goals.find((g) => g.is_active);
  const goalSaved = activeGoal
    ? activeGoal.goal_contributions.reduce((s, c) => s + Number(c.amount), 0)
    : 0;
  const goalPct = activeGoal ? Math.min(100, (goalSaved / Number(activeGoal.target_amount)) * 100) : 0;

  const nextLesson = ALL_LESSONS.find((l) => !progress.has(l.id)) ?? ALL_LESSONS[ALL_LESSONS.length - 1];
  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? "Buenos días" : greetHour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div>
      <PageHeader
        title={`${greet} 👋`}
        subtitle={user ? RANK_NAMES[user.current_rank] : "Bienvenido"}
        right={<StreakChip days={user?.current_streak ?? 0} />}
      />

      <div className="px-5 space-y-4">
        {/* Continue lesson */}
        <Link
          to="/app/aprender/leccion/$id"
          params={{ id: nextLesson.id }}
          className="block finz-card bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs opacity-80 mb-1">Continuar lección</p>
              <h3 className="font-semibold mb-2">{nextLesson.title}</h3>
              <div className="flex items-center text-sm font-medium">
                Empezar <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>

        {/* Budget */}
        <Link to="/app/finanzas" className="block finz-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Presupuesto del mes</h3>
            </div>
            <span className="text-sm text-muted-foreground">{Math.round(budgetPct)}%</span>
          </div>
          <div className="finz-progress mb-2">
            <span style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? "var(--color-destructive)" : budgetPct > 75 ? "var(--color-warning)" : "var(--color-primary)" }} />
          </div>
          <p className="text-sm text-muted-foreground">
            ${totalSpent.toLocaleString()} de ${totalLimit.toLocaleString()}
          </p>
        </Link>

        {/* Goal */}
        <Link to="/app/finanzas" className="block finz-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Meta activa</h3>
            </div>
            {activeGoal && <span className="text-sm text-muted-foreground">{Math.round(goalPct)}%</span>}
          </div>
          {activeGoal ? (
            <>
              <p className="font-medium mb-2">{activeGoal.name}</p>
              <div className="finz-progress mb-2">
                <span style={{ width: `${goalPct}%`, background: "var(--color-accent)" }} />
              </div>
              <p className="text-sm text-muted-foreground">
                ${goalSaved.toLocaleString()} de ${Number(activeGoal.target_amount).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no tienes meta activa. Crea una en Finanzas.</p>
          )}
        </Link>

        <div className="finz-card flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tu XP total</p>
            <p className="text-2xl font-bold">{user?.total_xp ?? 0}</p>
          </div>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/app/perfil">Ver perfil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}