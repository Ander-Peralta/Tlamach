import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useHabits } from "@/lib/queries";
import { Check } from "lucide-react";
import { recordAction } from "@/lib/business";
import { toast } from "sonner";

export function HabitosTab() {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: habits = [] } = useHabits(code);

  const toggle = async (habitId: string, completed: boolean) => {
    if (!code) return;
    const today = new Date().toISOString().slice(0, 10);
    if (completed) {
      await supabase.from("habit_completions").delete().eq("habit_id", habitId).eq("date", today);
    } else {
      const { error } = await supabase
        .from("habit_completions")
        .insert({ habit_id: habitId, user_code: code, date: today });
      if (!error) {
        await recordAction(code, 5);
        toast.success("Hábito hecho · +5 XP");
      }
    }
    qc.invalidateQueries({ queryKey: ["habits"] });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground px-1">
        Marca los hábitos que cumpliste hoy.
      </p>
      {habits.map((h) => (
        <button
          key={h.id}
          onClick={() => toggle(h.id, h.completedToday)}
          className={`w-full finz-card flex items-center gap-3 text-left transition-all ${
            h.completedToday ? "bg-success/10 border border-success/30" : ""
          }`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
              h.completedToday ? "bg-success border-success text-success-foreground" : "border-border bg-card"
            }`}
          >
            {h.completedToday && <Check className="w-5 h-5" />}
          </div>
          <span className={`font-medium ${h.completedToday ? "text-success" : ""}`}>{h.name}</span>
        </button>
      ))}
    </div>
  );
}