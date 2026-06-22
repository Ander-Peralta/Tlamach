import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useBudget, useExpenses } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { IngresoCard } from "./IngresoCard";

function thisMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function PresupuestoTab() {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: budget = [] } = useBudget(code);
  const { data: expenses = [] } = useExpenses(code);
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");

  const usedBy = (cat: string) =>
    expenses.filter((e) => thisMonth(e.date) && e.category === cat).reduce((s, e) => s + Number(e.amount), 0);

  const save = async (id: string) => {
    const amt = Number(value);
    if (isNaN(amt) || amt < 0) return;
    await supabase.from("budget_categories").update({ monthly_limit: amt }).eq("id", id);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["budget"] });
    toast.success("Límite actualizado");
  };

  return (
    <div className="space-y-3">
      <IngresoCard />
      {budget.map((b) => {
        const used = usedBy(b.name);
        const limit = Number(b.monthly_limit);
        const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
        const isOver = used > limit && limit > 0;
        return (
          <div key={b.id} className="tlamach-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{b.name}</h3>
              {editing === b.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-9 w-24 rounded-lg"
                  />
                  <Button size="sm" onClick={() => save(b.id)} className="h-9 rounded-lg">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditing(b.id); setValue(String(limit)); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </div>
            <div className="tlamach-progress mb-2">
              <span
                style={{
                  width: `${pct}%`,
                  background: isOver ? "var(--color-destructive)" : pct > 75 ? "var(--color-warning)" : "var(--color-primary)",
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              ${used.toLocaleString()} de ${limit.toLocaleString()}
              {isOver && <span className="text-destructive font-medium ml-2">· Excedido</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}
