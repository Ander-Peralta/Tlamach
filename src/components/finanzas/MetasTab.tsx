import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useGoals } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Plus } from "lucide-react";
import { recordAction } from "@/lib/business";
import { toast } from "sonner";

export function MetasTab() {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: goals = [] } = useGoals(code);
  const activeGoal = goals.find((g) => g.is_active) ?? null;

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("");

  const createGoal = async () => {
    if (!code || !name || !target) return;
    // Deactivate other active goals
    await supabase.from("goals").update({ is_active: false }).eq("user_code", code).eq("is_active", true);
    await supabase.from("goals").insert({
      user_code: code,
      name,
      target_amount: Number(target),
      deadline: deadline || null,
      is_active: true,
    });
    setName(""); setTarget(""); setDeadline(""); setCreating(false);
    qc.invalidateQueries({ queryKey: ["goals"] });
    await recordAction(code, 0);
    toast.success("Meta creada");
  };

  const addContribution = async () => {
    if (!code || !activeGoal || !amount) return;
    await supabase.from("goal_contributions").insert({
      goal_id: activeGoal.id,
      user_code: code,
      amount: Number(amount),
    });
    setAmount(""); setContributing(false);
    await recordAction(code, 15);
    toast.success(`Aporte registrado · +15 XP`);
    qc.invalidateQueries();
  };

  if (!activeGoal && !creating) {
    return (
      <div className="finz-card text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-accent" />
        </div>
        <h3 className="font-semibold mb-2">Crea tu primera meta</h3>
        <p className="text-sm text-muted-foreground mb-4">Algo pequeño y concreto. ¿Qué quieres ahorrar?</p>
        <Button onClick={() => setCreating(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Nueva meta
        </Button>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="finz-card space-y-3">
        <h3 className="font-semibold">Nueva meta</h3>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: Viaje a la playa" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Monto objetivo</label>
          <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="h-11 rounded-xl" placeholder="$" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Fecha límite (opcional)</label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreating(false)} className="flex-1 rounded-xl">Cancelar</Button>
          <Button onClick={createGoal} disabled={!name || !target} className="flex-1 rounded-xl font-semibold">Crear</Button>
        </div>
      </div>
    );
  }

  const saved = activeGoal!.goal_contributions.reduce((s, c) => s + Number(c.amount), 0);
  const targetN = Number(activeGoal!.target_amount);
  const pct = targetN > 0 ? Math.min(100, (saved / targetN) * 100) : 0;
  const remaining = Math.max(0, targetN - saved);

  return (
    <div className="space-y-4">
      <div className="finz-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Meta activa</p>
            <h3 className="font-semibold">{activeGoal!.name}</h3>
          </div>
        </div>
        <div className="finz-progress mb-2">
          <span style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="font-bold">${saved.toLocaleString()}</span>
          <span className="text-muted-foreground">de ${targetN.toLocaleString()}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Te faltan ${remaining.toLocaleString()} para cumplirla.
        </p>
        {contributing ? (
          <div className="space-y-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg font-bold text-center rounded-xl"
              placeholder="$ Monto del aporte"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setContributing(false)} className="flex-1 rounded-xl">Cancelar</Button>
              <Button onClick={addContribution} disabled={!amount} className="flex-1 rounded-xl font-semibold">Guardar aporte</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setContributing(true)} className="w-full h-12 rounded-xl font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Hacer un aporte
          </Button>
        )}
      </div>

      <Button variant="outline" onClick={() => setCreating(true)} className="w-full rounded-xl">
        Cambiar a otra meta
      </Button>
    </div>
  );
}